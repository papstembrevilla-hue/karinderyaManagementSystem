<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\CancelOrderRequest;
use App\Models\Order;
use App\Services\CartService;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly CheckoutService $checkout,
    ) {}

    public function index(Request $request): Response
    {
        $status = (string) $request->input('status', '');
        $search = trim((string) $request->input('q', ''));

        $orders = $request->user()
            ->orders()
            ->withCount('items')
            ->when(
                in_array($status, Order::STATUSES, true),
                fn ($query) => $query->where('status', $status),
            )
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('reference', 'like', "%{$search}%")
                        ->orWhere('recipient_name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Portal/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'status' => $status,
                'q' => $search,
            ],
            'statuses' => Order::STATUSES,
        ]);
    }

    public function show(Order $order): Response
    {
        Gate::authorize('view', $order);

        $order->load([
            'items',
            'statusHistories' => fn ($query) => $query->oldest('created_at')->oldest('id'),
            'statusHistories.changedByUser:id,name',
        ]);

        return Inertia::render('Portal/Orders/Show', [
            'order' => $order,
            'canCancel' => $order->isCancellable(),
            'wasJustPlaced' => session('order_placed') === $order->reference,
        ]);
    }

    public function cancel(CancelOrderRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('cancel', $order);

        $this->checkout->customerCancel($order, $request->user(), $request->validated('reason'));

        return back()->with('success', 'Your cancellation request has been recorded.');
    }

    public function reorder(Order $order): RedirectResponse
    {
        Gate::authorize('reorder', $order);

        $result = $this->cart->reorder(request()->user(), $order);

        $message = $result['added'].' item(s) from '.$order->reference.' were added to your cart.';

        if ($result['skipped'] !== []) {
            $message .= ' Unavailable: '.implode(', ', $result['skipped']).'.';
        }

        return redirect()
            ->route('cart.index')
            ->with('success', $message);
    }
}
