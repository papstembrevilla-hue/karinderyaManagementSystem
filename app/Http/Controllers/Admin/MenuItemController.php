<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MenuItemController extends Controller
{
    /**
     * Display all menu items.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $categoryId = $request->input('category_id');
        $availability = $request->input('availability');

        $menuItems = MenuItem::query()
            ->with('category:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(
                $categoryId !== null && $categoryId !== '',
                fn ($query) => $query->where('category_id', $categoryId),
            )
            ->when(
                $availability === 'available',
                fn ($query) => $query->where('is_available', true),
            )
            ->when(
                $availability === 'unavailable',
                fn ($query) => $query->where('is_available', false),
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/MenuItems/Index', [
            'menuItems' => $menuItems,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId ?? '',
                'availability' => $availability ?? '',
            ],
        ]);
    }

    /**
     * Show create form.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/MenuItems/Create', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a new menu item.
     */
    public function store(Request $request)
    {
        $validated = $this->validateMenuItem($request);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request
                ->file('photo')
                ->store('menu-items', 'public');
        }

        $validated['is_available'] = $request->boolean(
            'is_available',
            true,
        );

        MenuItem::create($validated);

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Menu item created successfully.');
    }

    /**
     * Display a single menu item.
     */
    public function show(MenuItem $menuItem): Response
    {
        $menuItem->load('category:id,name');

        return Inertia::render('Admin/MenuItems/Show', [
            'menuItem' => $menuItem,
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(MenuItem $menuItem): Response
    {
        return Inertia::render('Admin/MenuItems/Edit', [
            'menuItem' => $menuItem,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update a menu item.
     */
    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $this->validateMenuItem($request);

        $oldPhoto = null;

        if ($request->hasFile('photo')) {
            $oldPhoto = $menuItem->photo;

            $validated['photo'] = $request
                ->file('photo')
                ->store('menu-items', 'public');
        }

        $validated['is_available'] = $request->boolean(
            'is_available',
            $menuItem->is_available,
        );

        $menuItem->update($validated);

        if ($oldPhoto) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Menu item updated successfully.');
    }

    /**
     * Delete a menu item.
     */
    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->photo) {
            Storage::disk('public')->delete($menuItem->photo);
        }

        $menuItem->delete();

        return redirect()
            ->route('admin.menu-items.index')
            ->with('success', 'Menu item deleted successfully.');
    }

    /**
     * Validate menu item data.
     *
     * @return array<string, mixed>
     */
    private function validateMenuItem(Request $request): array
    {
        return $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
            'is_available' => ['sometimes', 'boolean'],
        ]);
    }
}
