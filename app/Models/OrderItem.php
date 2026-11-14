<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $guarded = [];

    protected $casts = [
        'inventory_deductions' => 'array',
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }
    
    public function service() {
        return $this->belongsTo(Service::class)->withTrashed();
    }

    /**
     * Restore any previously recorded inventory deductions for this line item.
     */
    public function restoreInventory(): void
    {
        $previousDeductions = $this->inventory_deductions ?? [];
        if (!empty($previousDeductions)) {
            $itemsById = InventoryItem::whereIn('id', array_keys($previousDeductions))
                ->get()
                ->keyBy('id');

            foreach ($previousDeductions as $inventoryItemId => $amount) {
                if (isset($itemsById[$inventoryItemId]) && $amount > 0) {
                    $itemsById[$inventoryItemId]->increment('stock', $amount);
                }
            }
        }

        if ($this->inventory_deductions !== null) {
            $this->update(['inventory_deductions' => null]);
        }
    }

    /**
     * Restore previous deductions for this item and deduct current service materials.
     */
    public function syncInventory(): void
    {
        $this->restoreInventory();
        $this->load('service.inventoryItems');

        $newDeductions = [];
        if ($this->service) {
            foreach ($this->service->inventoryItems as $material) {
                $multiplier = $this->quantity;

                // If the material is a Roll and the order item has dimensions, deduct by Area
                if (strtolower((string) $material->form) === 'roll' && $this->width && $this->height) {
                    $multiplier = $this->width * $this->height * $this->quantity;
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

        $this->update(['inventory_deductions' => $newDeductions]);
    }
}
