<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UtilityController extends Controller
{
    /**
     * Obsolete: Saved rolls feature removed. 
     * Now using manual calculations in RollCalculatorModal.
     */
    public static function getRolls()
    {
        return [];
    }
}
