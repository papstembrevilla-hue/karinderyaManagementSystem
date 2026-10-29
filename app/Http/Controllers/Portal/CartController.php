<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\AddToCartRequest;
use App\Http\Requests\Portal\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\MenuItem;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(): Response
    {
        return Inertia::render('Portal/Cart', [
            'cart' => $this->cart->summary(request()->user()),
        ]);
    }

    public function store(AddToCartRequest $request): RedirectResponse
    {
        $menuItem = MenuItem::query()->findOrFail($request->integer('menu_item_id'));

        $this->cart->add(
            $request->user(),
            $menuItem,
            $request->integer('quantity', 1) ?: 1,
        );

        return back()->with('success', '"'.$menuItem->name.'" added to your cart.');
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        Gate::authorize('update', $cartItem);

        $this->cart->updateQuantity($request->user(), $cartItem, $request->integer('quantity'));

        return back()->with('success', 'Cart updated.');
    }

    public function destroy(CartItem $cartItem): RedirectResponse
    {
        Gate::authorize('delete', $cartItem);

        $name = $cartItem->menuItem?->name ?? 'Item';
        $this->cart->remove(request()->user(), $cartItem);

        return back()->with('success', '"'.$name.'" removed from your cart.');
    }

    public function clear(): RedirectResponse
    {
        $this->cart->clear(request()->user());

        return redirect()
            ->route('cart.index')
            ->with('success', 'Your cart has been cleared.');
    }
}
