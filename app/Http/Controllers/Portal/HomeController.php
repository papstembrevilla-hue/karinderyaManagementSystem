<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount([
                'menuItems as available_items_count' => fn ($query) => $query->where('is_available', true),
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $menuItems = MenuItem::query()
            ->with('category:id,name')
            ->where('is_available', true)
            ->latest()
            ->limit(8)
            ->get();

        return Inertia::render('Portal/Home', [
            'categories' => $categories,
            'menuItems' => $menuItems,
        ]);
    }
}
