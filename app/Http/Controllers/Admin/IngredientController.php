<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class IngredientController extends Controller
{
    /**
     * Display all ingredients.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));

        $ingredients = Ingredient::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('ingredient_name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Ingredients/Index', [
            'ingredients' => $ingredients,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show create form.
     */
    public function create()
    {
        return Inertia::render('Admin/Ingredients/Create');
    }

    /**
     * Store a new ingredient.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ingredient_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'unit' => 'required|string|max:50',

            'quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',

            'expiration_date' => 'nullable|date',

            'description' => 'nullable|string',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Upload Photo
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request
                ->file('photo')
                ->store('ingredients', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Determine Status
        |--------------------------------------------------------------------------
        */

        $validated['status'] = $this->getStatus(
            $validated['quantity'],
            $validated['reorder_level']
        );

        Ingredient::create($validated);

        return redirect()
            ->route('admin.ingredients.index')
            ->with('success', 'Ingredient added successfully!');
    }

    /**
     * Display a single ingredient.
     */
    public function show(Ingredient $ingredient)
    {
        return Inertia::render('Admin/Ingredients/Show', [
            'ingredient' => $ingredient,
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(Ingredient $ingredient)
    {
        return Inertia::render('Admin/Ingredients/Edit', [
            'ingredient' => $ingredient,
        ]);
    }

    /**
     * Update ingredient.
     */
    public function update(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'ingredient_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'unit' => 'required|string|max:50',
            'quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',

            'expiration_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Update Photo
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('photo')) {

            // Delete old photo
            if ($ingredient->photo) {
                Storage::disk('public')->delete(
                    $ingredient->photo
                );
            }

            // Store new photo
            $validated['photo'] = $request
                ->file('photo')
                ->store('ingredients', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Update Status
        |--------------------------------------------------------------------------
        */

        if ($validated['quantity'] <= 0) {
            $validated['status'] = 'Out of Stock';
        } elseif (
            $validated['quantity'] <= $validated['reorder_level']
        ) {
            $validated['status'] = 'Low Stock';
        } else {
            $validated['status'] = 'In Stock';
        }

        /*
        |--------------------------------------------------------------------------
        | Update Database
        |--------------------------------------------------------------------------
        */

        $ingredient->update($validated);

        /*
        |--------------------------------------------------------------------------
        | Flash Message
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route('admin.ingredients.index')
            ->with(
                'success',
                'Ingredient updated successfully!'
            );
    }

    /**
     * Delete ingredient.
     */
    public function destroy(Ingredient $ingredient)
    {
        /*
        |--------------------------------------------------------------------------
        | Protect Historical Stock Movements
        |--------------------------------------------------------------------------
        */

        if ($ingredient->stockIns()->exists() || $ingredient->stockOuts()->exists()) {
            return redirect()
                ->route('admin.ingredients.index')
                ->with(
                    'error',
                    'This ingredient has stock movement history and cannot be deleted.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Delete Photo
        |--------------------------------------------------------------------------
        */

        if ($ingredient->photo) {
            Storage::disk('public')->delete(
                $ingredient->photo
            );
        }

        $ingredient->delete();

        return redirect()
            ->route('admin.ingredients.index')
            ->with('success', 'Ingredient deleted successfully!');
    }

    /**
     * Determine inventory status.
     */
    private function getStatus(
        $quantity,
        $reorderLevel
    ): string {

        if ($quantity <= 0) {
            return 'Out of Stock';
        }

        if ($quantity <= $reorderLevel) {
            return 'Low Stock';
        }

        return 'In Stock';
    }
}
