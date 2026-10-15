<?php

use App\Http\Controllers\Admin\IngredientController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth','role:user'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/secure-admin-login', function () {
    return Inertia::render('Admin/Login');
})->name('admin.login');

Route::post('/admin-login', [AuthenticatedSessionController::class, 'adminLogin'])
    ->name('admin.login.store');

Route::middleware(['auth','role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

     // Display all ingredients
    Route::get('/admin/ingredients', [
        IngredientController::class,
        'index'
    ])->name('admin.ingredients.index');


    // Show create ingredient form
    Route::get('/admin/ingredients/create', [
        IngredientController::class,
        'create'
    ])->name('admin.ingredients.create');


    // Store new ingredient
    Route::post('/admin/ingredients', [
        IngredientController::class,
        'store'
    ])->name('admin.ingredients.store');


    // Display one ingredient
    Route::get('/admin/ingredients/{ingredient}', [
        IngredientController::class,
        'show'
    ])->name('admin.ingredients.show');


    // Show edit ingredient form
    Route::get('/admin/ingredients/{ingredient}/edit', [
        IngredientController::class,
        'edit'
    ])->name('admin.ingredients.edit');


    // Update ingredient
    Route::put('/admin/ingredients/{ingredient}', [
        IngredientController::class,
        'update'
    ])->name('admin.ingredients.update');


    // Delete ingredient
    Route::delete('/admin/ingredients/{ingredient}', [
        IngredientController::class,
        'destroy'
    ])->name('admin.ingredients.destroy');

});
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
