<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceLabor extends Model
{
    protected $table = 'service_labor';
    protected $fillable = [
        'service_id',
        'worker_type',
        'work_type',
        'rate_type',
        'rate',
        'hours',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
