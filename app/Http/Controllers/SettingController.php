<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->keyBy('key');
        
        // If overtime_multiplier doesn't exist, provide a default in the UI
        if (!$settings->has('overtime_multiplier')) {
            $settings['overtime_multiplier'] = (object) ['key' => 'overtime_multiplier', 'value' => '1.30'];
        }

        if (!$settings->has('payment_modes')) {
            $settings['payment_modes'] = (object) ['key' => 'payment_modes', 'value' => json_encode(['Cash', 'GCash', 'Bank Transfer'])];
        }

        return Inertia::render('Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'overtime_multiplier' => 'required|numeric|min:1',
            'logo' => 'nullable|image|max:2048',
            'payment_modes' => 'required|array|min:1',
            'payment_modes.*' => 'required|string|max:255',
        ]);

        Setting::updateOrCreate(
            ['key' => 'overtime_multiplier'],
            ['value' => $validated['overtime_multiplier'], 'type' => 'numeric', 'group' => 'general']
        );

        Setting::updateOrCreate(
            ['key' => 'payment_modes'],
            ['value' => json_encode($validated['payment_modes']), 'type' => 'json', 'group' => 'general']
        );

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'uploads');
            Setting::updateOrCreate(
                ['key' => 'logo_path'],
                ['value' => $path, 'type' => 'string', 'group' => 'general']
            );
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
