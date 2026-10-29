<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * Create one order from the customer's cart.
     *
     * @param  array{
     *     fulfillment_method: string,
     *     payment_method: string,
     *     recipient_name: string|null,
     *     contact_phone: string,
     *     delivery_address: string|null,
     *     notes: string|null
     * }  $data
     * @return array{order: Order, created: bool}
     */
    public function placeOrder(User $user, array $data, string $checkoutToken): array
    {
        $existing = Order::query()
            ->where('checkout_token', $checkoutToken)
            ->first();

        if ($existing) {
            return ['order' => $existing, 'created' => false];
        }

        try {
            $order = DB::transaction(function () use ($user, $data, $checkoutToken) {
                $cartItems = CartItem::query()
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->get();

                if ($cartItems->isEmpty()) {
                    throw ValidationException::withMessages([
                        'cart' => 'Your cart is empty.',
                    ]);
                }

                $menuItems = MenuItem::query()
                    ->whereIn('id', $cartItems->pluck('menu_item_id'))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $subtotal = 0.0;
                $lines = [];

                foreach ($cartItems as $cartItem) {
                    $menuItem = $menuItems->get($cartItem->menu_item_id);

                    if (! $menuItem || ! $menuItem->is_available) {
                        throw ValidationException::withMessages([
                            'cart' => '"'.($menuItem?->name ?? 'An item').'" is no longer available. Please remove it from your cart.',
                        ]);
                    }

                    if ($cartItem->quantity < 1 || $cartItem->quantity > CartService::MAX_QUANTITY) {
                        throw ValidationException::withMessages([
                            'cart' => 'One of the quantities in your cart is invalid.',
                        ]);
                    }

                    $unitPrice = round((float) $menuItem->price, 2);
                    $lineTotal = round($unitPrice * $cartItem->quantity, 2);
                    $subtotal = round($subtotal + $lineTotal, 2);

                    $lines[] = [
                        'menu_item_id' => $menuItem->id,
                        'item_name' => $menuItem->name,
                        'unit_price' => $unitPrice,
                        'quantity' => $cartItem->quantity,
                        'line_total' => $lineTotal,
                    ];
                }

                $deliveryFee = $data['fulfillment_method'] === Order::FULFILLMENT_DELIVERY
                    ? round((float) config('karinderya.delivery_fee', 0), 2)
                    : 0.0;

                $total = round($subtotal + $deliveryFee, 2);

                $order = Order::create([
                    'reference' => $this->nextReference(),
                    'checkout_token' => $checkoutToken,
                    'user_id' => $user->id,
                    'customer_id' => null,
                    'status' => Order::STATUS_PENDING,
                    'fulfillment_method' => $data['fulfillment_method'],
                    'payment_method' => $data['payment_method'],
                    'payment_status' => Order::PAYMENT_UNPAID,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'discount' => 0,
                    'total' => $total,
                    'recipient_name' => $data['recipient_name'] ?? null,
                    'contact_phone' => $data['contact_phone'],
                    'delivery_address' => $data['delivery_address'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]);

                foreach ($lines as $line) {
                    $order->items()->create($line);
                }

                $order->statusHistories()->create([
                    'status' => Order::STATUS_PENDING,
                    'note' => 'Order placed by customer.',
                    'changed_by' => $user->id,
                ]);

                CartItem::query()->where('user_id', $user->id)->delete();

                return $order;
            });
        } catch (QueryException $exception) {
            // The unique checkout_token guard prevents a double submission
            // from creating a second order. Return the first one instead.
            $existing = Order::query()
                ->where('checkout_token', $checkoutToken)
                ->first();

            if ($existing) {
                return ['order' => $existing, 'created' => false];
            }

            throw $exception;
        }

        return ['order' => $order, 'created' => true];
    }

    public function transition(
        Order $order,
        string $to,
        ?int $changedBy = null,
        ?string $note = null,
        ?string $cancellationReason = null,
    ): Order {
        $allowed = Order::TRANSITIONS[$order->status] ?? [];

        if (! in_array($to, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => 'That status change is not allowed for this order.',
            ]);
        }

        return DB::transaction(function () use ($order, $to, $changedBy, $note, $cancellationReason) {
            $order->status = $to;

            if ($to === Order::STATUS_CANCELLED) {
                $order->cancelled_at = now();
                $order->cancellation_reason = $cancellationReason ?: $note;
            }

            $order->save();

            $order->statusHistories()->create([
                'status' => $to,
                'note' => $note,
                'changed_by' => $changedBy,
            ]);

            return $order->refresh();
        });
    }

    public function customerCancel(Order $order, User $user, string $reason): Order
    {
        if (! $order->isCancellable()) {
            throw ValidationException::withMessages([
                'status' => 'This order can no longer be cancelled. Please contact the store.',
            ]);
        }

        return $this->transition(
            $order,
            Order::STATUS_CANCELLED,
            $user->id,
            'Cancellation requested by customer.',
            $reason,
        );
    }

    public function updatePayment(Order $order, string $paymentStatus, ?string $reference): Order
    {
        if (! in_array($paymentStatus, [Order::PAYMENT_UNPAID, Order::PAYMENT_PAID], true)) {
            throw ValidationException::withMessages([
                'payment_status' => 'Unsupported payment status.',
            ]);
        }

        $order->payment_status = $paymentStatus;
        $order->payment_reference = $reference ?: null;
        $order->save();

        return $order->refresh();
    }

    private function nextReference(): string
    {
        do {
            $reference = 'KMS-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
