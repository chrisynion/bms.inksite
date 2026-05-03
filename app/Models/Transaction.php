<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'payment_mode',
        'amount',
        'category',
        'reference_number',
        'transaction_date',
        'description',
        'related_type',
        'related_id',
    ];
}
