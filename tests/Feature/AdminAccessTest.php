<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\User;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    /*
    |--------------------------------------------------------------------------
    | Guests
    |--------------------------------------------------------------------------
    */

    public function test_guests_are_redirected_to_login_for_admin_pages()
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/admin/ingredients')->assertRedirect('/login');
        $this->get('/customers')->assertRedirect('/login');
    }

    /*
    |--------------------------------------------------------------------------
    | Regular Users (role:user)
    |--------------------------------------------------------------------------
    */

    public function test_regular_users_receive_403_for_admin_pages()
    {
        $user = User::factory()->create(); // default role: user
        $this->actingAs($user);

        $this->get('/admin/dashboard')->assertForbidden();
        $this->get('/admin/ingredients')->assertForbidden();
        $this->get('/customers')->assertForbidden();
    }

    public function test_regular_users_cannot_mutate_ingredients()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $ingredient = Ingredient::factory()->create();

        $this->post('/admin/ingredients', [
            'ingredient_name' => 'Rice',
            'unit' => 'kg',
            'quantity' => 10,
            'reorder_level' => 2,
            'unit_cost' => 50,
        ])->assertForbidden();

        $this->delete("/admin/ingredients/{$ingredient->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('ingredients', [
            'id' => $ingredient->id,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Administrators (role:admin)
    |--------------------------------------------------------------------------
    */

    public function test_admins_can_access_their_pages()
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin);

        $this->get('/admin/dashboard')->assertOk();
        $this->get('/admin/ingredients')->assertOk();
        $this->get('/customers')->assertOk();
    }

    public function test_admin_login_rejects_non_admin_accounts()
    {
        User::factory()->create([
            'email' => 'user@example.com',
        ]);

        $this->post('/admin-login', [
            'email' => 'user@example.com',
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_admin_login_accepts_admin_accounts()
    {
        User::factory()->admin()->create([
            'email' => 'admin@example.com',
        ]);

        $this->post('/admin-login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticated();
    }
}
