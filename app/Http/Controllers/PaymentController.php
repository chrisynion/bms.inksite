<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'payment_date' => 'required|date',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create($validated);
        
        $invoice = Invoice::with('payments', 'order')->find($validated['invoice_id']);
        $totalPaid = $invoice->payments->sum('amount');
        
        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['status' => 'paid']);
            if ($invoice->order) {
                $invoice->order->update([
                    'payment_status' => 'paid',
                    'fully_paid_at' => $invoice->order->fully_paid_at ?? now(),
                ]);
            }
        } elseif ($totalPaid > 0) {
            if ($invoice->order) {
                $invoice->order->update([
                    'payment_status' => 'partial',
                    'fully_paid_at' => null,
                ]);
            }
        }

        return back()->with('success', 'Payment recorded successfully.');
    }
    
    public function destroy(Payment $payment)
    {
        $invoice = $payment->invoice;
        $payment->delete();
        
        // Recalculate invoice status
        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid < $invoice->total_amount && $totalPaid > 0) {
            $invoice->update(['status' => 'sent']);
            if ($invoice->order) {
                $invoice->order->update([
                    'payment_status' => 'partial',
                    'fully_paid_at' => null,
                ]);
            }
        } elseif ($totalPaid <= 0) {
            $invoice->update(['status' => 'sent']);
            if ($invoice->order) {
                $invoice->order->update([
                    'payment_status' => 'unpaid',
                    'fully_paid_at' => null,
                ]);
            }
        }
        
        return back()->with('success', 'Payment deleted successfully.');
    }
}
