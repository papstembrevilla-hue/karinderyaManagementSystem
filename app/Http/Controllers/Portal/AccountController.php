<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $recentOrders = $user->orders()
            ->withCount('items')
            ->latest()
            ->limit(3)
            ->get();

        return Inertia::render('Portal/Account', [
            'recentOrders' => $recentOrders,
            'cart' => $this->cart->summary($user),
            'addressCount' => $user->addresses()->count(),
            'defaultAddress' => $user->addresses()
                ->orderByDesc('is_default')
                ->orderBy('id')
                ->first(),
        ]);
    }
}
