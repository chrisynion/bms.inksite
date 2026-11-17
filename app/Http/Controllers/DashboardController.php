<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Equipment;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\Setting;
use App\Services\ReportingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(protected ReportingService $reporting)
    {
    }

    public function index(Request $request)
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $isAdmin = $request->user() && strtolower((string) $request->user()->role) === 'admin';

        // 1. Current Month Actual Income (Admin only)
        $currentMonthRevenue = 0.0;
        if ($isAdmin) {
            $currentMonthRevenue = (float) OrderPayment::whereHas('order', function ($q) {
                $q->where('status', '!=', 'cancelled');
            })
                ->whereBetween('payment_date', [$startOfMonth->toDateString(), $now->toDateString()])
                ->sum('amount');
        }

        // 2. Pending & Active Orders
        $pendingOrdersCount = Order::whereIn('status', ['quote', 'pending'])->count();
        $activeOrdersCount = Order::whereIn('status', ['in_progress', 'ready'])->count();
        $totalCustomers = Customer::count();

        // 3. Recent Orders (Last 5)
        $recentOrders = Order::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 4. Low Stock Alerts (Stock <= 10)
        $lowStockItems = InventoryItem::where('stock', '<=', 10)
            ->orderBy('stock', 'asc')
            ->take(8)
            ->get();

        // 5. Account Balances (Admin only)
        $accountBalances = $isAdmin ? $this->reporting->getAccountBalances() : [];

        // 6. Top 10 Bought Services
        $topServices = OrderItem::whereHas('order', function ($q) {
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
            'account_balances' => $accountBalances,
            'top_services' => $topServices,
            'payment_summary' => $isAdmin ? $this->buildPaymentSummary($request, $now) : null,
            'reports' => $this->buildPrintShopReports($now, $isAdmin, $accountBalances),
        ]);
    }

    private function resolvePaymentPeriod(Request $request, Carbon $now): array
    {
        $period = strtolower((string) $request->query('payment_period', 'today'));
        if (!in_array($period, ['today', 'week', 'month', 'custom'], true)) {
            $period = 'today';
        }

        if ($period === 'week') {
            $start = $now->copy()->startOfWeek();
            $end = $now->copy()->endOfWeek();
            $label = 'This Week';
        } elseif ($period === 'month') {
            $start = $now->copy()->startOfMonth();
            $end = $now->copy()->endOfMonth();
            $label = 'This Month';
        } elseif ($period === 'custom') {
            try {
                $rawStart = $request->query('payment_start_date');
                $rawEnd = $request->query('payment_end_date');
                $start = $rawStart ? Carbon::parse($rawStart)->startOfDay() : $now->copy()->startOfDay();
                $end = $rawEnd ? Carbon::parse($rawEnd)->endOfDay() : $now->copy()->endOfDay();
                if ($start->gt($end)) {
                    [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
                }
                $label = $start->format('M j') . ' – ' . $end->format('M j, Y');
            } catch (\Throwable $e) {
                $period = 'today';
                $start = $now->copy()->startOfDay();
                $end = $now->copy()->endOfDay();
                $label = 'Today';
            }
        } else {
            $start = $now->copy()->startOfDay();
            $end = $now->copy()->endOfDay();
            $label = 'Today';
        }

        return [
            'period' => $period,
            'label' => $label,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    private function buildPaymentSummary(Request $request, Carbon $now): array
    {
        $range = $this->resolvePaymentPeriod($request, $now);
        $settings = Setting::where('key', 'payment_modes')->first();
        $configuredModes = $settings ? json_decode($settings->value, true) : [];

        $modesMap = [];
        if (is_array($configuredModes)) {
            foreach ($configuredModes as $mode) {
                $name = is_array($mode) && isset($mode['name'])
                    ? (string) $mode['name']
                    : (is_string($mode) ? $mode : null);
                if ($name && !isset($modesMap[$name])) {
                    $modesMap[$name] = [
                        'name' => $name,
                        'total' => 0.0,
                        'count' => 0,
                        'all_time_total' => 0.0,
                        'all_time_count' => 0,
                    ];
                }
            }
        }

        $baseQuery = OrderPayment::whereHas('order', fn ($q) => $q->where('status', '!=', 'cancelled'));

        $periodRows = (clone $baseQuery)
            ->whereDate('payment_date', '>=', $range['start_date'])
            ->whereDate('payment_date', '<=', $range['end_date'])
            ->selectRaw('payment_mode, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_mode')
            ->get();

        foreach ($periodRows as $row) {
            $name = (string) ($row->payment_mode ?: 'Cash');
            if (!isset($modesMap[$name])) {
                $modesMap[$name] = [
                    'name' => $name,
                    'total' => 0.0,
                    'count' => 0,
                    'all_time_total' => 0.0,
                    'all_time_count' => 0,
                ];
            }
            $modesMap[$name]['total'] += (float) $row->total;
            $modesMap[$name]['count'] += (int) $row->count;
        }

        $allTimeRows = (clone $baseQuery)
            ->selectRaw('payment_mode, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_mode')
            ->get();

        foreach ($allTimeRows as $row) {
            $name = (string) ($row->payment_mode ?: 'Cash');
            if (!isset($modesMap[$name])) {
                $modesMap[$name] = [
                    'name' => $name,
                    'total' => 0.0,
                    'count' => 0,
                    'all_time_total' => 0.0,
                    'all_time_count' => 0,
                ];
            }
            $modesMap[$name]['all_time_total'] += (float) $row->total;
            $modesMap[$name]['all_time_count'] += (int) $row->count;
        }

        if (empty($modesMap)) {
            $modesMap['Cash'] = [
                'name' => 'Cash',
                'total' => 0.0,
                'count' => 0,
                'all_time_total' => 0.0,
                'all_time_count' => 0,
            ];
        }

        $modes = array_values($modesMap);
        $defaultMode = 'Cash';
        foreach ($modes as $m) {
            if (strcasecmp($m['name'], 'Cash') === 0) {
                $defaultMode = $m['name'];
                break;
            }
        }
        if (collect($modes)->every(fn ($m) => strcasecmp($m['name'], $defaultMode) !== 0)) {
            $defaultMode = $modes[0]['name'];
        }

        // Put default mode (Cash) first, then sort remaining by all_time_total desc
        usort($modes, function ($a, $b) use ($defaultMode) {
            if ($a['name'] === $defaultMode) {
                return -1;
            }
            if ($b['name'] === $defaultMode) {
                return 1;
            }
            return $b['all_time_total'] <=> $a['all_time_total'];
        });

        $periodTotal = (float) collect($modes)->sum('total');
        $periodCount = (int) collect($modes)->sum('count');
        $allTimeTotal = (float) collect($modes)->sum('all_time_total');
        $allTimeCount = (int) collect($modes)->sum('all_time_count');

        return [
            'period' => $range['period'],
            'period_label' => $range['label'],
            'start_date' => $range['start_date'],
            'end_date' => $range['end_date'],
            'default_mode' => $defaultMode,
            'total' => $periodTotal,
            'count' => $periodCount,
            'all_time_total' => $allTimeTotal,
            'all_time_count' => $allTimeCount,
            'modes' => $modes,
        ];
    }

    private function buildPrintShopReports(Carbon $now, bool $isAdmin, array $accountBalances): array
    {
        $startOfMonth = $now->copy()->startOfMonth();
        $prevStart = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $prevEnd = $now->copy()->subMonthNoOverflow()->endOfMonth();

        return [
            'period_label' => $now->format('F Y'),
            'pipeline' => $this->buildPipelineReport($now, $startOfMonth, $prevStart, $prevEnd),
            'revenue' => $isAdmin ? $this->buildRevenueReport($now, $startOfMonth, $prevStart, $prevEnd) : null,
            'financial' => $isAdmin ? $this->buildFinancialReport($now, $startOfMonth, $accountBalances) : null,
            'operations' => $this->buildOperationsReport($now, $startOfMonth),
            'customers' => $this->buildCustomersReport($startOfMonth, $isAdmin),
            'people' => $this->buildPeopleReport($now, $startOfMonth, $isAdmin),
        ];
    }

    private function computeOrderAgeDays(Order $order, Carbon $now): int
    {
        $refDate = $order->order_date ?? $order->created_at;
        if (!$refDate) {
            return 0;
        }

        return max(0, (int) Carbon::parse($refDate)->startOfDay()->diffInDays($now->copy()->startOfDay(), false));
    }

    private function classifyJobHealth(string $status, int $ageDays): string
    {
        if ($status === 'ready' || $status === 'completed') {
            return 'on';
        }
        if ($ageDays >= 7) {
            return 'over';
        }
        if ($ageDays >= 4) {
            return 'watch';
        }

        return 'on';
    }

    private function worstHealth(?string $current, string $incoming): string
    {
        $rank = ['on' => 1, 'watch' => 2, 'over' => 3];
        if (!$current || ($rank[$incoming] ?? 0) > ($rank[$current] ?? 0)) {
            return $incoming;
        }

        return $current;
    }

    private function buildPipelineReport(Carbon $now, Carbon $startOfMonth, Carbon $prevStart, Carbon $prevEnd): array
    {
        $stageDefs = [
            'quote' => ['label' => 'Quote', 'weight' => 0.25],
            'pending' => ['label' => 'Queued', 'weight' => 0.60],
            'in_progress' => ['label' => 'Printing', 'weight' => 0.85],
            'ready' => ['label' => 'Ready', 'weight' => 0.95],
        ];

        $openOrders = Order::with('customer')
            ->whereIn('status', array_keys($stageDefs))
            ->get();

        $totalValue = 0.0;
        $weightedValue = 0.0;
        $atRiskValue = 0.0;
        $atRiskCount = 0;

        $stageBuckets = [];
        foreach ($stageDefs as $key => $meta) {
            $stageBuckets[$key] = ['key' => $key, 'label' => $meta['label'], 'value' => 0.0, 'count' => 0];
        }

        $clientRows = [];

        foreach ($openOrders as $order) {
            $val = (float) ($order->order_total ?? 0);
            $status = $order->status;
            $ageDays = $this->computeOrderAgeDays($order, $now);
            $health = $this->classifyJobHealth($status, $ageDays);

            $totalValue += $val;
            $weightedValue += $val * ($stageDefs[$status]['weight'] ?? 0.5);

            if ($health === 'over') {
                $atRiskValue += $val;
                $atRiskCount++;
            }

            $stageBuckets[$status]['value'] += $val;
            $stageBuckets[$status]['count']++;

            $custId = $order->customer_id ?? 0;
            $custName = $order->customer?->name ?? 'Walk-in Client';

            if (!isset($clientRows[$custId])) {
                $clientRows[$custId] = [
                    'customer_id' => $custId,
                    'name' => $custName,
                    'total_value' => 0.0,
                    'stages' => [
                        'quote' => ['value' => 0.0, 'count' => 0, 'health' => null],
                        'pending' => ['value' => 0.0, 'count' => 0, 'health' => null],
                        'in_progress' => ['value' => 0.0, 'count' => 0, 'health' => null],
                        'ready' => ['value' => 0.0, 'count' => 0, 'health' => null],
                    ],
                ];
            }

            $clientRows[$custId]['total_value'] += $val;
            $clientRows[$custId]['stages'][$status]['value'] += $val;
            $clientRows[$custId]['stages'][$status]['count']++;
            $clientRows[$custId]['stages'][$status]['health'] = $this->worstHealth(
                $clientRows[$custId]['stages'][$status]['health'],
                $health
            );
        }

        $stagesList = array_map(function ($bucket) use ($totalValue) {
            $bucket['pct'] = $totalValue > 0 ? round(($bucket['value'] / $totalValue) * 100) : 0;

            return $bucket;
        }, array_values($stageBuckets));

        usort($stagesList, fn ($a, $b) => $b['value'] <=> $a['value']);

        $clientsList = array_values($clientRows);
        usort($clientsList, fn ($a, $b) => $b['total_value'] <=> $a['total_value']);
        $clientsList = array_slice($clientsList, 0, 6);

        $thisMonthCreated = (float) Order::where('status', '!=', 'cancelled')
            ->whereBetween('order_date', [$startOfMonth->toDateString(), $now->toDateString()])
            ->sum('order_total');

        $prevMonthCreated = (float) Order::where('status', '!=', 'cancelled')
            ->whereBetween('order_date', [$prevStart->toDateString(), $prevEnd->toDateString()])
            ->sum('order_total');

        $vsLastMonthPct = $prevMonthCreated > 0
            ? round((($thisMonthCreated - $prevMonthCreated) / $prevMonthCreated) * 100)
            : null;

        return [
            'total_value' => $totalValue,
            'open_jobs_count' => $openOrders->count(),
            'weighted_value' => $weightedValue,
            'weighted_pct' => $totalValue > 0 ? round(($weightedValue / $totalValue) * 100) : 0,
            'at_risk_value' => $atRiskValue,
            'at_risk_count' => $atRiskCount,
            'vs_last_month_pct' => $vsLastMonthPct,
            'stages' => $stagesList,
            'clients' => $clientsList,
        ];
    }

    private function buildRevenueReport(Carbon $now, Carbon $startOfMonth, Carbon $prevStart, Carbon $prevEnd): array
    {
        $collectedThisMonth = (float) OrderPayment::whereHas('order', fn ($q) => $q->where('status', '!=', 'cancelled'))
            ->whereBetween('payment_date', [$startOfMonth->toDateString(), $now->toDateString()])
            ->sum('amount');

        $collectedLastMonth = (float) OrderPayment::whereHas('order', fn ($q) => $q->where('status', '!=', 'cancelled'))
            ->whereBetween('payment_date', [$prevStart->toDateString(), $prevEnd->toDateString()])
            ->sum('amount');

        $vsLastMonthPct = $collectedLastMonth > 0
            ? round((($collectedThisMonth - $collectedLastMonth) / $collectedLastMonth) * 100)
            : null;

        $monthOrders = Order::whereNotIn('status', ['cancelled', 'quote'])
            ->whereBetween('order_date', [$startOfMonth->toDateString(), $now->toDateString()])
            ->get();

        $billedThisMonth = (float) $monthOrders->sum('order_total');
        $ordersCount = $monthOrders->count();
        $avgOrderValue = $ordersCount > 0 ? $billedThisMonth / $ordersCount : 0.0;
        $collectionRatePct = $billedThisMonth > 0 ? min(100, round(($collectedThisMonth / $billedThisMonth) * 100)) : 0;

        $ordersAnalysis = $this->reporting->analyzeOrdersAndServices($startOfMonth->toDateString(), $now->toDateString());
        $topServices = $ordersAnalysis['top_services'] ?? [];
        $totalServiceRev = (float) collect($topServices)->sum('total_revenue');

        $topServicesFormatted = array_map(function ($svc) use ($totalServiceRev) {
            $svc['share_pct'] = $totalServiceRev > 0 ? round(($svc['total_revenue'] / $totalServiceRev) * 100) : 0;

            return $svc;
        }, array_slice($topServices, 0, 6));

        // Donut: top 4 services + Other
        $donut = [];
        $topFour = array_slice($topServices, 0, 4);
        $topFourSum = 0.0;
        foreach ($topFour as $svc) {
            $topFourSum += $svc['total_revenue'];
            $donut[] = [
                'label' => $svc['service_name'],
                'value' => $svc['total_revenue'],
                'pct' => $totalServiceRev > 0 ? round(($svc['total_revenue'] / $totalServiceRev) * 100) : 0,
            ];
        }
        $otherRev = max(0.0, $totalServiceRev - $topFourSum);
        if ($otherRev > 0) {
            $donut[] = [
                'label' => 'Other Services',
                'value' => $otherRev,
                'pct' => $totalServiceRev > 0 ? round(($otherRev / $totalServiceRev) * 100) : 0,
            ];
        }

        return [
            'collected_this_month' => $collectedThisMonth,
            'vs_last_month_pct' => $vsLastMonthPct,
            'billed_this_month' => $billedThisMonth,
            'collection_rate_pct' => $collectionRatePct,
            'avg_order_value' => $avgOrderValue,
            'orders_count_this_month' => $ordersCount,
            'total_service_revenue' => $totalServiceRev,
            'top_services' => $topServicesFormatted,
            'by_service_donut' => $donut,
        ];
    }

    private function buildFinancialReport(Carbon $now, Carbon $startOfMonth, array $accountBalances): array
    {
        $summary = $this->reporting->getFinancialSummary($startOfMonth->toDateString(), $now->toDateString());
        $totalCashIn = (float) ($summary['total_cash_in'] ?? 0);
        $expenses = (float) ($summary['ledger_expenses'] ?? 0);
        $expenseRatioPct = $totalCashIn > 0 ? round(($expenses / $totalCashIn) * 100) : 0;

        $expensesByCat = array_map(function ($row) use ($expenses) {
            return [
                'label' => $row['category'] ?: 'Uncategorized',
                'value' => (float) $row['total'],
                'count' => (int) $row['count'],
                'pct' => $expenses > 0 ? round(($row['total'] / $expenses) * 100) : 0,
            ];
        }, array_slice($summary['expenses_by_category'] ?? [], 0, 5));

        return [
            'total_cash_in' => $totalCashIn,
            'payment_modes_count' => count($accountBalances),
            'ledger_expenses' => $expenses,
            'expense_ratio_pct' => $expenseRatioPct,
            'net_cashflow' => (float) ($summary['net_cashflow'] ?? 0),
            'outstanding_receivables' => (float) ($summary['outstanding_receivables_total'] ?? 0),
            'unpaid_orders_count' => (int) ($summary['unpaid_orders_count'] ?? 0),
            'account_balances' => $accountBalances,
            'expenses_by_category' => $expensesByCat,
        ];
    }

    private function buildOperationsReport(Carbon $now, Carbon $startOfMonth): array
    {
        $activeOrders = Order::with(['customer', 'employee'])
            ->whereIn('status', ['quote', 'pending', 'in_progress', 'ready'])
            ->orderByRaw('COALESCE(order_date, DATE(created_at)) asc')
            ->get();

        $watchOrOver = 0;
        $activeQueue = [];

        foreach ($activeOrders as $order) {
            $ageDays = $this->computeOrderAgeDays($order, $now);
            $health = $this->classifyJobHealth($order->status, $ageDays);
            if ($health === 'watch' || $health === 'over') {
                $watchOrOver++;
            }
            if (count($activeQueue) < 8) {
                $activeQueue[] = [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer?->name ?? 'Walk-in Client',
                    'assigned_to' => $order->employee?->name ?? 'Unassigned',
                    'status' => $order->status,
                    'age_days' => $ageDays,
                    'health' => $health,
                ];
            }
        }

        $completedThisMonth = Order::where('status', 'completed')
            ->whereBetween('updated_at', [$startOfMonth->copy()->startOfDay(), $now->copy()->endOfDay()])
            ->count();

        $inventory = $this->reporting->getInventoryReport(10);
        $totalSku = (int) ($inventory['total_sku_count'] ?? 0);
        $outOfStock = (int) ($inventory['out_of_stock_count'] ?? 0);
        $lowStockOnly = max(0, (int) ($inventory['low_stock_count'] ?? 0) - $outOfStock);
        $healthyStock = max(0, $totalSku - $outOfStock - $lowStockOnly);

        $inventoryDonut = [
            [
                'label' => 'Healthy Stock',
                'value' => $healthyStock,
                'pct' => $totalSku > 0 ? round(($healthyStock / $totalSku) * 100) : 0,
            ],
            [
                'label' => 'Low Stock (≤10)',
                'value' => $lowStockOnly,
                'pct' => $totalSku > 0 ? round(($lowStockOnly / $totalSku) * 100) : 0,
            ],
            [
                'label' => 'Out of Stock',
                'value' => $outOfStock,
                'pct' => $totalSku > 0 ? round(($outOfStock / $totalSku) * 100) : 0,
            ],
        ];

        $equipmentTotal = Equipment::count();
        $equipmentOperational = Equipment::where('status', 'operational')->count();
        $equipmentMaintenance = max(0, $equipmentTotal - $equipmentOperational);

        return [
            'active_jobs_count' => $activeOrders->count(),
            'watch_or_over_count' => $watchOrOver,
            'completed_this_month' => $completedThisMonth,
            'on_time_rate_pct' => $activeOrders->count() > 0
                ? round((($activeOrders->count() - $watchOrOver) / $activeOrders->count()) * 100)
                : 100,
            'low_stock_count' => (int) ($inventory['low_stock_count'] ?? 0),
            'out_of_stock_count' => $outOfStock,
            'total_sku_count' => $totalSku,
            'active_queue' => $activeQueue,
            'inventory_donut' => $inventoryDonut,
            'equipment_summary' => [
                'total' => $equipmentTotal,
                'operational' => $equipmentOperational,
                'maintenance' => $equipmentMaintenance,
            ],
        ];
    }

    private function buildCustomersReport(Carbon $startOfMonth, bool $isAdmin): array
    {
        $customers = Customer::with(['orders' => fn ($q) => $q->where('status', '!=', 'cancelled')])->get();
        $totalCustomers = $customers->count();
        $newThisMonth = $customers->filter(fn ($c) => $c->created_at && $c->created_at->gte($startOfMonth))->count();

        $repeatCount = 0;
        $oneTimeCount = 0;
        $prospectCount = 0;
        $withBalanceCount = 0;
        $totalBalance = 0.0;
        $ranked = [];

        foreach ($customers as $c) {
            $nonQuoteOrders = $c->orders->where('status', '!=', 'quote');
            $ordersCount = $nonQuoteOrders->count();

            if ($ordersCount >= 2) {
                $repeatCount++;
                $segment = 'Repeat';
            } elseif ($ordersCount === 1) {
                $oneTimeCount++;
                $segment = 'One-time';
            } else {
                $prospectCount++;
                $segment = 'Prospect';
            }

            $totalBilled = (float) $nonQuoteOrders->sum('order_total');
            $totalPaid = (float) $nonQuoteOrders->sum(fn ($o) => $o->payment_status === 'paid'
                ? (float) $o->order_total
                : (float) ($o->payment_amount ?? 0));
            $balanceDue = max(0.0, $totalBilled - $totalPaid);

            if ($balanceDue > 0) {
                $withBalanceCount++;
                $totalBalance += $balanceDue;
            }

            $ranked[] = [
                'customer_id' => $c->id,
                'name' => $c->name,
                'company_name' => $c->company_name,
                'orders_count' => $ordersCount,
                'segment' => $segment,
                'total_paid' => $isAdmin ? $totalPaid : null,
                'balance_due' => $isAdmin ? $balanceDue : null,
                '_sort_key' => $isAdmin ? $totalPaid : $ordersCount,
            ];
        }

        usort($ranked, fn ($a, $b) => $b['_sort_key'] <=> $a['_sort_key']);
        $topClients = array_map(function ($row) {
            unset($row['_sort_key']);

            return $row;
        }, array_slice($ranked, 0, 6));

        $mixDonut = [
            [
                'label' => 'Repeat Clients',
                'value' => $repeatCount,
                'pct' => $totalCustomers > 0 ? round(($repeatCount / $totalCustomers) * 100) : 0,
            ],
            [
                'label' => 'One-time Clients',
                'value' => $oneTimeCount,
                'pct' => $totalCustomers > 0 ? round(($oneTimeCount / $totalCustomers) * 100) : 0,
            ],
            [
                'label' => 'Quotes / Prospects',
                'value' => $prospectCount,
                'pct' => $totalCustomers > 0 ? round(($prospectCount / $totalCustomers) * 100) : 0,
            ],
        ];

        return [
            'total_customers' => $totalCustomers,
            'new_this_month' => $newThisMonth,
            'repeat_customers' => $repeatCount,
            'repeat_rate_pct' => $totalCustomers > 0 ? round(($repeatCount / $totalCustomers) * 100) : 0,
            'customers_with_balance_count' => $withBalanceCount,
            'total_outstanding_balance' => $isAdmin ? $totalBalance : null,
            'top_clients' => $topClients,
            'mix_donut' => $mixDonut,
        ];
    }

    private function buildPeopleReport(Carbon $now, Carbon $startOfMonth, bool $isAdmin): array
    {
        $workload = $this->reporting->getEmployeeWorkload($startOfMonth->toDateString(), $now->toDateString());
        $employees = $workload['employees'] ?? [];

        $activeStaffCount = collect($employees)->where('status', 'active')->count();
        $assignedActiveJobs = (int) collect($employees)->sum('currently_active_orders');
        $unassignedActiveJobs = Order::whereIn('status', ['pending', 'in_progress', 'ready'])
            ->whereNull('assigned_to')
            ->count();

        usort($employees, fn ($a, $b) => $b['currently_active_orders'] <=> $a['currently_active_orders']);

        $totalActive = $assignedActiveJobs + $unassignedActiveJobs;
        $jobsDonut = [];
        foreach (array_slice($employees, 0, 4) as $emp) {
            if ($emp['currently_active_orders'] > 0) {
                $jobsDonut[] = [
                    'label' => $emp['name'],
                    'value' => $emp['currently_active_orders'],
                    'pct' => $totalActive > 0 ? round(($emp['currently_active_orders'] / $totalActive) * 100) : 0,
                ];
            }
        }
        if ($unassignedActiveJobs > 0) {
            $jobsDonut[] = [
                'label' => 'Unassigned',
                'value' => $unassignedActiveJobs,
                'pct' => $totalActive > 0 ? round(($unassignedActiveJobs / $totalActive) * 100) : 0,
            ];
        }

        return [
            'active_staff_count' => $activeStaffCount,
            'total_staff_count' => count($employees),
            'assigned_active_jobs' => $assignedActiveJobs,
            'unassigned_active_jobs' => $unassignedActiveJobs,
            'overtime_hours_this_month' => (float) ($workload['total_overtime_hours'] ?? 0),
            'overtime_pay_this_month' => $isAdmin ? (float) ($workload['total_overtime_pay'] ?? 0) : null,
            'operators' => array_slice($employees, 0, 8),
            'jobs_donut' => $jobsDonut,
        ];
    }
}
