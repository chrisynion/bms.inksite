<?php

use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('order page loads current month orders by default and filters by period', function () {
    $user = User::factory()->create();
    $customer = Customer::create([
        'name' => 'Period Test Customer',
        'phone' => '09998887777',
    ]);

    $now = Carbon::now();

    // 1. Order in current month
    $currentMonthOrder = Order::create([
        'order_number' => 'ORD-CUR-MONTH',
        'customer_id' => $customer->id,
        'order_date' => $now->copy()->startOfMonth()->addDays(2)->toDateString(),
        'status' => 'pending',
        'order_total' => 100,
        'payment_status' => 'unpaid',
    ]);

    // 2. Order in last month
    $lastMonthOrder = Order::create([
        'order_number' => 'ORD-LAST-MONTH',
        'customer_id' => $customer->id,
        'order_date' => $now->copy()->subMonthNoOverflow()->startOfMonth()->addDays(5)->toDateString(),
        'status' => 'pending',
        'order_total' => 200,
        'payment_status' => 'unpaid',
    ]);

    // 3. Order 4 months ago
    $fourMonthsAgoOrder = Order::create([
        'order_number' => 'ORD-4M-AGO',
        'customer_id' => $customer->id,
        'order_date' => $now->copy()->subMonths(4)->startOfMonth()->addDays(5)->toDateString(),
        'status' => 'pending',
        'order_total' => 300,
        'payment_status' => 'unpaid',
    ]);

    // Test Default: current_month
    $response = $this->actingAs($user)->get(route('orders.index'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Orders/Index')
        ->where('filters.period', 'current_month')
        ->has('orders', fn (Assert $orders) => $orders
            ->where('0.order_number', 'ORD-CUR-MONTH')
            ->etc()
        )
    );

    // Test: last_month
    $responseLastMonth = $this->actingAs($user)->get(route('orders.index', ['period' => 'last_month']));
    $responseLastMonth->assertOk();
    $responseLastMonth->assertInertia(fn (Assert $page) => $page
        ->component('Orders/Index')
        ->where('filters.period', 'last_month')
        ->has('orders', fn (Assert $orders) => $orders
            ->where('0.order_number', 'ORD-LAST-MONTH')
            ->etc()
        )
    );

    // Test: last_3_months (includes current and last month, but not 4 months ago)
    $response3M = $this->actingAs($user)->get(route('orders.index', ['period' => 'last_3_months']));
    $response3M->assertOk();
    $orderNumbers3M = collect($response3M->viewData('page')['props']['orders'])->pluck('order_number');
    expect($orderNumbers3M)->toContain('ORD-CUR-MONTH')
        ->and($orderNumbers3M)->toContain('ORD-LAST-MONTH')
        ->and($orderNumbers3M)->not->toContain('ORD-4M-AGO');

    // Test: last_6_months (includes all three)
    $response6M = $this->actingAs($user)->get(route('orders.index', ['period' => 'last_6_months']));
    $response6M->assertOk();
    $orderNumbers6M = collect($response6M->viewData('page')['props']['orders'])->pluck('order_number');
    expect($orderNumbers6M)->toContain('ORD-CUR-MONTH')
        ->and($orderNumbers6M)->toContain('ORD-LAST-MONTH')
        ->and($orderNumbers6M)->toContain('ORD-4M-AGO');

    // Test: full_year
    $responseYear = $this->actingAs($user)->get(route('orders.index', ['period' => 'full_year']));
    $responseYear->assertOk();
    $orderNumbersYear = collect($responseYear->viewData('page')['props']['orders'])->pluck('order_number');
    expect($orderNumbersYear)->toContain('ORD-CUR-MONTH')
        ->and($orderNumbersYear)->toContain('ORD-LAST-MONTH');

    // Test: all
    $responseAll = $this->actingAs($user)->get(route('orders.index', ['period' => 'all']));
    $responseAll->assertOk();
    $orderNumbersAll = collect($responseAll->viewData('page')['props']['orders'])->pluck('order_number');
    expect($orderNumbersAll)->toContain('ORD-CUR-MONTH')
        ->and($orderNumbersAll)->toContain('ORD-LAST-MONTH')
        ->and($orderNumbersAll)->toContain('ORD-4M-AGO');
});
