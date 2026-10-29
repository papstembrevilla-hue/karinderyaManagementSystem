<?php

namespace Tests\Feature\Portal;

use App\Models\Address;
use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    private function checkoutPayload(string $token, array $overrides = []): array
    {
        return array_merge([
            'checkout_token' => $token,
            'fulfillment_method' => 'pickup',
            'payment_method' => 'cash',
            'contact_phone' => '09171234567',
            'notes' => null,
        ], $overrides);
    }

    public function test_guests_are_redirected_to_login()
    {
        $this->get('/checkout')->assertRedirect('/login');
        $this->post('/checkout', [])->assertRedirect('/login');
    }

    public function test_empty_cart_redirects_back_to_the_cart()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/checkout')
            ->assertRedirect(route('cart.index'));
    }

    public function test_checkout_creates_one_order_with_database_prices()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create(['name' => 'Pork Adobo', 'price' => 100]);
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ]);

        $token = 'checkout-token-1234567890';

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token, [
                'total' => 1,
                'subtotal' => 1,
                'items' => [],
            ]))
            ->assertRedirect();

        $this->assertDatabaseCount('orders', 1);

        $order = Order::firstOrFail();

        $this->assertSame($user->id, $order->user_id);
        $this->assertSame(Order::STATUS_PENDING, $order->status);
        $this->assertSame(Order::PAYMENT_UNPAID, $order->payment_status);
        $this->assertSame('200.00', $order->subtotal);
        $this->assertSame('200.00', $order->total);

        $this->assertSame(1, $order->items()->count());
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'menu_item_id' => $item->id,
            'item_name' => 'Pork Adobo',
            'unit_price' => 100,
            'quantity' => 2,
            'line_total' => 200,
        ]);

        $this->assertSame(1, $order->statusHistories()->count());
        $this->assertSame(0, $user->cartItems()->count());
    }

    public function test_duplicate_submission_does_not_create_a_second_order()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create(['price' => 60]);
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $token = 'duplicate-token-abcdefghij';

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token))
            ->assertRedirect();

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token))
            ->assertRedirect();

        $this->assertDatabaseCount('orders', 1);
    }

    public function test_a_stale_checkout_token_is_rejected()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create();
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user)
            ->withSession(['checkout_token' => 'real-token'])
            ->post(route('checkout.store'), $this->checkoutPayload('different-token'))
            ->assertSessionHasErrors('checkout_token');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_unavailable_items_block_checkout()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create(['is_available' => false]);
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $token = 'unavailable-token-123';

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token))
            ->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(1, $user->cartItems()->count());
    }

    public function test_delivery_requires_an_address_and_applies_the_delivery_fee()
    {
        config(['karinderya.delivery_fee' => 25]);

        $user = User::factory()->create();
        $item = MenuItem::factory()->create(['price' => 100]);
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $token = 'delivery-token-123';

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token, [
                'fulfillment_method' => 'delivery',
                'contact_phone' => '',
            ]))
            ->assertSessionHasErrors(['recipient_name', 'delivery_address', 'contact_phone']);

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token, [
                'fulfillment_method' => 'delivery',
                'recipient_name' => 'Ana Cruz',
                'delivery_address' => '12 Mabini St, Barangay San Isidro',
            ]))
            ->assertRedirect();

        $order = Order::firstOrFail();

        $this->assertSame('25.00', $order->delivery_fee);
        $this->assertSame('125.00', $order->total);
        $this->assertSame('Ana Cruz', $order->recipient_name);
    }

    public function test_a_saved_address_must_belong_to_the_customer()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $otherAddress = Address::create([
            'user_id' => $other->id,
            'label' => 'Home',
            'recipient_name' => 'Other Person',
            'phone' => '09000000000',
            'address' => 'Somewhere else',
            'is_default' => true,
        ]);
        $item = MenuItem::factory()->create();
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $token = 'address-token-123';

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token, [
                'fulfillment_method' => 'delivery',
                'recipient_name' => 'Ana Cruz',
                'delivery_address' => '12 Mabini St',
                'address_id' => $otherAddress->id,
            ]))
            ->assertSessionHasErrors('address_id');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_saved_address_supplies_the_delivery_details()
    {
        $user = User::factory()->create();
        $address = Address::create([
            'user_id' => $user->id,
            'label' => 'Home',
            'recipient_name' => 'Ana Cruz',
            'phone' => '09171112222',
            'address' => '12 Mabini St, Barangay San Isidro',
            'is_default' => true,
        ]);
        $item = MenuItem::factory()->create();
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $token = 'saved-address-token';

        $this->actingAs($user)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), $this->checkoutPayload($token, [
                'fulfillment_method' => 'delivery',
                'address_id' => $address->id,
                'recipient_name' => 'Ignored Name',
                'contact_phone' => '09999999999',
                'delivery_address' => 'Ignored address',
            ]))
            ->assertRedirect();

        $order = Order::firstOrFail();

        $this->assertSame('Ana Cruz', $order->recipient_name);
        $this->assertSame('09171112222', $order->contact_phone);
        $this->assertSame('12 Mabini St, Barangay San Isidro', $order->delivery_address);
    }
}
