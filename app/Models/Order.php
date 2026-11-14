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
     * Reconcile inventory deductions for this order: restore any previously
     * recorded deductions, then deduct current requirements if status qualifies.
     */
    public function syncInventory(): void
    {
        DB::transaction(function () {
            $this->restoreRecordedDeductions();

            if (!in_array($this->status, self::INVENTORY_DEDUCTION_STATUSES, true)) {
                $this->update([
                    'inventory_deducted' => false,
                    'inventory_deductions' => [],
                ]);
                return;
            }

            $this->load('items.service.inventoryItems');

            $newDeductions = [];
            foreach ($this->items as $item) {
                if (!$item->service) {
                    continue;
                }

                foreach ($item->service->inventoryItems as $material) {
                    $multiplier = $item->quantity;

                    // If the material is a Roll and the order item has dimensions, deduct by Area
                    if (strtolower((string) $material->form) === 'roll' && $item->width && $item->height) {
                        $multiplier = $item->width * $item->height * $item->quantity;
                    }

                    $deductAmount = $material->pivot->quantity * $multiplier;
                    if ($deductAmount > 0) {
                        $newDeductions[$material->id] = ($newDeductions[$material->id] ?? 0) + $deductAmount;
                    }
                }
            }

            if (!empty($newDeductions)) {
                $itemsById = InventoryItem::whereIn('id', array_keys($newDeductions))
                    ->get()
                    ->keyBy('id');

                foreach ($newDeductions as $inventoryItemId => $amount) {
                    if (isset($itemsById[$inventoryItemId])) {
                        $itemsById[$inventoryItemId]->decrement('stock', $amount);
                    }
                }
            }

            $this->update([
                'inventory_deducted' => true,
                'inventory_deductions' => $newDeductions,
            ]);
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
