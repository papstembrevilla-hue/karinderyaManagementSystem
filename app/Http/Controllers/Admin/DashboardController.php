<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\Supplier;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with inventory and customer overview.
     */
    public function dashboard(): Response
    {
        /*
        |--------------------------------------------------------------------------
        | Inventory Statistics
        |--------------------------------------------------------------------------
        */

        $ingredients = Ingredient::select([
            'id',
            'ingredient_name',
            'category',
            'unit',
            'quantity',
            'reorder_level',
            'unit_cost',
            'expiration_date',
            'status',
        ])->get();

        $totalIngredients = $ingredients->count();

        $lowStockIngredients = $ingredients
            ->where('status', 'Low Stock')
            ->sortBy('quantity')
            ->take(5)
            ->values();

        $recentIngredients = Ingredient::latest('created_at')
            ->take(5)
            ->get([
                'id',
                'ingredient_name',
                'category',
                'unit',
                'quantity',
                'status',
                'created_at',
            ]);

        $outOfStockCount = $ingredients
            ->where('status', 'Out of Stock')
            ->count();

        $inStockCount = $ingredients
            ->where('status', 'In Stock')
            ->count();

        $totalInventoryValue = $ingredients
            ->sum(fn ($ingredient) => $ingredient->quantity * $ingredient->unit_cost);

        /*
        |--------------------------------------------------------------------------
        | Expiring Ingredients (next 7 days)
        |--------------------------------------------------------------------------
        */

        $expiringSoon = Ingredient::whereNotNull('expiration_date')
            ->whereBetween('expiration_date', [
                Carbon::today(),
                Carbon::today()->addDays(7),
            ])
            ->orderBy('expiration_date')
            ->take(5)
            ->get(['id', 'ingredient_name', 'unit', 'quantity', 'expiration_date', 'status']);

        /*
        |--------------------------------------------------------------------------
        | Customer Statistics
        |--------------------------------------------------------------------------
        */

        $totalCustomers = Customer::count();

        $activeCustomers = Customer::where('is_active', true)->count();

        $recentCustomers = Customer::latest()
            ->take(5)
            ->get(['id', 'customer_code', 'first_name', 'last_name', 'email', 'phone', 'is_active', 'created_at']);

        /*
        |--------------------------------------------------------------------------
        | Menu / Supplier Statistics
        |--------------------------------------------------------------------------
        */

        $totalMenuItems = MenuItem::count();

        $unavailableMenuItems = MenuItem::where('is_available', false)->count();

        $totalCategories = Category::count();

        $totalSuppliers = Supplier::where('is_active', true)->count();

        $recentMenuItems = MenuItem::with('category:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'category_id', 'name', 'price', 'photo', 'is_available', 'created_at']);

        /*
        |--------------------------------------------------------------------------
        | Recent Stock Movements
        |--------------------------------------------------------------------------
        */

        $recentStockIns = StockIn::with([
            'ingredient:id,ingredient_name,unit',
            'supplier:id,name',
        ])
            ->latest('received_at')
            ->latest('id')
            ->take(5)
            ->get();

        $recentStockOuts = StockOut::with('ingredient:id,ingredient_name,unit')
            ->latest('occurred_at')
            ->latest('id')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalIngredients' => $totalIngredients,
                'inStockCount' => $inStockCount,
                'lowStockCount' => $ingredients->where('status', 'Low Stock')->count(),
                'outOfStockCount' => $outOfStockCount,
                'totalInventoryValue' => round((float) $totalInventoryValue, 2),
                'totalCustomers' => $totalCustomers,
                'activeCustomers' => $activeCustomers,
                'totalMenuItems' => $totalMenuItems,
                'unavailableMenuItems' => $unavailableMenuItems,
                'totalCategories' => $totalCategories,
                'totalSuppliers' => $totalSuppliers,
            ],
            'lowStockIngredients' => $lowStockIngredients,
            'recentIngredients' => $recentIngredients,
            'expiringSoon' => $expiringSoon,
            'recentCustomers' => $recentCustomers,
            'recentMenuItems' => $recentMenuItems,
            'recentStockIns' => $recentStockIns,
            'recentStockOuts' => $recentStockOuts,
        ]);
    }
}
