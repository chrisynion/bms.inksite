<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Services/Index', [
            'services' => Service::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Services/Create', [
            'inventory_items' => \App\Models\InventoryItem::all(),
            'equipment' => \App\Models\Equipment::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|date_format:H:i',
            'profit_margin' => 'nullable|numeric',
            'inventory' => 'nullable|array',
            'inventory.*.id' => 'exists:inventory_items,id',
            'inventory.*.quantity' => 'numeric|min:0',
            'equipment' => 'nullable|array',
            'equipment.*.id' => 'exists:equipment,id',
            'equipment.*.hours_used' => 'numeric|min:0',
            'labor' => 'nullable|array',
            'labor.*.worker_type' => 'required|in:employee,contractor',
            'labor.*.work_type' => 'nullable|string',
            'labor.*.rate_type' => 'required|in:fixed,hourly',
            'labor.*.rate' => 'numeric|min:0',
            'labor.*.hours' => 'numeric|min:0',
        ]);

        $service = Service::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration' => $validated['duration'] ?? null,
            'profit_margin' => $validated['profit_margin'] ?? null,
        ]);

        if (!empty($validated['inventory'])) {
            foreach ($validated['inventory'] as $item) {
                $service->inventoryItems()->attach($item['id'], ['quantity' => $item['quantity']]);
            }
        }

        if (!empty($validated['equipment'])) {
            foreach ($validated['equipment'] as $item) {
                $service->equipment()->attach($item['id'], ['hours_used' => $item['hours_used']]);
            }
        }

        if (!empty($validated['labor'])) {
            foreach ($validated['labor'] as $row) {
                $service->labor()->create($row);
            }
        }

        return redirect()->route('services.index')->with('success', 'Service created successfully.');
    }

    public function edit(Service $service)
    {
        return Inertia::render('Services/Edit', [
            'service' => $service->load(['inventoryItems', 'equipment', 'labor']),
            'inventory_items' => \App\Models\InventoryItem::all(),
            'equipment' => \App\Models\Equipment::all(),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|date_format:H:i',
            'profit_margin' => 'nullable|numeric',
            'inventory' => 'nullable|array',
            'inventory.*.id' => 'exists:inventory_items,id',
            'inventory.*.quantity' => 'numeric|min:0',
            'equipment' => 'nullable|array',
            'equipment.*.id' => 'exists:equipment,id',
            'equipment.*.hours_used' => 'numeric|min:0',
            'labor' => 'nullable|array',
            'labor.*.worker_type' => 'required|in:employee,contractor',
            'labor.*.work_type' => 'nullable|string',
            'labor.*.rate_type' => 'required|in:fixed,hourly',
            'labor.*.rate' => 'numeric|min:0',
            'labor.*.hours' => 'numeric|min:0',
        ]);

        $service->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration' => $validated['duration'] ?? null,
            'profit_margin' => $validated['profit_margin'] ?? null,
        ]);

        // Sync Inventory
        $inventoryData = [];
        if (!empty($validated['inventory'])) {
            foreach ($validated['inventory'] as $item) {
                $inventoryData[$item['id']] = ['quantity' => $item['quantity']];
            }
        }
        $service->inventoryItems()->sync($inventoryData);

        // Sync Equipment
        $equipmentData = [];
        if (!empty($validated['equipment'])) {
            foreach ($validated['equipment'] as $item) {
                $equipmentData[$item['id']] = ['hours_used' => $item['hours_used']];
            }
        }
        $service->equipment()->sync($equipmentData);

        // Update Labor (delete and recreate for simplicity)
        $service->labor()->delete();
        if (!empty($validated['labor'])) {
            foreach ($validated['labor'] as $row) {
                $service->labor()->create($row);
            }
        }
        return redirect()->route('services.index')->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return redirect()->route('services.index')->with('success', 'Service deleted successfully.');
    }
}
