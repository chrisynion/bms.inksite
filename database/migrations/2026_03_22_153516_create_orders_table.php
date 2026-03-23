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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('assigned_to')->nullable()->constrained('employees');
            $table->date('due_date')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('order_total', 12, 2)->default(0);
            $table->text('order_notes')->nullable();
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_method')->nullable();
            $table->decimal('payment_amount', 12, 2)->default(0);
            $table->date('payment_date')->nullable();
            $table->text('payment_notes')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
