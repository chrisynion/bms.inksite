<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $setting = DB::table('settings')->where('key', 'payment_modes')->first();
        if ($setting) {
            $modes = json_decode($setting->value, true);
            if (is_array($modes)) {
                $newModes = [];
                foreach ($modes as $mode) {
                    if (is_string($mode)) {
                        $newModes[] = ['name' => $mode, 'initial_amount' => 0];
                    } else {
                        $newModes[] = $mode;
                    }
                }
                DB::table('settings')->where('key', 'payment_modes')->update([
                    'value' => json_encode($newModes)
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $setting = DB::table('settings')->where('key', 'payment_modes')->first();
        if ($setting) {
            $modes = json_decode($setting->value, true);
            if (is_array($modes)) {
                $newModes = [];
                foreach ($modes as $mode) {
                    if (is_array($mode) && isset($mode['name'])) {
                        $newModes[] = $mode['name'];
                    } else {
                        $newModes[] = is_string($mode) ? $mode : 'Unknown';
                    }
                }
                DB::table('settings')->where('key', 'payment_modes')->update([
                    'value' => json_encode($newModes)
                ]);
            }
        }
    }
};
