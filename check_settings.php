<?php

use App\Models\Setting;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$settings = Setting::where('group', 'quotation')->get()->pluck('value', 'key');

echo "Quotation Settings in DB:\n";
foreach ($settings as $key => $value) {
    echo "- $key: " . substr($value, 0, 100) . (strlen($value) > 100 ? '...' : '') . "\n";
}

if ($settings->isEmpty()) {
    echo "No quotation settings found in DB.\n";
}
