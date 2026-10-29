<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class IngredientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ingredient_name' => fake()->unique()->word(),
            'category' => fake()->randomElement([
                'Grains', 'Meat', 'Vegetable', 'Seafood', 'Condiment',
            ]),
            'photo' => null,
            'unit' => fake()->randomElement(['kg', 'g', 'L', 'ml', 'pcs']),
            'quantity' => fake()->numberBetween(20, 100),
            'reorder_level' => 10,
            'unit_cost' => fake()->randomFloat(2, 5, 200),
            'expiration_date' => null,
            'status' => 'In Stock',
            'description' => null,
        ];
    }
}
