<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreCheckoutRequest;
use App\Models\Order;
use App\Services\CartService;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly CheckoutService $checkout,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $summary = $this->cart->summary($request->user());

        if ($summary['items']->isEmpty()) {
            return redirect()
                ->route('cart.index')
                ->with('error', 'Your cart is empty. Add something from the menu first.');
        }

        $token = $request->session()->get('checkout_token');

        if (! is_string($token) || $token === '') {
            $token = Str::random(40);
            $request->session()->put('checkout_token', $token);
        }

        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->get();

        return Inertia::render('Portal/Checkout', [
            'cart' => $summary,
            'addresses' => $addresses,
            'checkoutToken' => $token,
        ]);
    }

    public function store(StoreCheckoutRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $sessionToken = $request->session()->get('checkout_token');

        if (
            ! is_string($sessionToken)
            || ! hash_equals($sessionToken, $validated['checkout_token'])
        ) {
            throw ValidationException::withMessages([
                'checkout_token' => 'Your checkout session expired. Review your cart and try again.',
            ]);
        }

        $data = $validated;

        if (! empty($validated['address_id'])) {
            $address = $request->user()
                ->addresses()
                ->findOrFail($validated['address_id']);

            $data['recipient_name'] = $address->recipient_name;
            $data['contact_phone'] = $address->phone;
            $data['delivery_address'] = $address->address;
        }

        $result = $this->checkout->placeOrder(
            $request->user(),
            $data,
            $validated['checkout_token'],
        );

        $request->session()->forget('checkout_token');

        /** @var Order $order */
        $order = $result['order'];

        if ($result['created']) {
            return redirect()
                ->route('orders.show', $order)
                ->with('success', 'Order '.$order->reference.' has been placed.')
                ->with('order_placed', $order->reference);
        }

        return redirect()
            ->route('orders.show', $order)
            ->with('success', 'This order was already submitted as '.$order->reference.'.');
    }
}
