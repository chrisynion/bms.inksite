<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\EmployeeOvertime;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\Setting;
use App\Models\Transaction;
use Carbon\Carbon;

class ReportingService
{
    /**
     * Resolve start and end dates (defaults to current month if omitted).
     */
    public function resolveDateRange(?string $startDate = null, ?string $endDate = null): array
    {
        $now = Carbon::now();
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : $now->copy()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : $now->copy()->endOfDay();

        return [
            'start' => $start,
            'end' => $end,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    /**
     * 1. Financial Summary: revenue, ledger income/expenses, net cashflow, account balances, and receivables.
     */
    public function getFinancialSummary(?string $startDate = null, ?string $endDate = null): array
    {
        $range = $this->resolveDateRange($startDate, $endDate);

        // Order payments collected in period (excluding cancelled orders)
        $orderPaymentsQuery = OrderPayment::whereHas('order', function ($q) {
            $q->where('status', '!=', 'cancelled');
        })->whereBetween('payment_date', [$range['start_date'], $range['end_date']]);

        $orderRevenueTotal = (float) (clone $orderPaymentsQuery)->sum('amount');

        $orderPaymentsByMode = (clone $orderPaymentsQuery)
            ->selectRaw('payment_mode, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_mode')
            ->get()
            ->map(fn ($row) => [
                'payment_mode' => $row->payment_mode,
                'total' => (float) $row->total,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();

        // Cashbook / Ledger transactions in period
        $ledgerTransactions = Transaction::whereBetween('transaction_date', [$range['start_date'], $range['end_date']])->get();

        $ledgerIncome = (float) $ledgerTransactions->where('type', 'income')->sum('amount');
        // Note: expenses are stored as negative amounts in TransactionController
        $ledgerExpenses = abs((float) $ledgerTransactions->where('type', 'expense')->sum('amount'));

        $expensesByCategory = Transaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$range['start_date'], $range['end_date']])
            ->selectRaw('category, SUM(ABS(amount)) as total, COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'total' => (float) $row->total,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();

        $incomeByCategory = Transaction::where('type', 'income')
            ->whereBetween('transaction_date', [$range['start_date'], $range['end_date']])
            ->selectRaw('category, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'total' => (float) $row->total,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();

        // All-time Account Balances across Payment Modes
        $accountBalances = $this->getAccountBalances();

        // Total Unpaid / Outstanding Receivables (non-cancelled, non-quote orders)
        $unpaidOrders = Order::whereNotIn('status', ['cancelled', 'quote'])
            ->whereRaw('COALESCE(order_total, 0) > COALESCE(payment_amount, 0)')
            ->get();

        $totalReceivables = (float) $unpaidOrders->sum(fn ($o) => max(0, (float) $o->order_total - (float) $o->payment_amount));

        $totalCashIn = $orderRevenueTotal + $ledgerIncome;
        $netCashflow = $totalCashIn - $ledgerExpenses;

        return [
            'period' => [
                'start_date' => $range['start_date'],
                'end_date' => $range['end_date'],
            ],
            'order_payments_collected' => $orderRevenueTotal,
            'order_payments_by_mode' => $orderPaymentsByMode,
            'ledger_other_income' => $ledgerIncome,
            'ledger_income_by_category' => $incomeByCategory,
            'ledger_expenses' => $ledgerExpenses,
            'expenses_by_category' => $expensesByCategory,
            'total_cash_in' => $totalCashIn,
            'net_cashflow' => $netCashflow,
            'outstanding_receivables_total' => $totalReceivables,
            'unpaid_orders_count' => $unpaidOrders->count(),
            'account_balances' => $accountBalances,
        ];
    }

    /**
     * Compute current balances for all configured payment modes.
     */
    public function getAccountBalances(): array
    {
        $accountBalances = [];
        $settings = Setting::where('key', 'payment_modes')->first();
        $paymentModes = $settings ? json_decode($settings->value, true) : [];

        if (is_array($paymentModes)) {
            foreach ($paymentModes as $mode) {
                $name = is_array($mode) && isset($mode['name']) ? $mode['name'] : (is_string($mode) ? $mode : 'Unknown');
                $initial = is_array($mode) && isset($mode['initial_amount']) ? (float) $mode['initial_amount'] : 0.0;
                $accountBalances[$name] = [
                    'name' => $name,
                    'balance' => $initial,
                ];
            }
        }

        $payments = OrderPayment::whereHas('order', function ($q) {
            $q->where('status', '!=', 'cancelled');
        })
            ->selectRaw('payment_mode, SUM(amount) as total')
            ->groupBy('payment_mode')
            ->get();

        foreach ($payments as $payment) {
            if (isset($accountBalances[$payment->payment_mode])) {
                $accountBalances[$payment->payment_mode]['balance'] += (float) $payment->total;
            } else {
                $accountBalances[$payment->payment_mode] = [
                    'name' => $payment->payment_mode,
                    'balance' => (float) $payment->total,
                ];
            }
        }

        $ledgerTransactions = Transaction::selectRaw('payment_mode, SUM(amount) as total')
            ->groupBy('payment_mode')
            ->get();

        foreach ($ledgerTransactions as $tx) {
            if (isset($accountBalances[$tx->payment_mode])) {
                $accountBalances[$tx->payment_mode]['balance'] += (float) $tx->total;
            } else {
                $accountBalances[$tx->payment_mode] = [
                    'name' => $tx->payment_mode,
                    'balance' => (float) $tx->total,
                ];
            }
        }

        return array_values($accountBalances);
    }

    /**
     * 2. Orders & Services Analysis: status breakdown, top services, and unpaid orders list.
     */
    public function analyzeOrdersAndServices(?string $startDate = null, ?string $endDate = null, ?string $status = null): array
    {
        $range = $this->resolveDateRange($startDate, $endDate);

        $ordersQuery = Order::with(['customer', 'employee'])
            ->whereBetween('order_date', [$range['start_date'], $range['end_date']]);

        if ($status) {
            $ordersQuery->where('status', $status);
        }

        $orders = $ordersQuery->get();

        $byStatus = Order::whereBetween('order_date', [$range['start_date'], $range['end_date']])
            ->selectRaw('status, COUNT(*) as count, SUM(COALESCE(order_total, 0)) as total_value, SUM(COALESCE(payment_amount, 0)) as total_paid')
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'count' => (int) $row->count,
                'total_value' => (float) $row->total_value,
                'total_paid' => (float) $row->total_paid,
            ])
            ->values()
            ->all();

        $topServices = OrderItem::whereHas('order', function ($q) use ($range) {
            $q->where('status', '!=', 'cancelled')
              ->whereBetween('order_date', [$range['start_date'], $range['end_date']]);
        })
            ->whereNotNull('service_id')
            ->with('service')
            ->selectRaw('service_id, COUNT(*) as order_lines_count, SUM(quantity) as total_quantity, SUM(COALESCE(total_price, 0)) as total_revenue')
            ->groupBy('service_id')
            ->orderByDesc('total_revenue')
            ->take(10)
            ->get()
            ->map(fn ($item) => [
                'service_id' => $item->service_id,
                'service_name' => $item->service?->name ?? 'Deleted Service',
                'category' => $item->service?->category ?? null,
                'order_lines_count' => (int) $item->order_lines_count,
                'total_quantity' => (float) $item->total_quantity,
                'total_revenue' => (float) $item->total_revenue,
            ])
            ->values()
            ->all();

        $unpaidOrders = Order::with('customer')
            ->whereNotIn('status', ['cancelled', 'quote'])
            ->whereRaw('COALESCE(order_total, 0) > COALESCE(payment_amount, 0)')
            ->orderBy('order_date', 'asc')
            ->take(20)
            ->get()
            ->map(fn ($o) => [
                'order_number' => $o->order_number,
                'customer_name' => $o->customer?->name ?? 'Unknown',
                'order_date' => $o->order_date?->toDateString(),
                'status' => $o->status,
                'payment_status' => $o->payment_status,
                'order_total' => (float) $o->order_total,
                'payment_amount' => (float) $o->payment_amount,
                'balance_due' => max(0, (float) $o->order_total - (float) $o->payment_amount),
            ])
            ->values()
            ->all();

        return [
            'period' => [
                'start_date' => $range['start_date'],
                'end_date' => $range['end_date'],
            ],
            'total_orders_in_period' => $orders->count(),
            'total_order_value_in_period' => (float) $orders->where('status', '!=', 'cancelled')->sum('order_total'),
            'orders_by_status' => $byStatus,
            'top_services' => $topServices,
            'outstanding_unpaid_orders' => $unpaidOrders,
        ];
    }

    /**
     * 3. Inventory Health & Restock Report.
     */
    public function getInventoryReport(int $lowStockThreshold = 10): array
    {
        $items = InventoryItem::orderBy('stock', 'asc')->get();

        $lowStockItems = $items->filter(fn ($i) => $i->stock <= $lowStockThreshold)
            ->map(fn ($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'type' => $i->type,
                'form' => $i->form,
                'stock' => (float) $i->stock,
                'price' => (float) $i->price,
                'purchase_price' => (float) ($i->purchase_price ?? 0),
                'location' => $i->location,
            ])
            ->values()
            ->all();

        $estimatedValue = (float) $items->sum(fn ($i) => (float) $i->stock * (float) ($i->purchase_price ?: $i->price));

        return [
            'total_sku_count' => $items->count(),
            'out_of_stock_count' => $items->where('stock', '<=', 0)->count(),
            'low_stock_threshold' => $lowStockThreshold,
            'low_stock_count' => count($lowStockItems),
            'estimated_inventory_value' => $estimatedValue,
            'low_stock_items' => $lowStockItems,
            'all_items_summary' => $items->take(50)->map(fn ($i) => [
                'name' => $i->name,
                'form' => $i->form,
                'stock' => (float) $i->stock,
                'price' => (float) $i->price,
                'location' => $i->location,
            ])->values()->all(),
        ];
    }

    /**
     * 4. Customer Insights: top customers by revenue and highest outstanding balances.
     */
    public function getCustomerInsights(int $limit = 10): array
    {
        $customers = Customer::with(['orders' => function ($q) {
            $q->where('status', '!=', 'cancelled');
        }])->get();

        $ranked = $customers->map(function ($c) {
            $validOrders = $c->orders;
            $NonQuoteOrders = $validOrders->where('status', '!=', 'quote');
            $totalBilled = (float) $NonQuoteOrders->sum('order_total');
            $totalPaid = (float) $NonQuoteOrders->sum('payment_amount');

            return [
                'customer_id' => $c->id,
                'name' => $c->name,
                'company_name' => $c->company_name,
                'phone' => $c->phone,
                'orders_count' => $NonQuoteOrders->count(),
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'balance_due' => max(0, $totalBilled - $totalPaid),
            ];
        });

        return [
            'total_customers' => $customers->count(),
            'top_customers_by_revenue' => $ranked->sortByDesc('total_paid')->take($limit)->values()->all(),
            'customers_with_outstanding_balance' => $ranked->filter(fn ($c) => $c['balance_due'] > 0)
                ->sortByDesc('balance_due')
                ->take($limit)
                ->values()
                ->all(),
        ];
    }

    /**
     * 5. Employee Workload & Overtime Report.
     */
    public function getEmployeeWorkload(?string $startDate = null, ?string $endDate = null): array
    {
        $range = $this->resolveDateRange($startDate, $endDate);

        $employees = Employee::with([
            'overtimes' => function ($q) use ($range) {
                $q->whereBetween('date', [$range['start_date'], $range['end_date']]);
            },
        ])->get();

        $workload = $employees->map(function ($emp) use ($range) {
            $ordersInPeriod = Order::where('assigned_to', $emp->id)
                ->whereBetween('order_date', [$range['start_date'], $range['end_date']])
                ->where('status', '!=', 'cancelled')
                ->get();

            $activeAssigned = Order::where('assigned_to', $emp->id)
                ->whereIn('status', ['pending', 'in_progress', 'ready'])
                ->count();

            $overtimeHours = (float) $emp->overtimes->sum('hours');
            $overtimePay = (float) $emp->overtimes->sum('total_pay');

            return [
                'employee_id' => $emp->id,
                'name' => $emp->name,
                'role' => $emp->role,
                'status' => $emp->status,
                'hourly_rate' => (float) $emp->hourly_rate,
                'orders_in_period' => $ordersInPeriod->count(),
                'completed_in_period' => $ordersInPeriod->where('status', 'completed')->count(),
                'currently_active_orders' => $activeAssigned,
                'overtime_hours_in_period' => $overtimeHours,
                'overtime_pay_in_period' => $overtimePay,
            ];
        })->values()->all();

        $totalOvertimePay = collect($workload)->sum('overtime_pay_in_period');
        $totalOvertimeHours = collect($workload)->sum('overtime_hours_in_period');

        return [
            'period' => [
                'start_date' => $range['start_date'],
                'end_date' => $range['end_date'],
            ],
            'total_overtime_hours' => (float) $totalOvertimeHours,
            'total_overtime_pay' => (float) $totalOvertimePay,
            'employees' => $workload,
        ];
    }

    /**
     * 6. Full Business Snapshot combining all dimensions for executive AI reporting.
     */
    public function getFullBusinessSnapshot(?string $startDate = null, ?string $endDate = null): array
    {
        return [
            'generated_at' => Carbon::now()->toIso8601String(),
            'financial_summary' => $this->getFinancialSummary($startDate, $endDate),
            'orders_and_services' => $this->analyzeOrdersAndServices($startDate, $endDate),
            'inventory_report' => $this->getInventoryReport(10),
            'customer_insights' => $this->getCustomerInsights(10),
            'employee_workload' => $this->getEmployeeWorkload($startDate, $endDate),
        ];
    }
}
