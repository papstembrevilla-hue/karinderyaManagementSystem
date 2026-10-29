<?php

namespace Tests\Feature\Portal;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrdersTest extends TestCase
{
    private function makeOrder(User $user, string $status = Order::STATUS_PENDING, array $attributes = []): Order
    {
        return Order::create(array_merge([
            'reference' => 'KMS-'.Str::upper(Str::random(8)),
            'checkout_token' => Str::random(32),
            'user_id' => $user->id,
            'status' => $status,
            'fulfillment_method' => Order::FULFILLMENT_PICKUP,
            'payment_method' => Order::PAYMENT_CASH,
            'payment_status' => Order::PAYMENT_UNPAID,
            'subtotal' => 100,
            'delivery_fee' => 0,
            'discount' => 0,
            'total' => 100,
            'recipient_name' => $user->name,
            'contact_phone' => '09171234567',
        ], $attributes));
    }

    public function test_order_history_only_lists_the_customers_own_orders()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $own = $this->makeOrder($user);
        $foreign = $this->makeOrder($other);

        $this->actingAs($user)
            ->get('/orders')
            ->assertOk()
            ->assertSee($own->reference)
            ->assertDontSee($foreign->reference);
    }

    public function test_customer_cannot_view_another_customers_order()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $foreign = $this->makeOrder($other);

        $this->actingAs($user)->get(route('orders.show', $foreign))->assertForbidden();
    }

    public function test_customer_can_cancel_a_pending_order()
    {
        $user = User::factory()->create();
        $order = $this->makeOrder($user);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order), ['reason' => 'Changed my mind'])
            ->assertRedirect();

        $order->refresh();

        $this->assertSame(Order::STATUS_CANCELLED, $order->status);
        $this->assertSame('Changed my mind', $order->cancellation_reason);
        $this->assertNotNull($order->cancelled_at);
        $this->assertSame(1, $order->statusHistories()->count());
    }

    public function test_cancellation_requires_a_reason()
    {
        $user = User::factory()->create();
        $order = $this->makeOrder($user);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order), ['reason' => ''])
            ->assertSessionHasErrors('reason');

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->status);
    }

    public function test_a_confirmed_order_can_no_longer_be_cancelled_by_the_customer()
    {
        $user = User::factory()->create();
        $order = $this->makeOrder($user, Order::STATUS_CONFIRMED);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order), ['reason' => 'Too late'])
            ->assertForbidden();

        $this->assertSame(Order::STATUS_CONFIRMED, $order->fresh()->status);
    }

    public function test_customer_cannot_cancel_another_customers_order()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $foreign = $this->makeOrder($other);

        $this->actingAs($user)
            ->post(route('orders.cancel', $foreign), ['reason' => 'Not mine'])
            ->assertForbidden();

        $this->assertSame(Order::STATUS_PENDING, $foreign->fresh()->status);
    }

    public function test_reorder_adds_available_items_and_skips_unavailable_ones()
    {
        $user = User::factory()->create();

        $available = MenuItem::factory()->create(['name' => 'Pancit', 'is_available' => true]);
        $unavailable = MenuItem::factory()->create(['name' => 'Bilo-bilo', 'is_available' => false]);

        $order = $this->makeOrder($user);

        $order->items()->create([
            'menu_item_id' => $available->id,
            'item_name' => 'Pancit',
            'unit_price' => 80,
            'quantity' => 2,
            'line_total' => 160,
        ]);
        $order->items()->create([
            'menu_item_id' => $unavailable->id,
            'item_name' => 'Bilo-bilo',
            'unit_price' => 40,
            'quantity' => 1,
            'line_total' => 40,
        ]);

        $this->actingAs($user)
            ->post(route('orders.reorder', $order))
            ->assertRedirect(route('cart.index'))
            ->assertSessionHas(
                'success',
                '2 item(s) from '.$order->reference.' were added to your cart. Unavailable: Bilo-bilo.',
            );

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'menu_item_id' => $available->id,
            'quantity' => 2,
        ]);

        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $user->id,
            'menu_item_id' => $unavailable->id,
        ]);

        $this->assertSame(2, $order->items()->count());
    }

    public function test_reorder_fails_when_nothing_is_available()
    {
        $user = User::factory()->create();
        $unavailable = MenuItem::factory()->create(['is_available' => false]);

        $order = $this->makeOrder($user);
        $order->items()->create([
            'menu_item_id' => $unavailable->id,
            'item_name' => 'Bilo-bilo',
            'unit_price' => 40,
            'quantity' => 1,
            'line_total' => 40,
        ]);

        $this->actingAs($user)
            ->post(route('orders.reorder', $order))
            ->assertSessionHasErrors('reorder');

        $this->assertSame(0, $user->cartItems()->count());
    }
}
