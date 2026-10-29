<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderPaymentRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly CheckoutService $checkout) {}

    public function index(Request $request): Response
    {
        $status = (string) $request->input('status', '');
        $search = trim((string) $request->input('q', ''));

        $orders = Order::query()
            ->with(['user:id,name,email,phone'])
            ->withCount('items')
            ->when(
                in_array($status, Order::STATUSES, true),
                fn ($query) => $query->where('status', $status),
            )
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('reference', 'like', "%{$search}%")
                        ->orWhere('recipient_name', 'like', "%{$search}%")
                        ->orWhere('contact_phone', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($user) => $user->where('email', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
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
        $order->load([
            'user:id,name,email,phone',
            'items',
            'statusHistories' => fn ($query) => $query->oldest('created_at')->oldest('id'),
            'statusHistories.changedByUser:id,name',
        ]);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'nextStatuses' => $order->nextStatuses(),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $this->checkout->transition(
            $order,
            $request->validated('status'),
            $request->user()->id,
            $request->validated('note'),
            $request->validated('cancellation_reason'),
        );

        return back()->with('success', 'Order status updated.');
    }

    public function updatePayment(UpdateOrderPaymentRequest $request, Order $order): RedirectResponse
    {
        $this->checkout->updatePayment(
            $order,
            $request->validated('payment_status'),
            $request->validated('payment_reference'),
        );

        return back()->with('success', 'Payment details updated.');
    }
}
