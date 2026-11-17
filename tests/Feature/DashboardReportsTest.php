<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('admin user receives full print shop reports on dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $customer = Customer::create([
        'name' => 'Northwind Print Co',
        'phone' => '09171234567',
    ]);

    $now = Carbon::now();

    // Recent in-progress order (On track)
    Order::create([
        'order_number' => 'ORD-DASH-1',
        'customer_id' => $customer->id,
        'order_date' => $now->toDateString(),
        'status' => 'in_progress',
        'order_total' => 5000,
        'payment_status' => 'unpaid',
    ]);

    // Overdue pending order (8 days old -> At Risk / Over)
    Order::create([
        'order_number' => 'ORD-DASH-2',
        'customer_id' => $customer->id,
        'order_date' => $now->copy()->subDays(8)->toDateString(),
        'status' => 'pending',
        'order_total' => 2500,
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('reports.pipeline', fn (Assert $pipeline) => $pipeline
                ->where('total_value', 7500)
                ->where('open_jobs_count', 2)
                ->where('at_risk_value', 2500)
                ->where('at_risk_count', 1)
                ->has('stages', 4)
                ->has('clients', 1)
                ->etc()
            )
            ->has('reports.revenue')
            ->has('reports.financial')
            ->has('reports.operations')
            ->has('reports.customers')
            ->has('reports.people')
        );
});

test('non-admin user does not receive restricted financial reports on dashboard', function () {
    $staff = User::factory()->create(['role' => 'staff']);

    $this->actingAs($staff)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('reports.revenue', null)
            ->where('reports.financial', null)
            ->where('reports.customers.total_outstanding_balance', null)
            ->where('reports.people.overtime_pay_this_month', null)
            ->has('reports.pipeline')
            ->has('reports.operations')
        );
});
