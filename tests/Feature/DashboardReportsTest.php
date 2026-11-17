<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderPayment;
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
    $order1 = Order::create([
        'order_number' => 'ORD-DASH-1',
        'customer_id' => $customer->id,
        'order_date' => $now->toDateString(),
        'status' => 'in_progress',
        'order_total' => 5000,
        'payment_status' => 'partial',
    ]);

    OrderPayment::create([
        'order_id' => $order1->id,
        'payment_mode' => 'Cash',
        'amount' => 1500,
        'payment_date' => $now->toDateString(),
    ]);

    OrderPayment::create([
        'order_id' => $order1->id,
        'payment_mode' => 'GCash',
        'amount' => 1000,
        'payment_date' => $now->toDateString(),
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
            ->has('payment_summary', fn (Assert $ps) => $ps
                ->where('period', 'today')
                ->where('period_label', 'Today')
                ->where('default_mode', 'Cash')
                ->where('total', 2500)
                ->where('all_time_total', 2500)
                ->has('modes', 2)
                ->etc()
            )
        );
});

test('admin user can filter dashboard payment summary by week, month, and custom range', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $customer = Customer::create([
        'name' => 'Duration Client',
        'phone' => '09170001111',
    ]);

    $now = Carbon::now();
    $order = Order::create([
        'order_number' => 'ORD-DUR-1',
        'customer_id' => $customer->id,
        'order_date' => $now->toDateString(),
        'status' => 'in_progress',
        'order_total' => 5000,
        'payment_status' => 'partial',
    ]);

    // Payment today
    OrderPayment::create([
        'order_id' => $order->id,
        'payment_mode' => 'Cash',
        'amount' => 500,
        'payment_date' => $now->toDateString(),
    ]);

    // Payment 40 days ago (outside today/week/month)
    $oldDate = $now->copy()->subDays(40)->toDateString();
    OrderPayment::create([
        'order_id' => $order->id,
        'payment_mode' => 'Cash',
        'amount' => 1200,
        'payment_date' => $oldDate,
    ]);

    // Today only sees 500
    $this->actingAs($admin)
        ->get(route('dashboard', ['payment_period' => 'today']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('payment_summary.period', 'today')
            ->where('payment_summary.total', 500)
            ->where('payment_summary.all_time_total', 1700)
        );

    // Custom range covering oldDate..today sees 1700
    $this->actingAs($admin)
        ->get(route('dashboard', [
            'payment_period' => 'custom',
            'payment_start_date' => $oldDate,
            'payment_end_date' => $now->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('payment_summary.period', 'custom')
            ->where('payment_summary.total', 1700)
        );
});

test('non-admin user does not receive restricted financial reports on dashboard', function () {
    $staff = User::factory()->create(['role' => 'staff']);

    $this->actingAs($staff)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('payment_summary', null)
            ->where('reports.revenue', null)
            ->where('reports.financial', null)
            ->where('reports.customers.total_outstanding_balance', null)
            ->where('reports.people.overtime_pay_this_month', null)
            ->has('reports.pipeline')
            ->has('reports.operations')
        );
});
