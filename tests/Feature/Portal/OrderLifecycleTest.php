<?php

namespace Tests\Feature\Portal;

use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderLifecycleTest extends TestCase
{
    public function test_an_order_runs_from_checkout_to_completion()
    {
        $customer = User::factory()->create(['name' => 'Ana Cruz']);
        $admin = User::factory()->admin()->create(['name' => 'KMS Admin']);

        $item = MenuItem::factory()->create(['name' => 'Tapsilog', 'price' => 95]);
        CartItem::create([
            'user_id' => $customer->id,
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ]);

        $token = (string) Str::random(40);

        $response = $this->actingAs($customer)
            ->withSession(['checkout_token' => $token])
            ->post(route('checkout.store'), [
                'checkout_token' => $token,
                'fulfillment_method' => Order::FULFILLMENT_PICKUP,
                'payment_method' => Order::PAYMENT_CASH,
                'contact_phone' => '09171234567',
            ]);

        $order = Order::firstOrFail();

        $response
            ->assertRedirect(route('orders.show', $order))
            ->assertSessionHas('order_placed', $order->reference);

        $this->assertSame(Order::STATUS_PENDING, $order->status);
        $this->assertSame('190.00', $order->total);
        $this->assertSame(0, $customer->cartItems()->count());

        $this->actingAs($customer)
            ->get(route('orders.show', $order))
            ->assertOk()
            ->assertSee($order->reference);

        foreach ([
            Order::STATUS_CONFIRMED,
            Order::STATUS_PREPARING,
            Order::STATUS_READY,
            Order::STATUS_COMPLETED,
        ] as $status) {
            $this->actingAs($admin)
                ->patch(route('admin.orders.status', $order), [
                    'status' => $status,
                    'note' => 'Moved to '.$status,
                ])
                ->assertRedirect();
        }

        $this->actingAs($admin)
            ->patch(route('admin.orders.payment', $order), [
                'payment_status' => Order::PAYMENT_PAID,
                'payment_reference' => 'CASH-0001',
            ])
            ->assertRedirect();

        $order->refresh();

        $this->assertSame(Order::STATUS_COMPLETED, $order->status);
        $this->assertSame(Order::PAYMENT_PAID, $order->payment_status);
        $this->assertSame('CASH-0001', $order->payment_reference);
        $this->assertSame(5, $order->statusHistories()->count());

        $this->assertSame(
            4,
            OrderStatusHistory::query()
                ->where('order_id', $order->id)
                ->where('changed_by', $admin->id)
                ->count(),
        );

        $this->actingAs($customer)
            ->post(route('orders.cancel', $order), ['reason' => 'Too late now'])
            ->assertForbidden();

        $this->actingAs($customer)
            ->get(route('orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Portal/Orders/Show')
                ->where('order.status', Order::STATUS_COMPLETED)
                ->where('order.payment_status', Order::PAYMENT_PAID)
                ->where('order.status_histories.4.note', 'Moved to completed')
                ->where('canCancel', false));
    }

    public function test_completed_orders_cannot_be_moved_again()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();

        $order = Order::create([
            'reference' => 'KMS-'.Str::upper(Str::random(8)),
            'checkout_token' => Str::random(32),
            'user_id' => $customer->id,
            'status' => Order::STATUS_COMPLETED,
            'fulfillment_method' => Order::FULFILLMENT_PICKUP,
            'payment_method' => Order::PAYMENT_CASH,
            'payment_status' => Order::PAYMENT_UNPAID,
            'subtotal' => 100,
            'total' => 100,
            'contact_phone' => '09171234567',
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $order), [
                'status' => Order::STATUS_CANCELLED,
                'cancellation_reason' => 'Should be rejected',
            ])
            ->assertSessionHasErrors('status');

        $this->assertSame(Order::STATUS_COMPLETED, $order->fresh()->status);
    }
}
