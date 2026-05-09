<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class QuotationController extends Controller
{
    public function index()
    {
        $settings = Setting::where('group', 'quotation')->get()->keyBy('key');
        
        return Inertia::render('Quotation/Index', [
            'dbSettings' => [
                'logo' => $settings->has('quotation_logo') ? \Storage::disk('uploads')->url('quotation/' . $settings['quotation_logo']->value) : null,
                'bgImage' => $settings->has('quotation_bg') ? \Storage::disk('uploads')->url('quotation/' . $settings['quotation_bg']->value) : null,
                'companyDetails' => $settings['quotation_company_details']->value ?? null,
                'clientDetails' => $settings['quotation_client_details']->value ?? null,
                'thankYouTitle' => $settings['quotation_thank_you_title']->value ?? null,
                'thankYouMessage' => $settings['quotation_thank_you_message']->value ?? null,
                'inclusionsTitle' => $settings['quotation_inclusions_title']->value ?? null,
                'inclusions' => $settings->has('quotation_inclusions') ? json_decode($settings['quotation_inclusions']->value, true) : null,
                'termsTitle' => $settings['quotation_terms_title']->value ?? null,
                'terms' => $settings->has('quotation_terms') ? json_decode($settings['quotation_terms']->value, true) : null,
                'tableTitle' => $settings['quotation_table_title']->value ?? null,
                'tableFooterNote' => $settings['quotation_table_footer']->value ?? null,
                'tableOptions' => $settings->has('quotation_table_options') ? json_decode($settings['quotation_table_options']->value, true) : null,
            ]
        ]);
    }

    private function sanitizeHtml($value)
    {
        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $value[$k] = $this->sanitizeHtml($v);
            }
            return $value;
        }

        if (!is_string($value)) return $value;

        // Strip tags but allow safe formatting ones
        $allowed = '<b><i><u><br><strong><em><span><p><div><ul><li><ol><h1><h2><h3>';
        $sanitized = strip_tags($value, $allowed);

        // Remove dangerous attributes like onclick, style (to prevent CSS injection), etc.
        $sanitized = preg_replace('/on\w+="[^"]*"/i', '', $sanitized);
        $sanitized = preg_replace('/on\w+=\'[^\']*\'/i', '', $sanitized);
        $sanitized = preg_replace('/style="[^"]*"/i', '', $sanitized);
        $sanitized = preg_replace('/href="javascript:[^"]*"/i', '', $sanitized);
        
        return $sanitized;
    }

    public function updateSettings(Request $request)
    {
        $data = $request->all();

        $fields = [
            'companyDetails' => 'quotation_company_details',
            'clientDetails' => 'quotation_client_details',
            'thankYouTitle' => 'quotation_thank_you_title',
            'thankYouMessage' => 'quotation_thank_you_message',
            'inclusionsTitle' => 'quotation_inclusions_title',
            'termsTitle' => 'quotation_terms_title',
            'tableTitle' => 'quotation_table_title',
            'tableFooterNote' => 'quotation_table_footer',
        ];

        foreach ($fields as $key => $dbKey) {
            if (isset($data[$key])) {
                Setting::updateOrCreate(
                    ['key' => $dbKey],
                    ['value' => $this->sanitizeHtml($data[$key]), 'group' => 'quotation', 'type' => 'string']
                );
            }
        }

        $jsonFields = [
            'inclusions' => 'quotation_inclusions',
            'terms' => 'quotation_terms',
            'tableOptions' => 'quotation_table_options',
        ];

        foreach ($jsonFields as $key => $dbKey) {
            if (isset($data[$key])) {
                $sanitized = $this->sanitizeHtml($data[$key]);
                Setting::updateOrCreate(
                    ['key' => $dbKey],
                    ['value' => json_encode($sanitized), 'group' => 'quotation', 'type' => 'json']
                );
            }
        }

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $fileName = time() . '_logo.' . $file->getClientOriginalExtension();
            $file->storeAs('quotation', $fileName, 'uploads');
            
            Setting::updateOrCreate(
                ['key' => 'quotation_logo'],
                ['value' => $fileName, 'group' => 'quotation', 'type' => 'string']
            );
        }

        if ($request->hasFile('bgImage')) {
            $file = $request->file('bgImage');
            $fileName = time() . '_bg.' . $file->getClientOriginalExtension();
            $file->storeAs('quotation', $fileName, 'uploads');
            
            Setting::updateOrCreate(
                ['key' => 'quotation_bg'],
                ['value' => $fileName, 'group' => 'quotation', 'type' => 'string']
            );
        }

        return back()->with('success', 'Quotation settings saved to database.');
    }



}
