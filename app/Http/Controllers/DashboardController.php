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
    public function index(Request $request)
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $isAdmin = $request->user() && $request->user()->role === 'admin';

        // 1. Current Month Actual Income (Admin only - Total cash received this month for non-cancelled orders)
        $currentMonthRevenue = 0;
        if ($isAdmin) {
            $currentMonthRevenue = \App\Models\OrderPayment::whereHas('order', function($q) {
                    $q->where('status', '!=', 'cancelled');
                })
                ->whereBetween('payment_date', [$startOfMonth->toDateString(), $now->toDateString()])
                ->sum('amount');
        }

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

        // 7. Account Balances (Only available for admin)
        $accountBalances = [];
        if ($isAdmin) {
            $settings = \App\Models\Setting::where('key', 'payment_modes')->first();
            $paymentModes = $settings ? json_decode($settings->value, true) : [];
            
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

            $ledgerTransactions = \App\Models\Transaction::selectRaw('payment_mode, SUM(amount) as total')
                ->groupBy('payment_mode')
                ->get();

            foreach ($ledgerTransactions as $tx) {
                if (isset($accountBalances[$tx->payment_mode])) {
                    $accountBalances[$tx->payment_mode]['balance'] += (float)$tx->total;
                } else {
                    $accountBalances[$tx->payment_mode] = [
                        'name' => $tx->payment_mode,
                        'balance' => (float)$tx->total
                    ];
                }
            }
        }

        $topServices = \App\Models\OrderItem::whereHas('order', function($q) {
                $q->where('status', '!=', 'cancelled');
            })
            ->whereNotNull('service_id')
            ->with('service')
            ->selectRaw('service_id, COUNT(*) as orders_count, SUM(quantity) as total_quantity')
            ->groupBy('service_id')
            ->orderByDesc('total_quantity')
            ->take(10)
            ->get();

        $metrics = [
            'pending_orders_count' => $pendingOrdersCount,
            'active_orders_count' => $activeOrdersCount,
            'total_customers' => $totalCustomers,
        ];

        if ($isAdmin) {
            $metrics['current_month_revenue'] = $currentMonthRevenue;
        }

        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'recent_orders' => $recentOrders,
            'low_stock_items' => $lowStockItems,
            'account_balances' => array_values($accountBalances),
            'top_services' => $topServices,
        ]);
    }
}
