<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\Supplier;
use App\Models\User;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    public function test_dashboard_reports_statistics_from_the_database()
    {
        $this->actingAs(User::factory()->admin()->create());

        Ingredient::factory()->count(4)->create([
            'quantity' => 50,
            'reorder_level' => 5,
            'status' => 'In Stock',
        ]);

        Ingredient::factory()->create([
            'quantity' => 2,
            'reorder_level' => 5,
            'status' => 'Low Stock',
        ]);

        Ingredient::factory()->create([
            'quantity' => 0,
            'reorder_level' => 5,
            'status' => 'Out of Stock',
        ]);

        Customer::factory()->count(3)->create();
        Customer::factory()->create(['is_active' => false]);

        $this->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Dashboard')
                    ->where('stats.totalIngredients', 6)
                    ->where('stats.inStockCount', 4)
                    ->where('stats.lowStockCount', 1)
                    ->where('stats.outOfStockCount', 1)
                    ->where('stats.totalCustomers', 4)
                    ->where('stats.activeCustomers', 3)
            );
    }

    public function test_dashboard_reports_menu_and_supplier_statistics()
    {
        $this->actingAs(User::factory()->admin()->create());

        $category = Category::factory()->create();

        MenuItem::factory()->count(3)->create([
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        MenuItem::factory()->create([
            'category_id' => $category->id,
            'is_available' => false,
        ]);

        Supplier::factory()->count(2)->create(['is_active' => true]);
        Supplier::factory()->create(['is_active' => false]);

        $this->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Dashboard')
                    ->where('stats.totalMenuItems', 4)
                    ->where('stats.unavailableMenuItems', 1)
                    ->where('stats.totalCategories', 1)
                    ->where('stats.totalSuppliers', 2)
                    ->has('recentMenuItems', 4)
            );
    }

    public function test_dashboard_lists_low_stock_and_recent_ingredients()
    {
        $this->actingAs(User::factory()->admin()->create());

        $low = Ingredient::factory()->create([
            'ingredient_name' => 'Onions',
            'quantity' => 1,
            'reorder_level' => 10,
            'status' => 'Low Stock',
        ]);

        $this->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->has('lowStockIngredients', 1)
                    ->where('lowStockIngredients.0.ingredient_name', 'Onions')
                    ->where('lowStockIngredients.0.id', $low->id)
                    ->has('recentIngredients', 1)
            );
    }
}
