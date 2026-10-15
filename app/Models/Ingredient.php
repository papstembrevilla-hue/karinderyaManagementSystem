<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    protected $fillable = [
        'ingredient_name',
        'category',
        'photo',
        'unit',
        'quantity',
        'reorder_level',
        'unit_cost',
        'expiration_date',
        'status',
        'description',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'reorder_level' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'expiration_date' => 'date',
    ];
}