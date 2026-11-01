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
        if (!Schema::hasTable('service_labor')) {
            Schema::create('service_labor', function (Blueprint $table) {
                $table->id();
                $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
                $table->enum('worker_type', ['employee', 'contractor'])->default('employee'); // employee, contractor
                $table->string('work_type')->nullable(); // e.g. "Layout", "Printing", "Finishing"
                $table->string('rate_type')->default('fixed'); // fixed, hourly
                $table->decimal('rate', 10, 2)->default(0);
                $table->decimal('hours', 8, 2)->default(1);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_labor');
    }
};
