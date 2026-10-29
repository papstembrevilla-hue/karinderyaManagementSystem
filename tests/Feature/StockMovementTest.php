<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\Supplier;
use App\Models\User;
use Tests\TestCase;

class StockMovementTest extends TestCase
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
    | Stock In
    |--------------------------------------------------------------------------
    */

    public function test_stock_in_increases_ingredient_quantity_and_status()
    {
        $ingredient = Ingredient::factory()->create([
            'quantity' => 5,
            'reorder_level' => 10,
            'status' => 'Low Stock',
        ]);

        $supplier = Supplier::factory()->create();

        $this->post('/admin/stock-ins', [
            'ingredient_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity' => 20,
            'unit_cost' => 12.5,
            'received_at' => now()->toDateString(),
            'notes' => 'Delivery',
        ])->assertRedirect(route('admin.stock-ins.index'));

        $this->assertEquals(25, (float) $ingredient->fresh()->quantity);
        $this->assertSame('In Stock', $ingredient->fresh()->status);

        $this->assertDatabaseHas('stock_ins', [
            'ingredient_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity' => 20,
            'unit_cost' => 12.5,
            'total_cost' => 250,
        ]);
    }

    public function test_stock_in_total_cost_is_calculated_from_quantity_and_unit_cost()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 0]);

        $this->post('/admin/stock-ins', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 3,
            'unit_cost' => 7.25,
            'total_cost' => 1,
            'received_at' => now()->toDateString(),
        ])->assertRedirect(route('admin.stock-ins.index'));

        $this->assertEquals(21.75, (float) StockIn::first()->total_cost);
    }

    public function test_stock_in_edit_reconciles_the_ingredient_balance()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 10]);

        $stockIn = StockIn::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'unit_cost' => 5,
            'total_cost' => 50,
            'received_at' => now()->toDateString(),
        ]);

        $this->put("/admin/stock-ins/{$stockIn->id}", [
            'ingredient_id' => $ingredient->id,
            'quantity' => 15,
            'unit_cost' => 6,
            'received_at' => now()->toDateString(),
        ])->assertRedirect(route('admin.stock-ins.index'));

        $this->assertEquals(15, (float) $ingredient->fresh()->quantity);
        $this->assertEquals(90, (float) $stockIn->fresh()->total_cost);
    }

    public function test_stock_in_edit_cannot_make_the_balance_negative()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 1]);

        $stockIn = StockIn::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'unit_cost' => 5,
            'total_cost' => 50,
            'received_at' => now()->toDateString(),
        ]);

        $this->put("/admin/stock-ins/{$stockIn->id}", [
            'ingredient_id' => $ingredient->id,
            'quantity' => 5,
            'unit_cost' => 5,
            'received_at' => now()->toDateString(),
        ])->assertSessionHasErrors('quantity');

        $this->assertEquals(1, (float) $ingredient->fresh()->quantity);
        $this->assertEquals(10, (float) $stockIn->fresh()->quantity);
    }

    /*
    |--------------------------------------------------------------------------
    | Stock Out
    |--------------------------------------------------------------------------
    */

    public function test_stock_out_decreases_ingredient_quantity()
    {
        $ingredient = Ingredient::factory()->create([
            'quantity' => 20,
            'reorder_level' => 5,
            'status' => 'In Stock',
        ]);

        $this->post('/admin/stock-outs', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 4,
            'reason' => 'Spoilage',
            'occurred_at' => now()->toDateString(),
            'notes' => 'Spoiled batch',
        ])->assertRedirect(route('admin.stock-outs.index'));

        $this->assertEquals(16, (float) $ingredient->fresh()->quantity);
        $this->assertSame('In Stock', $ingredient->fresh()->status);

        $this->assertDatabaseHas('stock_outs', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 4,
            'reason' => 'Spoilage',
        ]);
    }

    public function test_stock_out_cannot_exceed_available_stock()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 3]);

        $this->post('/admin/stock-outs', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 5,
            'reason' => 'Damage',
            'occurred_at' => now()->toDateString(),
        ])->assertSessionHasErrors('quantity');

        $this->assertEquals(3, (float) $ingredient->fresh()->quantity);
        $this->assertDatabaseCount('stock_outs', 0);
    }

    public function test_stock_out_requires_a_known_reason()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 10]);

        $this->post('/admin/stock-outs', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 1,
            'reason' => 'Because',
            'occurred_at' => now()->toDateString(),
        ])->assertSessionHasErrors('reason');

        $this->assertDatabaseCount('stock_outs', 0);
    }

    public function test_stock_out_edit_reconciles_the_ingredient_balance()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 10]);

        $stockOut = StockOut::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 4,
            'reason' => 'Damage',
            'occurred_at' => now()->toDateString(),
        ]);

        $this->put("/admin/stock-outs/{$stockOut->id}", [
            'ingredient_id' => $ingredient->id,
            'quantity' => 7,
            'reason' => 'Operational Use',
            'occurred_at' => now()->toDateString(),
        ])->assertRedirect(route('admin.stock-outs.index'));

        $this->assertEquals(7, (float) $ingredient->fresh()->quantity);
        $this->assertSame('Operational Use', $stockOut->fresh()->reason);
    }

    public function test_stock_out_edit_cannot_exceed_available_stock()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 2]);

        $stockOut = StockOut::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 1,
            'reason' => 'Damage',
            'occurred_at' => now()->toDateString(),
        ]);

        $this->put("/admin/stock-outs/{$stockOut->id}", [
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'reason' => 'Damage',
            'occurred_at' => now()->toDateString(),
        ])->assertSessionHasErrors('quantity');

        $this->assertEquals(2, (float) $ingredient->fresh()->quantity);
        $this->assertEquals(1, (float) $stockOut->fresh()->quantity);
    }

    /*
    |--------------------------------------------------------------------------
    | Pages
    |--------------------------------------------------------------------------
    */

    public function test_stock_movement_pages_render_with_their_props()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 10]);
        $supplier = Supplier::factory()->create();

        $stockIn = StockIn::create([
            'ingredient_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity' => 5,
            'unit_cost' => 1,
            'total_cost' => 5,
            'received_at' => now()->toDateString(),
        ]);

        $stockOut = StockOut::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 2,
            'reason' => 'Damage',
            'occurred_at' => now()->toDateString(),
        ]);

        $this->get('/admin/stock-ins')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/StockIns/Index')
                ->has('stockIns.data', 1));

        $this->get('/admin/stock-ins/create')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/StockIns/Create')
                ->has('ingredients', 1)
                ->has('suppliers', 1));

        $this->get("/admin/stock-ins/{$stockIn->id}/edit")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/StockIns/Edit')
                ->where('stockIn.id', $stockIn->id));

        $this->get('/admin/stock-outs')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/StockOuts/Index')
                ->has('stockOuts.data', 1));

        $this->get('/admin/stock-outs/create')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/StockOuts/Create')
                ->has('reasons', count(StockOut::REASONS)));

        $this->get("/admin/stock-outs/{$stockOut->id}/edit")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/StockOuts/Edit')
                ->where('stockOut.id', $stockOut->id));
    }

    /*
    |--------------------------------------------------------------------------
    | History and authorization
    |--------------------------------------------------------------------------
    */

    public function test_stock_movements_have_no_delete_route()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 10]);

        $stockIn = StockIn::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 5,
            'unit_cost' => 1,
            'total_cost' => 5,
            'received_at' => now()->toDateString(),
        ]);

        $stockOut = StockOut::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 2,
            'reason' => 'Damage',
            'occurred_at' => now()->toDateString(),
        ]);

        $this->delete("/admin/stock-ins/{$stockIn->id}")->assertStatus(405);
        $this->delete("/admin/stock-outs/{$stockOut->id}")->assertStatus(405);

        $this->assertDatabaseHas('stock_ins', ['id' => $stockIn->id]);
        $this->assertDatabaseHas('stock_outs', ['id' => $stockOut->id]);
    }

    public function test_ingredient_with_stock_history_cannot_be_deleted()
    {
        $ingredient = Ingredient::factory()->create(['quantity' => 10]);

        StockOut::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 1,
            'reason' => 'Spoilage',
            'occurred_at' => now()->toDateString(),
        ]);

        $this->delete("/admin/ingredients/{$ingredient->id}")
            ->assertRedirect(route('admin.ingredients.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('ingredients', ['id' => $ingredient->id]);
    }

    public function test_regular_user_cannot_record_stock_movements()
    {
        $user = User::factory()->create(['role' => 'user']);
        $ingredient = Ingredient::factory()->create(['quantity' => 10]);

        $this->actingAs($user)
            ->get('/admin/stock-ins')
            ->assertForbidden();

        $this->actingAs($user)
            ->post('/admin/stock-outs', [
                'ingredient_id' => $ingredient->id,
                'quantity' => 1,
                'reason' => 'Damage',
                'occurred_at' => now()->toDateString(),
            ])
            ->assertForbidden();

        $this->assertEquals(10, (float) $ingredient->fresh()->quantity);
    }
}
