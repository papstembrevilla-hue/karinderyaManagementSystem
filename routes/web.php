<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\IngredientController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\StockInController;
use App\Http\Controllers\Admin\StockOutController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/secure-admin-login', function () {
    return Inertia::render('Admin/Login');
})->name('admin.login');

Route::post('/admin-login', [AuthenticatedSessionController::class, 'adminLogin'])
    ->middleware('throttle:6,1')
    ->name('admin.login.store');

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [
        DashboardController::class,
        'dashboard',
    ])->name('admin.dashboard');

    // Display all ingredients
    Route::get('/admin/ingredients', [
        IngredientController::class,
        'index',
    ])->name('admin.ingredients.index');

    // Show create ingredient form
    Route::get('/admin/ingredients/create', [
        IngredientController::class,
        'create',
    ])->name('admin.ingredients.create');

    // Store new ingredient
    Route::post('/admin/ingredients', [
        IngredientController::class,
        'store',
    ])->name('admin.ingredients.store');

    // Display one ingredient
    Route::get('/admin/ingredients/{ingredient}', [
        IngredientController::class,
        'show',
    ])->name('admin.ingredients.show');

    // Show edit ingredient form
    Route::get('/admin/ingredients/{ingredient}/edit', [
        IngredientController::class,
        'edit',
    ])->name('admin.ingredients.edit');

    // Update ingredient
    Route::put('/admin/ingredients/{ingredient}', [
        IngredientController::class,
        'update',
    ])->name('admin.ingredients.update');

    // Delete ingredient
    Route::delete('/admin/ingredients/{ingredient}', [
        IngredientController::class,
        'destroy',
    ])->name('admin.ingredients.destroy');

    // Display all customers
    Route::resource('customers', CustomerController::class);

    // Customer orders (status changes and payment verification)
    Route::get('/admin/orders', [OrderController::class, 'index'])
        ->name('admin.orders.index');
    Route::get('/admin/orders/{order}', [OrderController::class, 'show'])
        ->whereNumber('order')
        ->name('admin.orders.show');
    Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->whereNumber('order')
        ->name('admin.orders.status');
    Route::patch('/admin/orders/{order}/payment', [OrderController::class, 'updatePayment'])
        ->whereNumber('order')
        ->name('admin.orders.payment');

    // Categories
    Route::resource('admin/categories', CategoryController::class)
        ->except('show')
        ->names('admin.categories');

    // Menu items (food management)
    Route::resource('admin/menu-items', MenuItemController::class)
        ->names('admin.menu-items')
        ->parameters(['menu-items' => 'menuItem']);

    // Suppliers
    Route::resource('admin/suppliers', SupplierController::class)
        ->names('admin.suppliers');

    // Stock movements (no delete routes: history is never silently destroyed)
    Route::get('/admin/stock-ins', [StockInController::class, 'index'])
        ->name('admin.stock-ins.index');
    Route::get('/admin/stock-ins/create', [StockInController::class, 'create'])
        ->name('admin.stock-ins.create');
    Route::post('/admin/stock-ins', [StockInController::class, 'store'])
        ->name('admin.stock-ins.store');
    Route::get('/admin/stock-ins/{stockIn}/edit', [StockInController::class, 'edit'])
        ->name('admin.stock-ins.edit');
    Route::put('/admin/stock-ins/{stockIn}', [StockInController::class, 'update'])
        ->name('admin.stock-ins.update');

    Route::get('/admin/stock-outs', [StockOutController::class, 'index'])
        ->name('admin.stock-outs.index');
    Route::get('/admin/stock-outs/create', [StockOutController::class, 'create'])
        ->name('admin.stock-outs.create');
    Route::post('/admin/stock-outs', [StockOutController::class, 'store'])
        ->name('admin.stock-outs.store');
    Route::get('/admin/stock-outs/{stockOut}/edit', [StockOutController::class, 'edit'])
        ->name('admin.stock-outs.edit');
    Route::put('/admin/stock-outs/{stockOut}', [StockOutController::class, 'update'])
        ->name('admin.stock-outs.update');

});
require __DIR__.'/portal.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
