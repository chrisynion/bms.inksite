<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'due_date') && !Schema::hasColumn('orders', 'order_date')) {
                $table->renameColumn('due_date', 'order_date');
            }
            if (!Schema::hasColumn('orders', 'fully_paid_at')) {
                $table->timestamp('fully_paid_at')->nullable()->after('payment_amount');
            }
        });

        // Populate order_date with created_at date for existing orders where order_date is null
        DB::table('orders')
            ->whereNull('order_date')
            ->update([
                'order_date' => DB::raw('DATE(created_at)')
            ]);

        // Populate fully_paid_at for existing paid orders where fully_paid_at is null
        DB::table('orders')
            ->where('payment_status', 'paid')
            ->whereNull('fully_paid_at')
            ->update([
                'fully_paid_at' => DB::raw('COALESCE(payment_date, updated_at, created_at)')
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'order_date') && !Schema::hasColumn('orders', 'due_date')) {
                $table->renameColumn('order_date', 'due_date');
            }
            if (Schema::hasColumn('orders', 'fully_paid_at')) {
                $table->dropColumn('fully_paid_at');
            }
        });
    }
};
