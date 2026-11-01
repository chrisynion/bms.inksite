<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Invoices/Index', [
            'invoices' => Invoice::with(['order.customer'])->latest()->get()
        ]);
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice->load(['order.customer', 'order.items.service', 'order.payments'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['order_id' => 'required|exists:orders,id']);
        
        $order = Order::with('items', 'invoice')->findOrFail($request->order_id);
        
        if ($order->invoice) {
            return back()->with('error', 'Invoice already exists for this order.');
        }

        $subtotal = $order->order_total;
        $tax_rate = 0; // Default tax rate could come from settings
        $tax_amount = $subtotal * ($tax_rate / 100);
        $total_amount = $subtotal + $tax_amount;

        $invoice = Invoice::create([
            'order_id' => $order->id,
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'issue_date' => now(),
            'due_date' => now()->addDays(14),
            'subtotal' => $subtotal,
            'tax_rate' => $tax_rate,
            'tax_amount' => $tax_amount,
            'discount_amount' => 0,
            'total_amount' => $total_amount,
            'status' => 'draft',
        ]);

        return redirect()->route('invoices.show', $invoice->id)->with('success', 'Invoice generated successfully.');
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'due_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $invoice->update($validated);
        
        if ($validated['status'] == 'paid' && $invoice->order) {
            $invoice->order->update([
                'payment_status' => 'paid',
                'fully_paid_at' => $invoice->order->fully_paid_at ?? now(),
            ]);
        } elseif ($invoice->order && $invoice->order->payment_status === 'paid') {
            $invoice->order->update([
                'payment_status' => $validated['status'] === 'partial' ? 'partial' : 'unpaid',
                'fully_paid_at' => null,
            ]);
        }
        
        return back()->with('success', 'Invoice updated.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        
        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }
}
