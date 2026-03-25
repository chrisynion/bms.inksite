<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];
    
    protected $casts = [
        'tags' => 'array',
        'due_date' => 'date',
        'payment_date' => 'date',
        'inventory_deducted' => 'boolean',
    ];

    public function customer() {
        return $this->belongsTo(Customer::class);
    }

    public function employee() {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    public function items() {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice() {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Deduct inventory based on services in the order.
     */
    public function deductInventory()
    {
        if ($this->inventory_deducted) return;

        foreach ($this->items as $item) {
            if ($item->service) {
                foreach ($item->service->inventoryItems as $material) {
                    $deductAmount = $material->pivot->quantity * $item->quantity;
                    $material->decrement('quantity', $deductAmount);
                }
            }
        }

        $this->update(['inventory_deducted' => true]);
    }
}
