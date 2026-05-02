<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Orders/Index', [
            'orders' => Order::with(['customer', 'employee'])->latest()->get()
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
            'due_date' => 'nullable|date',
            'status' => 'required|string',
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

        $order = Order::create([
            'order_number' => $validated['order_number'],
            'customer_id' => $validated['customer_id'],
            'assigned_to' => $validated['assigned_to'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'],
            'order_total' => $validated['order_total'],
            'payment_status' => $validated['payment_status'],
            'payment_amount' => $paymentAmount,
            'order_notes' => $validated['order_notes'],
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
            'due_date' => 'nullable|date',
            'status' => 'required|string',
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

        $order->update([
            'customer_id' => $validated['customer_id'],
            'assigned_to' => $validated['assigned_to'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'],
            'order_total' => $validated['order_total'],
            'payment_status' => $validated['payment_status'],
            'payment_amount' => $paymentAmount,
            'order_notes' => $validated['order_notes'],
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

        return redirect()->route('orders.index')->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }
}
