<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    use HasFactory;

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

    public function stockIns(): HasMany
    {
        return $this->hasMany(StockIn::class);
    }

    public function stockOuts(): HasMany
    {
        return $this->hasMany(StockOut::class);
    }

    /**
     * Recalculate the stock status and persist the ingredient.
     */
    public function syncStatus(): static
    {
        if ((float) $this->quantity <= 0) {
            $this->status = 'Out of Stock';
        } elseif ((float) $this->quantity <= (float) $this->reorder_level) {
            $this->status = 'Low Stock';
        } else {
            $this->status = 'In Stock';
        }

        $this->save();

        return $this;
    }
}
