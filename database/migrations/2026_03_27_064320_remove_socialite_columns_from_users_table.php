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
        Schema::table('users', function (Blueprint $table) {
            $colsToDrop = [];
            if (Schema::hasColumn('users', 'provider_name')) $colsToDrop[] = 'provider_name';
            if (Schema::hasColumn('users', 'provider_id')) $colsToDrop[] = 'provider_id';
            
            if (count($colsToDrop) > 0) {
                $table->dropColumn($colsToDrop);
            }
            
            $table->string('password')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('provider_name')->nullable()->after('email');
            $table->string('provider_id')->nullable()->after('provider_name');
            $table->string('password')->nullable()->change();
        });
    }
};
