<?php

namespace App\Http\Controllers;

use App\Models\EmployeeOvertime;
use App\Models\Employee;
use App\Models\Setting;
use Illuminate\Http\Request;

class EmployeeOvertimeController extends Controller
{
    public function store(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0.1',
            'notes' => 'nullable|string',
        ]);

        if (!$employee->hourly_rate) {
            return back()->with('error', 'Please set an hourly rate for this employee first. Go to Edit Employee.');
        }

        $multiplierSetting = Setting::where('key', 'overtime_multiplier')->first();
        $multiplier = $multiplierSetting ? (float) $multiplierSetting->value : 1.30;

        $rateApplied = $employee->hourly_rate * $multiplier;
        $totalPay = $rateApplied * $validated['hours'];

        $employee->overtimes()->create([
            'date' => $validated['date'],
            'hours' => $validated['hours'],
            'rate_applied' => $rateApplied,
            'total_pay' => $totalPay,
            'notes' => $validated['notes'],
            'status' => 'approved',
        ]);

        return back()->with('success', 'Overtime logged successfully.');
    }

    public function destroy(EmployeeOvertime $overtime)
    {
        $overtime->delete();
        return back()->with('success', 'Overtime record deleted.');
    }
}
