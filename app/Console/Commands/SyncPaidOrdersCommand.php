<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Console\Command;

class SyncPaidOrdersCommand extends Command
{
    protected $signature = 'orders:sync-payments';
    protected $description = 'Synchronize payment records for orders marked as paid that have missing or partial payment records';

    public function handle(): int
    {
        $settings = Setting::where('key', 'payment_modes')->first();
        $paymentModes = $settings ? json_decode($settings->value, true) : [];
        $defaultMode = 'Cash';
        if (!empty($paymentModes) && is_array($paymentModes)) {
            $first = $paymentModes[0];
            $defaultMode = is_array($first) && isset($first['name']) ? $first['name'] : (is_string($first) ? $first : 'Cash');
        }

        $orders = Order::where('payment_status', 'paid')
            ->where(function ($q) {
                $q->whereNull('payment_amount')
                  ->orWhereRaw('COALESCE(payment_amount, 0) < COALESCE(order_total, 0)');
            })
            ->get();

        $this->info("Found {$orders->count()} paid orders needing payment synchronization.");

        $updatedCount = 0;
        $totalRestored = 0.0;

        foreach ($orders as $order) {
            $orderTotal = (float) $order->order_total;
            $existingPaymentsSum = (float) $order->payments()->sum('amount');
            $missingAmount = max(0, $orderTotal - $existingPaymentsSum);

            if ($missingAmount > 0) {
                $paymentDate = $order->order_date 
                    ? $order->order_date->toDateString() 
                    : ($order->created_at ? $order->created_at->toDateString() : now()->toDateString());

                $order->payments()->create([
                    'payment_mode' => $defaultMode,
                    'amount' => $missingAmount,
                    'reference_number' => 'Auto-Sync (Marked Paid)',
                    'payment_date' => $paymentDate,
                ]);

                $totalRestored += $missingAmount;
            }

            $order->update([
                'payment_amount' => $orderTotal,
                'fully_paid_at' => $order->fully_paid_at ?? $order->updated_at ?? now(),
            ]);

            $updatedCount++;
        }

        $formattedRestored = number_format($totalRestored, 2);
        $this->info("Successfully synchronized {$updatedCount} orders. Restored ₱{$formattedRestored} in payment records.");

        return self::SUCCESS;
    }
}
