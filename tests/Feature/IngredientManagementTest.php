<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\User;
use Tests\TestCase;

class IngredientManagementTest extends TestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->actingAs($this->admin);
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_store_an_ingredient()
    {
        $this->post('/admin/ingredients', [
            'ingredient_name' => 'Rice',
            'category' => 'Grains',
            'unit' => 'kg',
            'quantity' => 50,
            'reorder_level' => 5,
            'unit_cost' => 40.5,
            'description' => 'Well-milled white rice.',
        ])->assertRedirect(route('admin.ingredients.index'));

        $this->assertDatabaseHas('ingredients', [
            'ingredient_name' => 'Rice',
            'unit' => 'kg',
            'quantity' => 50,
            'reorder_level' => 5,
            'unit_cost' => 40.5,
            'status' => 'In Stock',
        ]);
    }

    public function test_status_is_low_stock_at_or_below_reorder_level()
    {
        $this->post('/admin/ingredients', [
            'ingredient_name' => 'Cooking Oil',
            'unit' => 'L',
            'quantity' => 0.5,
            'reorder_level' => 2,
            'unit_cost' => 100,
        ]);

        $this->assertSame(
            'Low Stock',
            Ingredient::where('ingredient_name', 'Cooking Oil')->value('status'),
        );
    }

    public function test_status_is_out_of_stock_when_quantity_is_zero()
    {
        $this->post('/admin/ingredients', [
            'ingredient_name' => 'Salt',
            'unit' => 'g',
            'quantity' => 0,
            'reorder_level' => 1,
            'unit_cost' => 10,
        ]);

        $this->assertSame(
            'Out of Stock',
            Ingredient::where('ingredient_name', 'Salt')->value('status'),
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    public function test_store_validates_required_fields()
    {
        $this->from('/admin/ingredients/create')
            ->post('/admin/ingredients', [])
            ->assertSessionHasErrors([
                'ingredient_name',
                'unit',
                'quantity',
                'reorder_level',
                'unit_cost',
            ]);
    }

    public function test_store_rejects_negative_values()
    {
        $this->post('/admin/ingredients', [
            'ingredient_name' => 'Rice',
            'unit' => 'kg',
            'quantity' => -5,
            'reorder_level' => -1,
            'unit_cost' => -20,
        ])->assertSessionHasErrors(['quantity', 'reorder_level', 'unit_cost']);

        $this->assertDatabaseMissing('ingredients', [
            'ingredient_name' => 'Rice',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Read / Search
    |--------------------------------------------------------------------------
    */

    public function test_index_returns_paginated_ingredients()
    {
        Ingredient::factory()
            ->count(15)
            ->create();

        $this->get('/admin/ingredients')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Ingredients/Index')
                    ->has('ingredients.data', 10)
            );
    }

    public function test_index_filters_by_search_term()
    {
        Ingredient::factory()->create(['ingredient_name' => 'Rice']);
        Ingredient::factory()->create(['ingredient_name' => 'Chicken']);

        $this->get('/admin/ingredients?search=Rice')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->has('ingredients.data', 1)
                    ->where(
                        'ingredients.data.0.ingredient_name',
                        'Rice'
                    )
            );
    }

    public function test_index_filters_by_status()
    {
        Ingredient::factory()->create([
            'ingredient_name' => 'Rice',
            'quantity' => 50,
            'reorder_level' => 5,
            'status' => 'In Stock',
        ]);

        Ingredient::factory()->create([
            'ingredient_name' => 'Onions',
            'quantity' => 0,
            'reorder_level' => 2,
            'status' => 'Out of Stock',
        ]);

        $this->get('/admin/ingredients?status=Out%20of%20Stock')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->has('ingredients.data', 1)
                    ->where(
                        'ingredients.data.0.ingredient_name',
                        'Onions'
                    )
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Update / Delete
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_update_an_ingredient()
    {
        $ingredient = Ingredient::factory()->create([
            'ingredient_name' => 'Rice',
            'quantity' => 50,
            'reorder_level' => 5,
            'status' => 'In Stock',
        ]);

        $this->put("/admin/ingredients/{$ingredient->id}", [
            'ingredient_name' => 'Jasmine Rice',
            'unit' => 'kg',
            'quantity' => 3,
            'reorder_level' => 5,
            'unit_cost' => 45,
        ])->assertRedirect(route('admin.ingredients.index'));

        $this->assertDatabaseHas('ingredients', [
            'id' => $ingredient->id,
            'ingredient_name' => 'Jasmine Rice',
            'quantity' => 3,
            'status' => 'Low Stock',
        ]);
    }

    public function test_admin_can_delete_an_ingredient()
    {
        $ingredient = Ingredient::factory()->create();

        $this->delete("/admin/ingredients/{$ingredient->id}")
            ->assertRedirect(route('admin.ingredients.index'));

        $this->assertModelMissing($ingredient);
    }

    public function test_show_displays_the_ingredient()
    {
        $ingredient = Ingredient::factory()->create([
            'ingredient_name' => 'Rice',
        ]);

        $this->get("/admin/ingredients/{$ingredient->id}")
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Ingredients/Show')
                    ->where(
                        'ingredient.ingredient_name',
                        'Rice'
                    )
            );
    }
}
