<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeOvertime extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}
