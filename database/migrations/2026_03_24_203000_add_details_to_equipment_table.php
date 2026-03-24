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
        Schema::table('equipment', function (Blueprint $table) {
            if (!Schema::hasColumn('equipment', 'purchase_date')) {
                $table->date('purchase_date')->after('location')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'last_maintenance_date')) {
                $table->date('last_maintenance_date')->after('purchase_date')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'next_maintenance_date')) {
                $table->date('next_maintenance_date')->after('last_maintenance_date')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'hourly_cost')) {
                $table->decimal('hourly_cost', 10, 2)->after('next_maintenance_date')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn(['purchase_date', 'last_maintenance_date', 'next_maintenance_date', 'hourly_cost']);
        });
    }
};
