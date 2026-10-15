<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();

            $table->string('ingredient_name');
            $table->string('category')->nullable();
            $table->string('photo')->nullable();

            $table->string('unit');

            $table->decimal('quantity', 12, 2)->default(0);
            $table->decimal('reorder_level', 12, 2)->default(0);
            $table->decimal('unit_cost', 12, 2)->default(0);

            $table->date('expiration_date')->nullable();

            $table->string('status')->default('In Stock');

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};