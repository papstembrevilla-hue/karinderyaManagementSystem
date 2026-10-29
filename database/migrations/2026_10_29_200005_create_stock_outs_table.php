<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_outs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ingredient_id')
                ->constrained()
                ->restrictOnDelete();

            $table->decimal('quantity', 12, 2);
            $table->string('reason');
            $table->date('occurred_at');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_outs');
    }
};
