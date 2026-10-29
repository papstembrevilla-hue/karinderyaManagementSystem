<?php

namespace Tests\Feature\Portal;

use App\Models\Category;
use App\Models\MenuItem;
use Tests\TestCase;

class MenuBrowsingTest extends TestCase
{
    public function test_guests_can_browse_the_storefront()
    {
        $category = Category::factory()->create(['name' => 'Silog']);
        MenuItem::factory()->create([
            'category_id' => $category->id,
            'name' => 'Tapsilog',
        ]);

        $this->get('/')->assertOk()->assertSee('Tapsilog');
        $this->get('/menu')->assertOk()->assertSee('Tapsilog');
        $this->get(route('menu.show', MenuItem::first()))->assertOk()->assertSee('Tapsilog');
    }

    public function test_home_only_lists_available_items_from_the_database()
    {
        MenuItem::factory()->create(['name' => 'Chicken Adobo', 'is_available' => true]);
        MenuItem::factory()->create(['name' => 'Sold Out Sisig', 'is_available' => false]);

        $this->get('/')
            ->assertOk()
            ->assertSee('Chicken Adobo')
            ->assertDontSee('Sold Out Sisig');
    }

    public function test_menu_can_be_searched_by_name()
    {
        MenuItem::factory()->create(['name' => 'Pork Sinigang']);
        MenuItem::factory()->create(['name' => 'Beef Tapa']);

        $this->get('/menu?q=Sinigang')
            ->assertOk()
            ->assertSee('Pork Sinigang')
            ->assertDontSee('Beef Tapa');
    }

    public function test_menu_can_be_filtered_to_available_items()
    {
        MenuItem::factory()->create(['name' => 'Garlic Rice', 'is_available' => true]);
        MenuItem::factory()->create(['name' => 'Unavailable Pancit', 'is_available' => false]);

        $this->get('/menu?available=1')
            ->assertOk()
            ->assertSee('Garlic Rice')
            ->assertDontSee('Unavailable Pancit');
    }

    public function test_menu_can_be_filtered_by_category()
    {
        $silog = Category::factory()->create(['name' => 'Silog']);
        $soup = Category::factory()->create(['name' => 'Sabaw']);

        MenuItem::factory()->create(['name' => 'Longsilog', 'category_id' => $silog->id]);
        MenuItem::factory()->create(['name' => 'Bulalo', 'category_id' => $soup->id]);

        $this->get('/menu?category='.$silog->id)
            ->assertOk()
            ->assertSee('Longsilog')
            ->assertDontSee('Bulalo');
    }

    public function test_food_details_show_the_database_price()
    {
        $item = MenuItem::factory()->create(['name' => 'Kare-Kare', 'price' => 149.5]);

        $this->get(route('menu.show', $item))
            ->assertOk()
            ->assertSee('Kare-Kare')
            ->assertSee('149.50');
    }
}
