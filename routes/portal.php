<?php

use App\Http\Controllers\Portal\AccountController;
use App\Http\Controllers\Portal\AddressController;
use App\Http\Controllers\Portal\CartController;
use App\Http\Controllers\Portal\CheckoutController;
use App\Http\Controllers\Portal\HomeController;
use App\Http\Controllers\Portal\MenuController;
use App\Http\Controllers\Portal\OrderController;
use App\Http\Controllers\Portal\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');
Route::get('/menu/{menuItem}', [MenuController::class, 'show'])
    ->whereNumber('menuItem')
    ->name('menu.show');

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/dashboard', [AccountController::class, 'index'])->name('dashboard');

    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/items', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/items/{cartItem}', [CartController::class, 'update'])
        ->whereNumber('cartItem')
        ->name('cart.update');
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroy'])
        ->whereNumber('cartItem')
        ->name('cart.destroy');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

    Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])
        ->whereNumber('order')
        ->name('orders.show');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])
        ->whereNumber('order')
        ->name('orders.cancel');
    Route::post('/orders/{order}/reorder', [OrderController::class, 'reorder'])
        ->whereNumber('order')
        ->name('orders.reorder');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('portal.profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('portal.profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('portal.password.update');

    Route::get('/profile/addresses', [AddressController::class, 'index'])->name('portal.addresses.index');
    Route::post('/profile/addresses', [AddressController::class, 'store'])->name('portal.addresses.store');
    Route::put('/profile/addresses/{address}', [AddressController::class, 'update'])
        ->whereNumber('address')
        ->name('portal.addresses.update');
    Route::delete('/profile/addresses/{address}', [AddressController::class, 'destroy'])
        ->whereNumber('address')
        ->name('portal.addresses.destroy');
});
