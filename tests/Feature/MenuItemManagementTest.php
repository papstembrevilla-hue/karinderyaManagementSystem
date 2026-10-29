<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MenuItemManagementTest extends TestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = User::factory()->admin()->create();
        $this->actingAs($this->admin);
    }

    /**
     * Build a real 1x1 PNG upload (the GD extension is not installed here).
     */
    private function fakePng(string $name = 'dish.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'kms').'.png';

        file_put_contents(
            $path,
            base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            ),
        );

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    public function test_admin_can_create_a_menu_item_with_photo()
    {
        $category = Category::factory()->create();

        $this->post('/admin/menu-items', [
            'category_id' => $category->id,
            'name' => 'Chicken Adobo',
            'description' => 'Classic adobo.',
            'price' => 85.5,
            'photo' => $this->fakePng('adobo.png'),
            'is_available' => true,
        ])->assertRedirect(route('admin.menu-items.index'));

        $item = MenuItem::firstWhere('name', 'Chicken Adobo');

        $this->assertNotNull($item);
        $this->assertSame('85.50', $item->price);
        $this->assertNotNull($item->photo);
        Storage::disk('public')->assertExists($item->photo);
    }

    public function test_menu_item_requires_an_existing_category()
    {
        $this->post('/admin/menu-items', [
            'category_id' => 99999,
            'name' => 'Sinigang',
            'price' => 90,
        ])->assertSessionHasErrors('category_id');

        $this->assertDatabaseMissing('menu_items', ['name' => 'Sinigang']);
    }

    public function test_menu_item_photo_must_be_a_valid_image()
    {
        $category = Category::factory()->create();

        $this->post('/admin/menu-items', [
            'category_id' => $category->id,
            'name' => 'Pancit',
            'price' => 60,
            'photo' => UploadedFile::fake()->create('notes.pdf', 100, 'application/pdf'),
        ])->assertSessionHasErrors('photo');
    }

    public function test_updating_without_a_photo_keeps_the_existing_image()
    {
        $item = MenuItem::factory()->create(['photo' => 'menu-items/old.jpg']);
        Storage::disk('public')->put('menu-items/old.jpg', 'image');

        $this->put("/admin/menu-items/{$item->id}", [
            'category_id' => $item->category_id,
            'name' => 'Updated Dish',
            'price' => 99,
            'is_available' => true,
        ])->assertRedirect(route('admin.menu-items.index'));

        $this->assertSame('menu-items/old.jpg', $item->fresh()->photo);
        Storage::disk('public')->assertExists('menu-items/old.jpg');
    }

    public function test_replacing_a_photo_deletes_the_previous_file()
    {
        $item = MenuItem::factory()->create(['photo' => 'menu-items/old.jpg']);
        Storage::disk('public')->put('menu-items/old.jpg', 'image');

        $this->post("/admin/menu-items/{$item->id}", [
            '_method' => 'PUT',
            'category_id' => $item->category_id,
            'name' => $item->name,
            'price' => 99,
            'photo' => $this->fakePng('new.png'),
            'is_available' => true,
        ])->assertRedirect(route('admin.menu-items.index'));

        $updated = $item->fresh();

        $this->assertNotSame('menu-items/old.jpg', $updated->photo);
        Storage::disk('public')->assertMissing('menu-items/old.jpg');
        Storage::disk('public')->assertExists($updated->photo);
    }

    public function test_menu_items_can_be_searched_and_filtered()
    {
        $rice = Category::factory()->create(['name' => 'Rice Meals']);
        $drinks = Category::factory()->create(['name' => 'Drinks']);

        MenuItem::factory()->create([
            'category_id' => $rice->id,
            'name' => 'Chicken Adobo',
            'is_available' => true,
        ]);

        MenuItem::factory()->create([
            'category_id' => $drinks->id,
            'name' => 'Iced Tea',
            'is_available' => false,
        ]);

        $this->get('/admin/menu-items?search=Adobo&category_id='.$rice->id.'&availability=available')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/MenuItems/Index')
                ->has('menuItems.data', 1)
                ->where('menuItems.data.0.name', 'Chicken Adobo'));
    }

    public function test_menu_item_can_be_deleted_and_its_photo_removed()
    {
        $item = MenuItem::factory()->create(['photo' => 'menu-items/item.jpg']);
        Storage::disk('public')->put('menu-items/item.jpg', 'image');

        $this->delete("/admin/menu-items/{$item->id}")
            ->assertRedirect(route('admin.menu-items.index'));

        $this->assertDatabaseMissing('menu_items', ['id' => $item->id]);
        Storage::disk('public')->assertMissing('menu-items/item.jpg');
    }

    public function test_regular_user_cannot_manage_menu_items()
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get('/admin/menu-items')
            ->assertForbidden();
    }
}
