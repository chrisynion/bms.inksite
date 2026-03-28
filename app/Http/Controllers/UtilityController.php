<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UtilityController extends Controller
{
    /**
     * Get the rolls from the external JSON file.
     */
    public static function getRolls()
    {
        $path = public_path('roll/saved_rolls.json');
        
        if (!file_exists($path)) {
            return [];
        }

        $json = file_get_contents($path);
        $rolls = json_decode($json, true);

        if (!is_array($rolls)) {
            return [];
        }

        // Add calculated prices to each roll for easy consumption
        foreach ($rolls as &$roll) {
            $wM = $roll['width'] * self::getMeterRate($roll['widthUnit']);
            $hM = $roll['height'] * self::getMeterRate($roll['heightUnit']);
            $areaSqM = $wM * $hM;
            
            if ($areaSqM > 0) {
                $pSqm = $roll['price'] / $areaSqM;
                $roll['price_per_sqft'] = round($pSqm / 10.7639104, 4);
                $roll['price_per_sqin'] = round($pSqm / 1550.0031, 4);
                $roll['price_per_sqcm'] = round($pSqm / 10000, 4);
                $roll['price_per_sqm'] = round($pSqm, 4);
            }
        }

        return $rolls;
    }

    private static function getMeterRate($unit)
    {
        $rates = [
            'in' => 0.0254,
            'ft' => 0.3048,
            'cm' => 0.01,
            'm' => 1
        ];
        return isset($rates[$unit]) ? $rates[$unit] : 1;
    }
}
