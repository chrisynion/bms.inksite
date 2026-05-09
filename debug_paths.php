<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

echo "Public Path: " . public_path() . "\n";
echo "Asset URL: " . asset('uploads/quotation/test.png') . "\n";
echo "Storage Path: " . storage_path() . "\n";
