<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemInstallController extends Controller
{
    /**
     * Run the system installation process via the web.
     * This runs migrations, seeders, and fixes the storage link.
     */
    public function install(Request $request)
    {
        // For security, you could check for a specific token or secret in the URL
        // Example: if ($request->token !== config('app.install_secret')) return abort(403);

        try {
            // 1. Run Migrations
            Artisan::call('migrate', ['--force' => true]);
            $migrationOutput = Artisan::output();

            // 2. Run Seeders (Including Dummy Data)
            Artisan::call('db:seed', ['--force' => true]);
            $seedingOutput = Artisan::output();

            // 3. Fix Storage Link (Optional, wrapped in try-catch for restricted hosts)
            $linkOutput = 'Skipped or failed';
            try {
                Artisan::call('storage:link');
                $linkOutput = Artisan::output();
            } catch (\Exception $e) {
                $linkOutput = 'Symlinks disabled on this host: ' . $e->getMessage();
            }

            // 4. Optimize
            Artisan::call('optimize:clear');

            return response()->json([
                'status' => 'success',
                'message' => 'System successfully installed/updated.',
                'details' => [
                    'migration' => $migrationOutput,
                    'seeding' => $seedingOutput,
                    'storage_link' => $linkOutput,
                ],
                'default_credentials' => [
                    'admin_email' => 'admin@inksite.test',
                    'staff_email' => 'test@example.com',
                    'password' => 'password'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Installation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Installation failed. Check your database connection and logs.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
