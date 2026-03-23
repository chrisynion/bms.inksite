<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $guarded = [];
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function overtimes()
    {
        return $this->hasMany(EmployeeOvertime::class);
    }
    
    protected $casts = [
        'hire_date' => 'date',
    ];
}
