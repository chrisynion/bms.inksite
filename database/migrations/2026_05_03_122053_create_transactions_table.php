<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'income', 'expense', 'transfer'
            $table->string('payment_mode'); // 'Cash', 'GCash', etc.
            $table->decimal('amount', 12, 2); // Can be negative for expenses
            $table->string('category')->nullable(); // 'Supplies', 'Payroll', 'Transfer Out', etc.
            $table->string('reference_number')->nullable();
            $table->date('transaction_date');
            $table->text('description')->nullable();
            $table->string('related_type')->nullable(); // For polymorphism if needed later
            $table->unsignedBigInteger('related_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
