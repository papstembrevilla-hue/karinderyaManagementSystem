<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->actingAs($this->admin);
    }

    public function test_admin_can_view_categories_page()
    {
        Category::factory()->count(2)->create();

        $this->get('/admin/categories')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Categories/Index')
                ->has('categories.data', 2));
    }

    public function test_admin_can_create_a_category()
    {
        $this->post('/admin/categories', [
            'name' => 'Rice Meals',
            'description' => 'All rice-based dishes.',
            'is_active' => true,
        ])->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Rice Meals',
            'is_active' => true,
        ]);
    }

    public function test_category_name_must_be_unique()
    {
        Category::factory()->create(['name' => 'Beverages']);

        $this->post('/admin/categories', [
            'name' => 'Beverages',
        ])->assertSessionHasErrors('name');

        $this->assertSame(1, Category::where('name', 'Beverages')->count());
    }

    public function test_admin_can_update_a_category()
    {
        $category = Category::factory()->create(['name' => 'Snacks']);

        $this->put("/admin/categories/{$category->id}", [
            'name' => 'Merienda',
            'description' => 'Afternoon snacks.',
            'is_active' => false,
        ])->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Merienda',
            'is_active' => false,
        ]);
    }

    public function test_category_can_be_deleted_when_it_has_no_menu_items()
    {
        $category = Category::factory()->create();

        $this->delete("/admin/categories/{$category->id}")
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_category_with_menu_items_cannot_be_deleted()
    {
        $category = Category::factory()->create();
        MenuItem::factory()->create(['category_id' => $category->id]);

        $this->delete("/admin/categories/{$category->id}")
            ->assertRedirect(route('admin.categories.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_regular_user_cannot_manage_categories()
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get('/admin/categories')
            ->assertForbidden();
    }
}
