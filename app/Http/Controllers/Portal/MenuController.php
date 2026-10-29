<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('q', ''));
        $categoryId = $request->input('category');
        $availableOnly = $request->boolean('available');

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
            ->when($availableOnly, fn ($query) => $query->where('is_available', true))
            ->orderByDesc('is_available')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Portal/Menu/Index', [
            'menuItems' => $menuItems,
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => [
                'q' => $search,
                'category' => $categoryId ?? '',
                'available' => $availableOnly,
            ],
        ]);
    }

    public function show(MenuItem $menuItem): Response
    {
        $menuItem->load('category:id,name');

        $related = MenuItem::query()
            ->with('category:id,name')
            ->where('category_id', $menuItem->category_id)
            ->whereKeyNot($menuItem->id)
            ->where('is_available', true)
            ->orderBy('name')
            ->limit(4)
            ->get();

        return Inertia::render('Portal/Menu/Show', [
            'menuItem' => $menuItem,
            'related' => $related,
        ]);
    }
}
