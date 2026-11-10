<?php

use App\Http\Controllers\SystemInstallController;
use App\Http\Controllers\DashboardController;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\EmployeeOvertimeController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ContractorController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/system/install', [SystemInstallController::class, 'install'])->name('system.install');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/portfolio', function () {
    return Inertia::render('Portfolio');
})->name('portfolio');

Route::get('/resume', function () {
    return Inertia::render('Resume');
})->name('resume');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('inventory', InventoryController::class);
    Route::resource('services', ServiceController::class);
    Route::resource('orders', OrderController::class);
    Route::resource('invoices', InvoiceController::class);
    Route::resource('payments', PaymentController::class);
    Route::resource('customers', CustomerController::class);
    Route::get('quotation', [\App\Http\Controllers\QuotationController::class, 'index'])->name('quotation.index');
    Route::post('quotation/settings', [\App\Http\Controllers\QuotationController::class, 'updateSettings'])->name('quotation.settings.update');
    
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingController::class, 'update'])->name('settings.update');
    
    Route::post('employees/{employee}/overtimes', [EmployeeOvertimeController::class, 'store'])->name('employee-overtimes.store');
    Route::delete('employee-overtimes/{overtime}', [EmployeeOvertimeController::class, 'destroy'])->name('employee-overtimes.destroy');
    
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::post('reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
        Route::post('reports/sync-paid-orders', [ReportController::class, 'syncPaidOrders'])->name('reports.sync-paid-orders');
        Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'destroy']);
        Route::resource('employees', EmployeeController::class);
        Route::resource('equipment', EquipmentController::class);
        Route::resource('suppliers', SupplierController::class);
        Route::resource('contractors', ContractorController::class);
        Route::resource('users', UserController::class);
    });
});


require __DIR__.'/auth.php';
