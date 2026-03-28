<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->decimal('purchase_price', 15, 4)->nullable()->after('price');
            $table->decimal('roll_width', 10, 4)->nullable()->after('purchase_price');
            $table->string('roll_width_unit')->nullable()->after('roll_width');
            $table->decimal('roll_length', 10, 4)->nullable()->after('roll_width_unit');
            $table->string('roll_length_unit')->nullable()->after('roll_length');
            $table->decimal('price_sqft', 15, 4)->nullable()->after('roll_length_unit');
            $table->decimal('price_sqin', 15, 4)->nullable()->after('price_sqft');
            $table->decimal('price_sqm', 15, 4)->nullable()->after('price_sqin');
            $table->decimal('price_sqcm', 15, 4)->nullable()->after('price_sqm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn([
                'purchase_price',
                'roll_width',
                'roll_width_unit',
                'roll_length',
                'roll_length_unit',
                'price_sqft',
                'price_sqin',
                'price_sqm',
                'price_sqcm',
            ]);
        });
    }
};
