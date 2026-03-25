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
}
