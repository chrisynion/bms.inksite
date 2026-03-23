<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Index', [
            'inventory' => InventoryItem::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventory/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string',
            'color' => 'nullable|string',
            'finish' => 'nullable|string',
            'thickness' => 'nullable|numeric',
            'width' => 'nullable|numeric',
            'length' => 'nullable|numeric',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'location' => 'nullable|string',
            'form' => 'nullable|string',
        ]);

        InventoryItem::create($validated);
        return redirect()->route('inventory.index')->with('success', 'Item created successfully.');
    }

    public function edit(InventoryItem $inventory)
    {
        return Inertia::render('Inventory/Edit', [
            'item' => $inventory
        ]);
    }

    public function update(Request $request, InventoryItem $inventory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string',
            'color' => 'nullable|string',
            'finish' => 'nullable|string',
            'thickness' => 'nullable|numeric',
            'width' => 'nullable|numeric',
            'length' => 'nullable|numeric',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'location' => 'nullable|string',
            'form' => 'nullable|string',
        ]);

        $inventory->update($validated);
        return redirect()->route('inventory.index')->with('success', 'Item updated successfully.');
    }

    public function destroy(InventoryItem $inventory)
    {
        $inventory->delete();
        return redirect()->route('inventory.index')->with('success', 'Item deleted successfully.');
    }
}
