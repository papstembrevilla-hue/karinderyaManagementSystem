<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Tests\TestCase;

class CustomerManagementTest extends TestCase
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

    public function test_admin_can_create_a_customer()
    {
        $this->post('/customers', [
            'customer_code' => 'CUST-0001',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan@example.com',
            'phone' => '09171234567',
            'address' => '123 Rizal St.',
            'notes' => 'Walk-in customer.',
            'is_active' => true,
        ])->assertRedirect(route('customers.index'));

        $this->assertDatabaseHas('customers', [
            'customer_code' => 'CUST-0001',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'is_active' => true,
        ]);
    }

    public function test_customer_code_must_be_unique()
    {
        Customer::factory()->create(['customer_code' => 'CUST-0001']);

        $this->post('/customers', [
            'customer_code' => 'CUST-0001',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
        ])->assertSessionHasErrors('customer_code');

        $this->assertDatabaseMissing('customers', [
            'first_name' => 'Maria',
        ]);
    }

    public function test_store_validates_required_fields()
    {
        $this->post('/customers', [])
            ->assertSessionHasErrors(['customer_code', 'first_name', 'last_name']);
    }

    public function test_store_rejects_invalid_email()
    {
        $this->post('/customers', [
            'customer_code' => 'CUST-0002',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'not-an-email',
        ])->assertSessionHasErrors('email');
    }

    /*
    |--------------------------------------------------------------------------
    | Read / Search / Pagination
    |--------------------------------------------------------------------------
    */

    public function test_index_returns_paginated_customers()
    {
        Customer::factory()->count(12)->create();

        $this->get('/customers')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Customers/Index')
                    ->has('customers.data', 10)
            );
    }

    public function test_search_matches_name_and_email()
    {
        Customer::factory()->create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan@example.com',
        ]);

        Customer::factory()->create([
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria@example.com',
        ]);

        $this->get('/customers?search=juan@example.com')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->has('customers.data', 1)
                    ->where('customers.data.0.first_name', 'Juan')
            );

        $this->get('/customers?search=maria')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->has('customers.data', 1)
                    ->where('customers.data.0.first_name', 'Maria')
            );
    }

    public function test_show_displays_the_customer()
    {
        $customer = Customer::factory()->create([
            'first_name' => 'Juan',
        ]);

        $this->get("/customers/{$customer->id}")
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('Admin/Customers/Show')
                    ->where('customer.first_name', 'Juan')
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Update / Delete
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_update_a_customer()
    {
        $customer = Customer::factory()->create([
            'first_name' => 'Juan',
            'is_active' => true,
        ]);

        $this->put("/customers/{$customer->id}", [
            'customer_code' => $customer->customer_code,
            'first_name' => 'Jose',
            'last_name' => $customer->last_name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'notes' => $customer->notes,
            'is_active' => false,
        ])->assertRedirect(route('customers.index'));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'first_name' => 'Jose',
            'is_active' => false,
        ]);
    }

    public function test_delete_soft_deletes_the_customer()
    {
        $customer = Customer::factory()->create();

        $this->delete("/customers/{$customer->id}")
            ->assertRedirect(route('customers.index'));

        $this->assertSoftDeleted($customer);
    }

    /*
    |--------------------------------------------------------------------------
    | Authorization
    |--------------------------------------------------------------------------
    */

    public function test_regular_users_cannot_create_or_delete_customers()
    {
        $this->actingAs(User::factory()->create());

        $this->post('/customers', [
            'customer_code' => 'CUST-9999',
            'first_name' => 'Evil',
            'last_name' => 'User',
        ])->assertForbidden();

        $customer = Customer::factory()->create();

        $this->delete("/customers/{$customer->id}")
            ->assertForbidden();

        $this->assertNotSoftDeleted($customer);
    }
}
