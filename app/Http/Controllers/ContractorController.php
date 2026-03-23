<?php

namespace App\Http\Controllers;

use App\Models\Contractor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractorController extends Controller
{
    public function index()
    {
        return Inertia::render('Contractors/Index', [
            'contractors' => Contractor::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Contractors/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialty' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'rating' => 'nullable|integer|min:1|max:5',
            'notes' => 'nullable|string',
        ]);

        Contractor::create($validated);
        return redirect()->route('contractors.index')->with('success', 'Contractor added successfully.');
    }

    public function edit(Contractor $contractor)
    {
        return Inertia::render('Contractors/Edit', [
            'contractor' => $contractor
        ]);
    }

    public function update(Request $request, Contractor $contractor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialty' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'rating' => 'nullable|integer|min:1|max:5',
            'notes' => 'nullable|string',
        ]);

        $contractor->update($validated);
        return redirect()->route('contractors.index')->with('success', 'Contractor updated successfully.');
    }

    public function destroy(Contractor $contractor)
    {
        $contractor->delete();
        return redirect()->route('contractors.index')->with('success', 'Contractor deleted successfully.');
    }
}
