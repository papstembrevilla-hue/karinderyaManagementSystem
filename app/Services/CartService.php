<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public const MAX_QUANTITY = 99;

    /**
     * @return Collection<int, CartItem>
     */
    public function items(User $user): Collection
    {
        return CartItem::query()
            ->with(['menuItem.category:id,name'])
            ->where('user_id', $user->id)
            ->orderBy('id')
            ->get();
    }

    /**
     * Cart contents recalculated from current menu prices.
     *
     * @return array{
     *     items: Collection<int, array<string, mixed>>,
     *     item_count: int,
     *     subtotal: float,
     *     has_unavailable: bool
     * }
     */
    public function summary(User $user): array
    {
        $items = $this->items($user)->map(function (CartItem $item) {
            $menuItem = $item->menuItem;
            $unitPrice = $menuItem ? (float) $menuItem->price : 0.0;
            $lineTotal = round($unitPrice * $item->quantity, 2);

            return [
                'id' => $item->id,
                'menu_item_id' => $item->menu_item_id,
                'name' => $menuItem?->name ?? 'Unavailable item',
                'photo' => $menuItem?->photo,
                'category' => $menuItem?->category?->name,
                'unit_price' => $unitPrice,
                'quantity' => $item->quantity,
                'line_total' => $lineTotal,
                'is_available' => (bool) ($menuItem?->is_available),
            ];
        })->values();

        return [
            'items' => $items,
            'item_count' => (int) $items->sum('quantity'),
            'subtotal' => round((float) $items->sum('line_total'), 2),
            'has_unavailable' => $items->contains(fn (array $item) => ! $item['is_available']),
        ];
    }

    public function count(User $user): int
    {
        return (int) CartItem::query()
            ->where('user_id', $user->id)
            ->sum('quantity');
    }

    public function add(User $user, MenuItem $menuItem, int $quantity): CartItem
    {
        if (! $menuItem->is_available) {
            throw ValidationException::withMessages([
                'menu_item_id' => 'This item is not available right now.',
            ]);
        }

        try {
            return DB::transaction(function () use ($user, $menuItem, $quantity) {
                $item = CartItem::query()
                    ->where('user_id', $user->id)
                    ->where('menu_item_id', $menuItem->id)
                    ->lockForUpdate()
                    ->first();

                if ($item) {
                    $item->quantity = min(self::MAX_QUANTITY, $item->quantity + $quantity);
                    $item->save();

                    return $item;
                }

                return CartItem::create([
                    'user_id' => $user->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => min(self::MAX_QUANTITY, $quantity),
                ]);
            });
        } catch (QueryException) {
            // A concurrent request inserted the same row between the lock
            // check and the insert; merge into the existing row instead.
            $item = CartItem::query()
                ->where('user_id', $user->id)
                ->where('menu_item_id', $menuItem->id)
                ->firstOrFail();

            $item->quantity = min(self::MAX_QUANTITY, $item->quantity + $quantity);
            $item->save();

            return $item;
        }
    }

    public function updateQuantity(User $user, CartItem $item, int $quantity): CartItem
    {
        $this->assertOwner($user, $item);

        $item->quantity = min(self::MAX_QUANTITY, max(1, $quantity));
        $item->save();

        return $item;
    }

    public function remove(User $user, CartItem $item): void
    {
        $this->assertOwner($user, $item);

        $item->delete();
    }

    public function clear(User $user): void
    {
        CartItem::query()->where('user_id', $user->id)->delete();
    }

    /**
     * Add available items from a past order to the current cart.
     * The original order is never modified.
     *
     * @return array{added: int, skipped: list<string>}
     */
    public function reorder(User $user, Order $order): array
    {
        $order->loadMissing('items.menuItem');

        $added = 0;
        $skipped = [];

        foreach ($order->items as $orderItem) {
            $menuItem = $orderItem->menuItem;

            if (! $menuItem || ! $menuItem->is_available) {
                $skipped[] = $orderItem->item_name;

                continue;
            }

            $this->add($user, $menuItem, max(1, $orderItem->quantity));
            $added += $orderItem->quantity;
        }

        if ($added === 0) {
            throw ValidationException::withMessages([
                'reorder' => 'None of the items from this order are available right now.',
            ]);
        }

        return ['added' => $added, 'skipped' => $skipped];
    }

    private function assertOwner(User $user, CartItem $item): void
    {
        if ($item->user_id !== $user->id) {
            abort(404);
        }
    }
}
