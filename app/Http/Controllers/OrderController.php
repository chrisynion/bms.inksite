<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->query('period', 'current_month');
        $now = Carbon::now();
        $startDate = null;
        $endDate = null;

        switch ($period) {
            case 'last_month':
                $startDate = $now->copy()->subMonthNoOverflow()->startOfMonth()->toDateString();
                $endDate = $now->copy()->subMonthNoOverflow()->endOfMonth()->toDateString();
                break;
            case 'last_3_months':
                $startDate = $now->copy()->subMonths(3)->startOfMonth()->toDateString();
                $endDate = $now->copy()->endOfMonth()->toDateString();
                break;
            case 'last_6_months':
                $startDate = $now->copy()->subMonths(6)->startOfMonth()->toDateString();
                $endDate = $now->copy()->endOfMonth()->toDateString();
                break;
            case 'full_year':
                $startDate = $now->copy()->startOfYear()->toDateString();
                $endDate = $now->copy()->endOfYear()->toDateString();
                break;
            case 'all':
                $startDate = null;
                $endDate = null;
                break;
            case 'current_month':
            default:
                $period = 'current_month';
                $startDate = $now->copy()->startOfMonth()->toDateString();
                $endDate = $now->copy()->endOfMonth()->toDateString();
                break;
        }

        $query = Order::with(['customer', 'employee']);

        if ($startDate && $endDate) {
            $query->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('order_date', [$startDate, $endDate])
                  ->orWhere(function ($sub) use ($startDate, $endDate) {
                      $sub->whereNull('order_date')
                          ->whereDate('created_at', '>=', $startDate)
                          ->whereDate('created_at', '<=', $endDate);
                  });
            });
        }

        $orders = $query->orderBy('order_date', 'desc')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function create()
    {
        $settings = \App\Models\Setting::where('key', 'payment_modes')->first();
        $paymentModes = $settings ? json_decode($settings->value, true) : [['name'=>'Cash','initial_amount'=>0], ['name'=>'GCash','initial_amount'=>0], ['name'=>'Bank Transfer','initial_amount'=>0]];
        $paymentModeNames = array_map(function($mode) { return is_array($mode) && isset($mode['name']) ? $mode['name'] : (is_string($mode) ? $mode : 'Unknown'); }, $paymentModes);

        return Inertia::render('Orders/Create', [
            'customers' => Customer::orderBy('name')->get(),
            'employees' => Employee::orderBy('name')->get(),
            'services' => \App\Models\Service::all(),
            'payment_modes' => $paymentModeNames,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'assigned_to' => 'nullable|exists:employees,id',
            'order_date' => 'nullable|date',
            'status' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value === 'completed' && $request->input('payment_status') !== 'paid') {
                        $fail('The Status cannot be "COMPLETED" if the order is not Fully Paid.');
                    }
                },
            ],
            'order_total' => 'nullable|numeric|min:0',
            'payment_status' => 'required|string',
            'payments' => 'nullable|array',
            'payments.*.payment_mode' => 'required_with:payments|string',
            'payments.*.amount' => 'required_with:payments|numeric|min:0',
            'payments.*.reference_number' => 'nullable|string',
            'payments.*.payment_date' => 'nullable|date',
            'order_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.description' => 'nullable|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.width' => 'nullable|numeric|min:0',
            'items.*.height' => 'nullable|numeric|min:0',
        ]);

        $validated['order_number'] = 'ORD-' . strtoupper(Str::random(8));

        $paymentAmount = 0;
        if (!empty($validated['payments'])) {
            foreach ($validated['payments'] as $p) {
                $paymentAmount += $p['amount'];
            }
        }

        $isFullyPaid = ($validated['payment_status'] === 'paid');

        if ($isFullyPaid) {
            $orderTotal = (float) ($validated['order_total'] ?? 0);
            if ($paymentAmount < $orderTotal) {
                $missing = $orderTotal - $paymentAmount;
                $defaultMode = !empty($validated['payments'][0]['payment_mode']) 
                    ? $validated['payments'][0]['payment_mode'] 
                    : 'Cash';
                $validated['payments'][] = [
                    'payment_mode' => $defaultMode,
                    'amount' => $missing,
                    'reference_number' => 'Full Payment',
                    'payment_date' => $validated['order_date'] ?? now()->toDateString(),
                ];
                $paymentAmount = $orderTotal;
            }
        }

        $order = Order::create([
            'order_number' => $validated['order_number'],
            'customer_id' => $validated['customer_id'],
            'assigned_to' => $validated['assigned_to'] ?? null,
            'order_date' => $validated['order_date'] ?? now()->toDateString(),
            'status' => $validated['status'],
            'order_total' => $validated['order_total'],
            'payment_status' => $validated['payment_status'],
            'payment_amount' => $paymentAmount,
            'fully_paid_at' => $isFullyPaid ? now() : null,
            'order_notes' => $validated['order_notes'] ?? null,
        ]);

        if (!empty($validated['payments'])) {
            foreach ($validated['payments'] as $p) {
                $order->payments()->create([
                    'payment_mode' => $p['payment_mode'],
                    'amount' => $p['amount'],
                    'reference_number' => $p['reference_number'] ?? null,
                    'payment_date' => $p['payment_date'] ?? now()->toDateString(),
                ]);
            }
        }

        foreach ($validated['items'] as $item) {
            $order->items()->create([
                'service_id' => $item['service_id'] ?? null,
                'description' => $item['description'] ?? '',
                'quantity' => $item['quantity'],
                'width' => $item['width'] ?? null,
                'height' => $item['height'] ?? null,
                'unit_price' => $item['unit_price'],
                'total_price' => ($item['width'] ?? 1) * ($item['height'] ?? 1) * $item['quantity'] * $item['unit_price']
            ]);
        }

        if (in_array($order->status, ['in_progress', 'ready', 'completed'])) {
            $order->deductInventory();
        }

        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }

    public function edit(Order $order)
    {
        $settings = \App\Models\Setting::where('key', 'payment_modes')->first();
        $paymentModes = $settings ? json_decode($settings->value, true) : [['name'=>'Cash','initial_amount'=>0], ['name'=>'GCash','initial_amount'=>0], ['name'=>'Bank Transfer','initial_amount'=>0]];
        $paymentModeNames = array_map(function($mode) { return is_array($mode) && isset($mode['name']) ? $mode['name'] : (is_string($mode) ? $mode : 'Unknown'); }, $paymentModes);

        return Inertia::render('Orders/Edit', [
            'order' => $order->load(['items', 'invoice', 'payments']),
            'customers' => Customer::orderBy('name')->get(),
            'employees' => Employee::orderBy('name')->get(),
            'services' => \App\Models\Service::withTrashed()->get(),
            'payment_modes' => $paymentModeNames,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'assigned_to' => 'nullable|exists:employees,id',
            'order_date' => 'nullable|date',
            'status' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value === 'completed' && $request->input('payment_status') !== 'paid') {
                        $fail('The Status cannot be "COMPLETED" if the order is not Fully Paid.');
                    }
                },
            ],
            'order_total' => 'nullable|numeric|min:0',
            'payment_status' => 'required|string',
            'payments' => 'nullable|array',
            'payments.*.id' => 'nullable|exists:order_payments,id',
            'payments.*.payment_mode' => 'required_with:payments|string',
            'payments.*.amount' => 'required_with:payments|numeric|min:0',
            'payments.*.reference_number' => 'nullable|string',
            'payments.*.payment_date' => 'nullable|date',
            'order_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:order_items,id',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.description' => 'nullable|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.width' => 'nullable|numeric|min:0',
            'items.*.height' => 'nullable|numeric|min:0',
        ]);

        $paymentAmount = 0;
        if (!empty($validated['payments'])) {
            foreach ($validated['payments'] as $p) {
                $paymentAmount += $p['amount'];
            }
        }

        $isFullyPaid = ($validated['payment_status'] === 'paid');

        if ($isFullyPaid) {
            $orderTotal = (float) ($validated['order_total'] ?? 0);
            if ($paymentAmount < $orderTotal) {
                $missing = $orderTotal - $paymentAmount;
                $defaultMode = !empty($validated['payments'][0]['payment_mode']) 
                    ? $validated['payments'][0]['payment_mode'] 
                    : 'Cash';
                $validated['payments'][] = [
                    'payment_mode' => $defaultMode,
                    'amount' => $missing,
                    'reference_number' => 'Full Payment',
                    'payment_date' => $validated['order_date'] ?? now()->toDateString(),
                ];
                $paymentAmount = $orderTotal;
            }
        }
        $fullyPaidAt = $isFullyPaid ? ($order->fully_paid_at ?? now()) : null;

        $order->update([
            'customer_id' => $validated['customer_id'],
            'assigned_to' => $validated['assigned_to'] ?? null,
            'order_date' => $validated['order_date'] ?? ($order->order_date ?? now()->toDateString()),
            'status' => $validated['status'],
            'order_total' => $validated['order_total'],
            'payment_status' => $validated['payment_status'],
            'payment_amount' => $paymentAmount,
            'fully_paid_at' => $fullyPaidAt,
            'order_notes' => $validated['order_notes'] ?? null,
        ]);

        // Sync payments
        $currentPaymentIds = collect($validated['payments'] ?? [])->pluck('id')->filter()->toArray();
        $order->payments()->whereNotIn('id', $currentPaymentIds)->delete();

        if (!empty($validated['payments'])) {
            foreach ($validated['payments'] as $p) {
                $order->payments()->updateOrCreate(
                    ['id' => $p['id'] ?? null],
                    [
                        'payment_mode' => $p['payment_mode'],
                        'amount' => $p['amount'],
                        'reference_number' => $p['reference_number'] ?? null,
                        'payment_date' => $p['payment_date'] ?? now()->toDateString(),
                    ]
                );
            }
        }

        // Sync items (delete removed items)
        $currentItemIds = collect($validated['items'])->pluck('id')->filter()->toArray();
        $order->items()->whereNotIn('id', $currentItemIds)->delete();

        foreach ($validated['items'] as $item) {
            $order->items()->updateOrCreate(
                ['id' => $item['id'] ?? null],
                [
                    'service_id' => $item['service_id'] ?? null,
                    'description' => $item['description'] ?? '',
                    'quantity' => $item['quantity'],
                    'width' => $item['width'] ?? null,
                    'height' => $item['height'] ?? null,
                    'unit_price' => $item['unit_price'],
                    'total_price' => ($item['width'] ?? 1) * ($item['height'] ?? 1) * $item['quantity'] * $item['unit_price']
                ]
            );
        }

        if (in_array($order->status, ['in_progress', 'ready', 'completed'])) {
            $order->deductInventory();
        }

        return redirect()->route('orders.edit', $order->id)->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->back(fallback: route('orders.index'))->with('success', 'Order deleted successfully.');
    }
}
