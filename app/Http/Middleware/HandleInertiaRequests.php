<?php

namespace App\Http\Middleware;

use App\Models\CartItem;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = $request->user();

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'brand' => config('karinderya.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
            ],
            'cartCount' => $user && $user->role === 'user'
                ? (int) CartItem::query()->where('user_id', $user->id)->sum('quantity')
                : 0,
            'portal' => [
                'delivery_fee' => (float) config('karinderya.delivery_fee', 0),
                'payment_methods' => config('karinderya.payment_methods', []),
                'fulfillment_methods' => config('karinderya.fulfillment_methods', []),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'order_placed' => fn () => $request->session()->get('order_placed'),
            ],
        ]);
    }
}
