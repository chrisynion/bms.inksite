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
        return Inertia::render('Orders/Create', [
            'customers' => Customer::orderBy('name')->get(),
            'employees' => Employee::orderBy('name')->get(),
            'services' => \App\Models\Service::all(),
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
            'order_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $validated['order_number'] = 'ORD-' . strtoupper(Str::random(8));

        $order = Order::create([
            'order_number' => $validated['order_number'],
            'customer_id' => $validated['customer_id'],
            'assigned_to' => $validated['assigned_to'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'],
            'order_total' => $validated['order_total'],
            'payment_status' => $validated['payment_status'],
            'order_notes' => $validated['order_notes'],
        ]);

        foreach ($validated['items'] as $item) {
            $order->items()->create([
                'service_id' => $item['service_id'] ?? null,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_price' => $item['quantity'] * $item['unit_price']
            ]);
        }

        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }

    public function edit(Order $order)
    {
        return Inertia::render('Orders/Edit', [
            'order' => $order->load(['items', 'invoice']),
            'customers' => Customer::orderBy('name')->get(),
            'employees' => Employee::orderBy('name')->get(),
            'services' => \App\Models\Service::all(),
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
            'order_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:order_items,id',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $order->update([
            'customer_id' => $validated['customer_id'],
            'assigned_to' => $validated['assigned_to'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'],
            'order_total' => $validated['order_total'],
            'payment_status' => $validated['payment_status'],
            'order_notes' => $validated['order_notes'],
        ]);

        // Sync items (delete removed items)
        $currentItemIds = collect($validated['items'])->pluck('id')->filter()->toArray();
        $order->items()->whereNotIn('id', $currentItemIds)->delete();

        foreach ($validated['items'] as $item) {
            $order->items()->updateOrCreate(
                ['id' => $item['id'] ?? null],
                [
                    'service_id' => $item['service_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price']
                ]
            );
        }

        return redirect()->route('orders.index')->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }
}
