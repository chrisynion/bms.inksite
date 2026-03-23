<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $guarded = [];
    
    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function payments() {
        return $this->hasMany(Payment::class);
    }
}
