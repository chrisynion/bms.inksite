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

        // 1. Current Month Revenue (Only for non-cancelled and paid orders, or simply total value of orders placed this month - let's use all non-cancelled orders for total sales volume this month)
        $currentMonthRevenue = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->sum('order_total');

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

        return Inertia::render('Dashboard', [
            'metrics' => [
                'current_month_revenue' => $currentMonthRevenue,
                'pending_orders_count' => $pendingOrdersCount,
                'active_orders_count' => $activeOrdersCount,
                'total_customers' => $totalCustomers,
            ],
            'recent_orders' => $recentOrders,
            'low_stock_items' => $lowStockItems,
        ]);
    }
}
