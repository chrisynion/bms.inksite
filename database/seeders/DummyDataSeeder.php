<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\InventoryItem;
use App\Models\Employee;
use App\Models\Service;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin & Test Users
        User::updateOrCreate(
            ['email' => 'admin@inksite.test'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ]
        );

        // 2. Customers
        $customers = [
            ['name' => 'John Doe Graphics', 'email' => 'john@doe.com', 'phone' => '0912345671', 'address' => 'Quezon City, Manila'],
            ['name' => 'Sari-Sari Digital', 'email' => 'contact@sarisari.com', 'phone' => '0912345672', 'address' => 'Makati City'],
            ['name' => 'Blue Ocean Ad Agency', 'email' => 'social@blueocean.com', 'phone' => '0912345673', 'address' => 'Pasig City'],
            ['name' => 'Local School Dist.', 'email' => 'school@email.edu', 'phone' => '0912445674', 'address' => 'Manila North'],
            ['name' => 'Tech Hub Inc.', 'email' => 'info@techhub.ph', 'phone' => '0912345675', 'address' => 'Valenzuela'],
            ['name' => 'Maria Clary Prints', 'email' => 'maria@prints.com', 'phone' => '0912345276', 'address' => 'Taguig City'],
            ['name' => 'Vibrant Ads', 'email' => 'order@vibrant.com', 'phone' => '0912345677', 'address' => 'Caloocan'],
        ];
        foreach ($customers as $c) {
            Customer::updateOrCreate(['email' => $c['email']], $c);
        }

        // 3. Suppliers
        $suppliers = [
            ['name' => 'Direct Ink Philippines', 'email' => 'sales@directink.ph', 'phone' => '028123456', 'address' => 'Bulacan'],
            ['name' => 'Premium Media Distro', 'email' => 'lily@pmedia.com', 'phone' => '028765432', 'address' => 'Valenzuela'],
            ['name' => 'Vinyl City', 'email' => 'vinyl@city.com', 'phone' => '028345678', 'address' => 'Manila'],
        ];
        foreach ($suppliers as $s) {
            Supplier::updateOrCreate(['email' => $s['email']], $s);
        }

        // 4. Employees
        $employees = [
            ['name' => 'Rick Dalton', 'role' => 'Printer Operator', 'hourly_rate' => 120, 'email' => 'rick@inksite.test'],
            ['name' => 'Niana Guerrero', 'role' => 'Graphic Designer', 'hourly_rate' => 180, 'email' => 'niana@inksite.test'],
            ['name' => 'Ben Tulfo', 'role' => 'Production Manager', 'hourly_rate' => 250, 'email' => 'ben@inksite.test'],
        ];
        foreach ($employees as $e) {
            Employee::updateOrCreate(['name' => $e['name']], $e);
        }

        // 5. Inventory
        $inventory = [
            ['name' => 'Glossy Vinyl Roll', 'type' => 'Vinyl', 'color' => 'White', 'finish' => 'Glossy', 'price' => 450, 'stock' => 100, 'form' => 'roll', 'width' => 1.27, 'length' => 50],
            ['name' => 'Matte Sticker Paper', 'type' => 'Paper', 'color' => 'White', 'finish' => 'Matte', 'price' => 15, 'stock' => 200, 'form' => 'sheet'],
            ['name' => 'Canvas Fabric', 'type' => 'Fabric', 'color' => 'Cream', 'finish' => 'Texture', 'price' => 600, 'stock' => 20, 'form' => 'roll', 'width' => 1.5, 'length' => 30],
            ['name' => 'Cyan Ink (1L)', 'type' => 'Ink', 'color' => 'Cyan', 'price' => 2500, 'stock' => 5, 'form' => 'liquid'],
        ];
        foreach ($inventory as $i) {
            InventoryItem::updateOrCreate(['name' => $i['name']], $i);
        }

        // 6. Services
        $services = [
            ['name' => 'Outdoor Billboard Print', 'price' => 15, 'description' => 'Solvent printing (15/sqft).'],
            ['name' => 'Car Sticker Wrap', 'price' => 85, 'description' => 'Vibrant vinyl wrap (85/sqft).'],
            ['name' => 'X-Stand Banner', 'price' => 350, 'description' => 'Complete print and stand.'],
            ['name' => 'Canvas Frame Print', 'price' => 1200, 'description' => 'High-res canvas on wood frame.'],
        ];
        foreach ($services as $sv) {
            Service::updateOrCreate(['name' => $sv['name']], $sv);
        }

        // 7. Settings
        Setting::updateOrCreate(['key' => 'overtime_multiplier'], ['value' => '1.30', 'type' => 'numeric', 'group' => 'general']);
        Setting::updateOrCreate(['key' => 'system_name'], ['value' => 'Inksite BMS', 'type' => 'string', 'group' => 'general']);
    }
}
