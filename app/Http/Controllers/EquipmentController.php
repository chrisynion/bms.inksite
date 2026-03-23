<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    public function index()
    {
        return Inertia::render('Equipment/Index', [
            'equipment' => Equipment::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Equipment/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'status' => 'required|string',
            'purchase_date' => 'nullable|date',
            'last_maintenance_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'hourly_cost' => 'nullable|numeric|min:0',
        ]);

        Equipment::create($validated);
        return redirect()->route('equipment.index')->with('success', 'Equipment added successfully.');
    }

    public function edit(Equipment $equipment)
    {
        return Inertia::render('Equipment/Edit', [
            'equipment' => $equipment
        ]);
    }

    public function update(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'status' => 'required|string',
            'purchase_date' => 'nullable|date',
            'last_maintenance_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'hourly_cost' => 'nullable|numeric|min:0',
        ]);

        $equipment->update($validated);
        return redirect()->route('equipment.index')->with('success', 'Equipment updated successfully.');
    }

    public function destroy(Equipment $equipment)
    {
        $equipment->delete();
        return redirect()->route('equipment.index')->with('success', 'Equipment deleted successfully.');
    }
}
