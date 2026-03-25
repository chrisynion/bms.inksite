<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $guarded = [];
    
    protected $casts = [
        'tags' => 'array',
    ];
    public function inventoryItems()
    {
        return $this->belongsToMany(InventoryItem::class, 'service_inventory')->withPivot('quantity');
    }

    public function equipment()
    {
        return $this->belongsToMany(Equipment::class, 'service_equipment')->withPivot('hours_used');
    }

    public function labor()
    {
        return $this->hasMany(ServiceLabor::class); // We'll create this model
    }
}
