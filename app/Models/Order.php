<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    public const INVENTORY_DEDUCTION_STATUSES = ['in_progress', 'ready', 'completed'];

    protected $guarded = [];
    
    protected $casts = [
        'tags' => 'array',
        'order_date' => 'date',
        'fully_paid_at' => 'datetime',
        'payment_date' => 'date',
        'inventory_deducted' => 'boolean',
        'inventory_deductions' => 'array',
    ];

    public function customer() {
        return $this->belongsTo(Customer::class);
    }

    public function employee() {
        return $this->belongsTo(Employee::class, 'assigned_to')->withTrashed();
    }

    public function items() {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice() {
        return $this->hasOne(Invoice::class);
    }

    public function payments() {
        return $this->hasMany(OrderPayment::class);
    }

    /**
     * Deduct inventory based on services in the order.
     */
    public function deductInventory(): void
    {
        $this->syncInventory();
    }

    /**
     * Reconcile inventory deductions for this order.
     * When the order was already deducted, only items in $syncItemIds are re-synced.
     */
    public function syncInventory(array $syncItemIds = []): void
    {
        DB::transaction(function () use ($syncItemIds) {
            if (!in_array($this->status, self::INVENTORY_DEDUCTION_STATUSES, true)) {
                $this->restoreRecordedDeductions();
                $this->update([
                    'inventory_deducted' => false,
                    'inventory_deductions' => [],
                ]);
                return;
            }

            $wasDeducted = (bool) $this->inventory_deducted;
            $this->load('items.service.inventoryItems');

            foreach ($this->items as $item) {
                if (!$wasDeducted || in_array($item->id, $syncItemIds, true)) {
                    $item->syncInventory();
                }
            }

            if (!$wasDeducted) {
                $this->update([
                    'inventory_deducted' => true,
                ]);
            }
        });
    }

    /**
     * Restore any previously recorded inventory deductions for this order.
     */
    public function restoreInventory(): void
    {
        DB::transaction(function () {
            $this->restoreRecordedDeductions();

            $this->update([
                'inventory_deducted' => false,
                'inventory_deductions' => [],
            ]);
        });
    }

    private function restoreRecordedDeductions(): void
    {
        $this->load('items');
        foreach ($this->items as $item) {
            $item->restoreInventory();
        }

        // Legacy fallback: restore order-level deductions if any exist
        $previousDeductions = $this->inventory_deductions ?? [];
        if (empty($previousDeductions)) {
            return;
        }

        $itemsById = InventoryItem::whereIn('id', array_keys($previousDeductions))
            ->get()
            ->keyBy('id');

        foreach ($previousDeductions as $inventoryItemId => $amount) {
            if (isset($itemsById[$inventoryItemId]) && $amount > 0) {
                $itemsById[$inventoryItemId]->increment('stock', $amount);
            }
        }
    }
}
