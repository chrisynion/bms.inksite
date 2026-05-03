<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc');

        if ($request->filled('payment_mode')) {
            $query->where('payment_mode', $request->payment_mode);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->paginate(20)->withQueryString();

        $settings = Setting::where('key', 'payment_modes')->first();
        $paymentModes = $settings ? json_decode($settings->value, true) : [];
        $paymentModeNames = array_map(function($mode) { 
            return is_array($mode) && isset($mode['name']) ? $mode['name'] : (is_string($mode) ? $mode : 'Unknown'); 
        }, $paymentModes);

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'payment_modes' => $paymentModeNames,
            'filters' => $request->only(['payment_mode', 'type'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'payment_mode' => 'required_if:type,income,expense|string',
            'from_account' => 'required_if:type,transfer|string|different:to_account',
            'to_account' => 'required_if:type,transfer|string',
            'category' => 'required|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        if ($validated['type'] === 'transfer') {
            // Create negative transaction for source
            Transaction::create([
                'type' => 'transfer',
                'payment_mode' => $validated['from_account'],
                'amount' => -$validated['amount'],
                'category' => $validated['category'],
                'reference_number' => $validated['reference_number'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'] ? $validated['description'] . " (To {$validated['to_account']})" : "Transfer to {$validated['to_account']}",
            ]);

            // Create positive transaction for destination
            Transaction::create([
                'type' => 'transfer',
                'payment_mode' => $validated['to_account'],
                'amount' => $validated['amount'],
                'category' => $validated['category'],
                'reference_number' => $validated['reference_number'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'] ? $validated['description'] . " (From {$validated['from_account']})" : "Transfer from {$validated['from_account']}",
            ]);

            return back()->with('success', 'Transfer recorded successfully.');
        } else {
            // Income or Expense
            $amount = $validated['type'] === 'expense' ? -$validated['amount'] : $validated['amount'];

            Transaction::create([
                'type' => $validated['type'],
                'payment_mode' => $validated['payment_mode'],
                'amount' => $amount,
                'category' => $validated['category'],
                'reference_number' => $validated['reference_number'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'],
            ]);

            return back()->with('success', ucfirst($validated['type']) . ' recorded successfully.');
        }
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return back()->with('success', 'Transaction deleted successfully.');
    }
}
