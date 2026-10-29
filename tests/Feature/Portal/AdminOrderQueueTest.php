<?php

namespace Tests\Feature\Portal;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminOrderQueueTest extends TestCase
{
    private function makeOrder(User $customer, string $status = Order::STATUS_PENDING): Order
    {
        return Order::create([
            'reference' => 'KMS-'.Str::upper(Str::random(8)),
            'checkout_token' => Str::random(32),
            'user_id' => $customer->id,
            'status' => $status,
            'fulfillment_method' => Order::FULFILLMENT_PICKUP,
            'payment_method' => Order::PAYMENT_CASH,
            'payment_status' => Order::PAYMENT_UNPAID,
            'subtotal' => 100,
            'delivery_fee' => 0,
            'discount' => 0,
            'total' => 100,
            'recipient_name' => $customer->name,
            'contact_phone' => '09171234567',
        ]);
    }

    public function test_regular_customers_cannot_access_the_admin_order_queue()
    {
        $user = User::factory()->create();
        $order = $this->makeOrder($user);

        $this->actingAs($user)->get('/admin/orders')->assertForbidden();
        $this->actingAs($user)
            ->patch(route('admin.orders.status', $order), ['status' => 'confirmed'])
            ->assertForbidden();
    }

    public function test_admin_can_view_orders_and_their_details()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create(['name' => 'Ana Cruz']);
        $order = $this->makeOrder($customer);

        $menuItem = MenuItem::factory()->create(['name' => 'Pancit']);
        $order->items()->create([
            'menu_item_id' => $menuItem->id,
            'item_name' => 'Pancit',
            'unit_price' => 100,
            'quantity' => 1,
            'line_total' => 100,
        ]);

        $this->actingAs($admin)
            ->get('/admin/orders')
            ->assertOk()
            ->assertSee($order->reference)
            ->assertSee('Ana Cruz');

        $this->actingAs($admin)
            ->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertSee($order->reference)
            ->assertSee('Pancit');
    }

    public function test_admin_can_advance_an_order_status()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $order = $this->makeOrder($customer);

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $order), [
                'status' => Order::STATUS_CONFIRMED,
                'note' => 'We received your order.',
            ])
            ->assertRedirect();

        $order->refresh();

        $this->assertSame(Order::STATUS_CONFIRMED, $order->status);
        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'status' => Order::STATUS_CONFIRMED,
            'note' => 'We received your order.',
            'changed_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.orders.show', $order))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show')
                ->where('order.status_histories.0.changed_by_user.name', $admin->name));
    }

    public function test_admin_cannot_skip_statuses()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $order = $this->makeOrder($customer);

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $order), ['status' => Order::STATUS_COMPLETED])
            ->assertSessionHasErrors('status');

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->status);
    }

    public function test_admin_cancellation_records_a_reason()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $order = $this->makeOrder($customer);

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $order), [
                'status' => Order::STATUS_CANCELLED,
                'cancellation_reason' => 'Out of stock',
            ])
            ->assertRedirect();

        $order->refresh();

        $this->assertSame(Order::STATUS_CANCELLED, $order->status);
        $this->assertSame('Out of stock', $order->cancellation_reason);
        $this->assertNotNull($order->cancelled_at);
    }

    public function test_admin_can_verify_payment()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $order = $this->makeOrder($customer);

        $this->actingAs($admin)
            ->patch(route('admin.orders.payment', $order), [
                'payment_status' => Order::PAYMENT_PAID,
                'payment_reference' => 'GC-123456',
            ])
            ->assertRedirect();

        $order->refresh();

        $this->assertSame(Order::PAYMENT_PAID, $order->payment_status);
        $this->assertSame('GC-123456', $order->payment_reference);
    }

    public function test_unsupported_payment_status_is_rejected()
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $order = $this->makeOrder($customer);

        $this->actingAs($admin)
            ->patch(route('admin.orders.payment', $order), ['payment_status' => 'refunded'])
            ->assertSessionHasErrors('payment_status');

        $this->assertSame(Order::PAYMENT_UNPAID, $order->fresh()->payment_status);
    }
}
