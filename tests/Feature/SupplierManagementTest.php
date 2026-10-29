<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\StockIn;
use App\Models\Supplier;
use App\Models\User;
use Tests\TestCase;

class SupplierManagementTest extends TestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->actingAs($this->admin);
    }

    public function test_admin_can_create_a_supplier()
    {
        $this->post('/admin/suppliers', [
            'name' => 'Rizal Trading',
            'contact_person' => 'Ana Reyes',
            'phone' => '09171234567',
            'email' => 'ana@rizaltrading.test',
            'address' => 'Cebu City',
            'is_active' => true,
        ])->assertRedirect(route('admin.suppliers.index'));

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Rizal Trading',
            'email' => 'ana@rizaltrading.test',
        ]);
    }

    public function test_supplier_email_must_be_valid()
    {
        $this->post('/admin/suppliers', [
            'name' => 'Bad Email Supplier',
            'email' => 'not-an-email',
        ])->assertSessionHasErrors('email');

        $this->assertDatabaseMissing('suppliers', ['name' => 'Bad Email Supplier']);
    }

    public function test_unused_supplier_can_be_deleted()
    {
        $supplier = Supplier::factory()->create();

        $this->delete("/admin/suppliers/{$supplier->id}")
            ->assertRedirect(route('admin.suppliers.index'));

        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }

    public function test_supplier_with_stock_history_is_deactivated_instead_of_deleted()
    {
        $supplier = Supplier::factory()->create();
        $ingredient = Ingredient::factory()->create();

        StockIn::create([
            'ingredient_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity' => 5,
            'unit_cost' => 10,
            'total_cost' => 50,
            'received_at' => now()->toDateString(),
        ]);

        $this->delete("/admin/suppliers/{$supplier->id}")
            ->assertRedirect(route('admin.suppliers.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'is_active' => false,
        ]);
    }

    public function test_supplier_details_include_stock_in_history()
    {
        $supplier = Supplier::factory()->create();
        $ingredient = Ingredient::factory()->create([
            'ingredient_name' => 'Rice',
        ]);

        StockIn::create([
            'ingredient_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity' => 5,
            'unit_cost' => 10,
            'total_cost' => 50,
            'received_at' => now()->toDateString(),
        ]);

        $this->get("/admin/suppliers/{$supplier->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Suppliers/Show')
                ->has('supplier.stock_ins', 1)
                ->where('supplier.stock_ins.0.ingredient.ingredient_name', 'Rice'));
    }

    public function test_regular_user_cannot_manage_suppliers()
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get('/admin/suppliers')
            ->assertForbidden();
    }
}
