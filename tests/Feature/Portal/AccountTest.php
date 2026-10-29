<?php

namespace Tests\Feature\Portal;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AccountTest extends TestCase
{
    public function test_guests_are_redirected_to_login()
    {
        $this->get('/profile')->assertRedirect('/login');
        $this->get('/profile/addresses')->assertRedirect('/login');
    }

    public function test_account_page_shows_the_customers_own_recent_orders()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $own = Order::create([
            'reference' => 'KMS-OWN-'.Str::upper(Str::random(6)),
            'checkout_token' => Str::random(32),
            'user_id' => $user->id,
            'status' => Order::STATUS_PENDING,
            'fulfillment_method' => Order::FULFILLMENT_PICKUP,
            'payment_method' => Order::PAYMENT_CASH,
            'payment_status' => Order::PAYMENT_UNPAID,
            'subtotal' => 100,
            'total' => 100,
            'contact_phone' => '09171234567',
        ]);

        $foreign = Order::create([
            'reference' => 'KMS-FOREIGN-'.Str::upper(Str::random(6)),
            'checkout_token' => Str::random(32),
            'user_id' => $other->id,
            'status' => Order::STATUS_PENDING,
            'fulfillment_method' => Order::FULFILLMENT_PICKUP,
            'payment_method' => Order::PAYMENT_CASH,
            'payment_status' => Order::PAYMENT_UNPAID,
            'subtotal' => 100,
            'total' => 100,
            'contact_phone' => '09171234567',
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertSee($own->reference)
            ->assertDontSee($foreign->reference);
    }

    public function test_administrators_cannot_use_customer_account_pages()
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/dashboard')->assertForbidden();
        $this->actingAs($admin)->get('/profile')->assertForbidden();
    }

    public function test_customer_can_update_their_profile()
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
        ]);

        $this->actingAs($user)
            ->patch('/profile', [
                'name' => 'New Name',
                'email' => 'new@example.com',
                'phone' => '09170001111',
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertSame('New Name', $user->name);
        $this->assertSame('new@example.com', $user->email);
        $this->assertSame('09170001111', $user->phone);
        $this->assertNull($user->email_verified_at);
    }

    public function test_customers_cannot_change_their_own_role_through_the_profile_form()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'admin',
            ])
            ->assertRedirect();

        $this->assertSame('user', $user->fresh()->role);
    }

    public function test_customer_can_change_their_password()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put('/profile/password', [
                'current_password' => 'password',
                'password' => 'brand-new-password',
                'password_confirmation' => 'brand-new-password',
            ])
            ->assertRedirect();

        $this->assertTrue(Hash::check('brand-new-password', $user->fresh()->password));
    }

    public function test_the_first_address_becomes_the_default()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/profile/addresses', [
                'label' => 'Home',
                'recipient_name' => 'Ana Cruz',
                'phone' => '09171234567',
                'address' => '12 Mabini St',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'is_default' => true,
        ]);
    }

    public function test_setting_a_new_default_clears_the_previous_one()
    {
        $user = User::factory()->create();
        $first = Address::create([
            'user_id' => $user->id,
            'label' => 'Home',
            'recipient_name' => 'Ana Cruz',
            'phone' => '09171234567',
            'address' => '12 Mabini St',
            'is_default' => true,
        ]);

        $this->actingAs($user)
            ->post('/profile/addresses', [
                'label' => 'Work',
                'recipient_name' => 'Ana Cruz',
                'phone' => '09171234567',
                'address' => '88 Rizal Ave',
                'is_default' => true,
            ])
            ->assertRedirect();

        $this->assertFalse($first->fresh()->is_default);
        $this->assertSame(1, $user->addresses()->where('is_default', true)->count());
    }

    public function test_customer_cannot_update_another_customers_address()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $address = Address::create([
            'user_id' => $other->id,
            'label' => 'Home',
            'recipient_name' => 'Other Person',
            'phone' => '09000000000',
            'address' => 'Somewhere else',
            'is_default' => true,
        ]);

        $this->actingAs($user)
            ->put(route('portal.addresses.update', $address), [
                'label' => 'Hijacked',
                'recipient_name' => 'Intruder',
                'phone' => '09999999999',
                'address' => 'Hijacked address',
            ])
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('portal.addresses.destroy', $address))
            ->assertForbidden();

        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
            'label' => 'Home',
        ]);
    }

    public function test_deleting_the_default_address_promotes_another_one()
    {
        $user = User::factory()->create();
        $default = Address::create([
            'user_id' => $user->id,
            'label' => 'Home',
            'recipient_name' => 'Ana Cruz',
            'phone' => '09171234567',
            'address' => '12 Mabini St',
            'is_default' => true,
        ]);
        $backup = Address::create([
            'user_id' => $user->id,
            'label' => 'Work',
            'recipient_name' => 'Ana Cruz',
            'phone' => '09171234567',
            'address' => '88 Rizal Ave',
            'is_default' => false,
        ]);

        $this->actingAs($user)
            ->delete(route('portal.addresses.destroy', $default))
            ->assertRedirect();

        $this->assertDatabaseMissing('addresses', ['id' => $default->id]);
        $this->assertTrue($backup->fresh()->is_default);
    }
}
