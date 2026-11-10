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
            $settings['payment_modes'] = (object) ['key' => 'payment_modes', 'value' => json_encode([
                ['name' => 'Cash', 'initial_amount' => 0],
                ['name' => 'GCash', 'initial_amount' => 0],
                ['name' => 'Bank Transfer', 'initial_amount' => 0]
            ])];
        }

        if (!$settings->has('ai_provider')) {
            $settings['ai_provider'] = (object) ['key' => 'ai_provider', 'value' => env('AI_PROVIDER', 'gemini')];
        }
        if (!$settings->has('gemini_model')) {
            $settings['gemini_model'] = (object) ['key' => 'gemini_model', 'value' => env('GEMINI_MODEL', 'gemini-2.5-flash')];
        }
        if (!$settings->has('anthropic_model')) {
            $settings['anthropic_model'] = (object) ['key' => 'anthropic_model', 'value' => env('ANTHROPIC_MODEL', 'claude-sonnet-4-5')];
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
            'payment_modes.*.name' => 'required|string|max:255',
            'payment_modes.*.initial_amount' => 'required|numeric|min:0',
            'ai_provider' => 'nullable|in:gemini,claude',
            'gemini_api_key' => 'nullable|string|max:500',
            'gemini_model' => 'nullable|string|max:100',
            'anthropic_api_key' => 'nullable|string|max:500',
            'anthropic_model' => 'nullable|string|max:100',
        ]);

        Setting::updateOrCreate(
            ['key' => 'overtime_multiplier'],
            ['value' => $validated['overtime_multiplier'], 'type' => 'numeric', 'group' => 'general']
        );

        Setting::updateOrCreate(
            ['key' => 'payment_modes'],
            ['value' => json_encode($validated['payment_modes']), 'type' => 'json', 'group' => 'general']
        );

        if (!empty($validated['ai_provider'])) {
            Setting::updateOrCreate(
                ['key' => 'ai_provider'],
                ['value' => $validated['ai_provider'], 'type' => 'string', 'group' => 'ai']
            );
        }

        if ($request->exists('gemini_api_key') && $validated['gemini_api_key'] !== null) {
            Setting::updateOrCreate(
                ['key' => 'gemini_api_key'],
                ['value' => $validated['gemini_api_key'], 'type' => 'string', 'group' => 'ai']
            );
        }

        if (!empty($validated['gemini_model'])) {
            Setting::updateOrCreate(
                ['key' => 'gemini_model'],
                ['value' => $validated['gemini_model'], 'type' => 'string', 'group' => 'ai']
            );
        }

        if ($request->exists('anthropic_api_key') && $validated['anthropic_api_key'] !== null) {
            Setting::updateOrCreate(
                ['key' => 'anthropic_api_key'],
                ['value' => $validated['anthropic_api_key'], 'type' => 'string', 'group' => 'ai']
            );
        }

        if (!empty($validated['anthropic_model'])) {
            Setting::updateOrCreate(
                ['key' => 'anthropic_model'],
                ['value' => $validated['anthropic_model'], 'type' => 'string', 'group' => 'ai']
            );
        }

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
