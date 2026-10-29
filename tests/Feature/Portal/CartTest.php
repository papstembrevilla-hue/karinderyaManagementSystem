<?php

namespace Tests\Feature\Portal;

use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\User;
use Tests\TestCase;

class CartTest extends TestCase
{
    public function test_guests_are_redirected_to_login()
    {
        $this->get('/cart')->assertRedirect('/login');
        $this->post('/cart/items', [])->assertRedirect('/login');
    }

    public function test_customer_can_add_an_available_item()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create(['is_available' => true]);

        $this->actingAs($user)
            ->post(route('cart.store'), ['menu_item_id' => $item->id, 'quantity' => 2])
            ->assertRedirect();

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ]);
    }

    public function test_adding_the_same_item_merges_the_quantity()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create();

        $this->actingAs($user)->post(route('cart.store'), ['menu_item_id' => $item->id, 'quantity' => 2]);
        $this->actingAs($user)->post(route('cart.store'), ['menu_item_id' => $item->id, 'quantity' => 3]);

        $this->assertSame(1, CartItem::query()->where('user_id', $user->id)->count());
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 5,
        ]);
    }

    public function test_unavailable_items_cannot_be_added()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create(['is_available' => false]);

        $this->actingAs($user)
            ->post(route('cart.store'), ['menu_item_id' => $item->id, 'quantity' => 1])
            ->assertSessionHasErrors('menu_item_id');

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_quantity_must_be_between_one_and_ninety_nine()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create();

        $this->actingAs($user)
            ->post(route('cart.store'), ['menu_item_id' => $item->id, 'quantity' => 250])
            ->assertSessionHasErrors('quantity');

        $itemInCart = CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ]);

        $this->actingAs($user)
            ->patch(route('cart.update', $itemInCart), ['quantity' => 0])
            ->assertSessionHasErrors('quantity');
    }

    public function test_customer_can_update_and_remove_their_cart_item()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create();
        $cartItem = CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user)
            ->patch(route('cart.update', $cartItem), ['quantity' => 4])
            ->assertRedirect();

        $this->assertDatabaseHas('cart_items', ['id' => $cartItem->id, 'quantity' => 4]);

        $this->actingAs($user)->delete(route('cart.destroy', $cartItem))->assertRedirect();

        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
    }

    public function test_customer_cannot_modify_another_customers_cart_item()
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $item = MenuItem::factory()->create();
        $cartItem = CartItem::create([
            'user_id' => $owner->id,
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ]);

        $this->actingAs($intruder)
            ->patch(route('cart.update', $cartItem), ['quantity' => 9])
            ->assertForbidden();

        $this->actingAs($intruder)
            ->delete(route('cart.destroy', $cartItem))
            ->assertForbidden();

        $this->assertDatabaseHas('cart_items', ['id' => $cartItem->id, 'quantity' => 2]);
    }

    public function test_customer_can_clear_their_cart()
    {
        $user = User::factory()->create();
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => MenuItem::factory()->create()->id,
            'quantity' => 1,
        ]);
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => MenuItem::factory()->create()->id,
            'quantity' => 3,
        ]);

        $this->actingAs($user)->delete(route('cart.clear'))->assertRedirect();

        $this->assertSame(0, $user->cartItems()->count());
    }

    public function test_cart_page_recalculates_totals_from_the_database()
    {
        $user = User::factory()->create();
        $item = MenuItem::factory()->create(['price' => 75.5]);
        CartItem::create([
            'user_id' => $user->id,
            'menu_item_id' => $item->id,
            'quantity' => 3,
        ]);

        $this->actingAs($user)
            ->get('/cart')
            ->assertOk()
            ->assertSee('75.5')
            ->assertSee('226.5');
    }

    public function test_administrators_cannot_use_the_customer_cart()
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/cart')->assertForbidden();
    }
}
