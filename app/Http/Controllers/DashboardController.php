<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        // 1. Current Month Actual Income (Total cash received this month for non-cancelled orders)
        $currentMonthRevenue = \App\Models\OrderPayment::whereHas('order', function($q) {
                $q->where('status', '!=', 'cancelled');
            })
            ->whereBetween('payment_date', [$startOfMonth->toDateString(), $now->toDateString()])
            ->sum('amount');

        // 2. Pending Orders Count (Pending Approval & Quote)
        $pendingOrdersCount = Order::whereIn('status', ['quote', 'pending'])->count();

        // 3. Active Orders Count (In Progress & Ready)
        $activeOrdersCount = Order::whereIn('status', ['in_progress', 'ready'])->count();

        // 4. Total Customers
        $totalCustomers = Customer::count();

        // 5. Recent Orders (Last 5)
        $recentOrders = Order::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 6. Low Stock Alerts (Stock <= 10)
        $lowStockItems = InventoryItem::where('stock', '<=', 10)
            ->orderBy('stock', 'asc')
            ->take(8)
            ->get();

        // 7. Account Balances
        $settings = \App\Models\Setting::where('key', 'payment_modes')->first();
        $paymentModes = $settings ? json_decode($settings->value, true) : [];
        $accountBalances = [];
        
        if (is_array($paymentModes)) {
            foreach ($paymentModes as $mode) {
                $name = is_array($mode) && isset($mode['name']) ? $mode['name'] : (is_string($mode) ? $mode : 'Unknown');
                $initial = is_array($mode) && isset($mode['initial_amount']) ? (float)$mode['initial_amount'] : 0;
                $accountBalances[$name] = [
                    'name' => $name,
                    'balance' => $initial
                ];
            }
        }

        $payments = \App\Models\OrderPayment::whereHas('order', function($q) {
                $q->where('status', '!=', 'cancelled');
            })
            ->selectRaw('payment_mode, SUM(amount) as total')
            ->groupBy('payment_mode')
            ->get();

        foreach ($payments as $payment) {
            if (isset($accountBalances[$payment->payment_mode])) {
                $accountBalances[$payment->payment_mode]['balance'] += (float)$payment->total;
            } else {
                $accountBalances[$payment->payment_mode] = [
                    'name' => $payment->payment_mode,
                    'balance' => (float)$payment->total
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'metrics' => [
                'current_month_revenue' => $currentMonthRevenue,
                'pending_orders_count' => $pendingOrdersCount,
                'active_orders_count' => $activeOrdersCount,
                'total_customers' => $totalCustomers,
            ],
            'recent_orders' => $recentOrders,
            'low_stock_items' => $lowStockItems,
            'account_balances' => array_values($accountBalances),
        ]);
    }
}
