<?php

use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;

test('updating a legacy deducted order only syncs the selected service items', function () {
    $user = User::factory()->create();
    $customer = Customer::create(['name' => 'Test Customer', 'phone' => '09123456789']);

    $itemA = InventoryItem::create(['name' => 'New Paper A', 'price' => 10, 'stock' => 100, 'form' => 'sheet']);
    $itemB = InventoryItem::create(['name' => 'Existing Ink B', 'price' => 20, 'stock' => 50, 'form' => 'sheet']);

    $serviceA = Service::create(['name' => 'Service A', 'price' => 50]);
    $serviceA->inventoryItems()->attach($itemA->id, ['quantity' => 2]);

    $serviceB = Service::create(['name' => 'Service B', 'price' => 80]);
    $serviceB->inventoryItems()->attach($itemB->id, ['quantity' => 5]);

    // Simulate a legacy order that already had inventory_deducted = true before per-item tracking existed
    $order = Order::create([
        'order_number' => 'ORD-LEGACY01',
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 230,
        'payment_status' => 'unpaid',
        'inventory_deducted' => true,
    ]);
    $orderItemA = $order->items()->create([
        'service_id' => $serviceA->id,
        'description' => 'Item A',
        'quantity' => 3,
        'unit_price' => 50,
        'total_price' => 150,
    ]);
    $orderItemB = $order->items()->create([
        'service_id' => $serviceB->id,
        'description' => 'Item B',
        'quantity' => 1,
        'unit_price' => 80,
        'total_price' => 80,
    ]);

    // Saving without selecting any item should NOT touch either inventory item
    $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 230,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'id' => $orderItemA->id,
                'service_id' => $serviceA->id,
                'description' => 'Item A',
                'quantity' => 3,
                'unit_price' => 50,
                'sync_inventory' => false,
            ],
            [
                'id' => $orderItemB->id,
                'service_id' => $serviceB->id,
                'description' => 'Item B',
                'quantity' => 1,
                'unit_price' => 80,
                'sync_inventory' => false,
            ],
        ],
    ])->assertRedirect(route('orders.edit', $order->id));

    expect($itemA->fresh()->stock)->toBe(100);
    expect($itemB->fresh()->stock)->toBe(50);

    // Selecting ONLY Service A (sync_inventory = true) should deduct only Item A (2 * 3 = 6) and leave Item B untouched
    $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 230,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'id' => $orderItemA->id,
                'service_id' => $serviceA->id,
                'description' => 'Item A',
                'quantity' => 3,
                'unit_price' => 50,
                'sync_inventory' => true,
            ],
            [
                'id' => $orderItemB->id,
                'service_id' => $serviceB->id,
                'description' => 'Item B',
                'quantity' => 1,
                'unit_price' => 80,
                'sync_inventory' => false,
            ],
        ],
    ])->assertRedirect(route('orders.edit', $order->id));

    expect($itemA->fresh()->stock)->toBe(94);
    expect($itemB->fresh()->stock)->toBe(50);
});

test('updating an already deducted order after replacing service inventory items deducts the new items', function () {
    $user = User::factory()->create();
    $customer = Customer::create(['name' => 'Test Customer', 'phone' => '09123456789']);

    $oldItem = InventoryItem::create([
        'name' => 'Old Paper',
        'price' => 10,
        'stock' => 100,
        'form' => 'sheet',
    ]);

    $service = Service::create(['name' => 'Flyer Printing', 'price' => 50]);
    $service->inventoryItems()->attach($oldItem->id, ['quantity' => 2]);

    // Create order in_progress (deducts 2 * 3 = 6 from oldItem)
    $this->actingAs($user)->post(route('orders.store'), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 150,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'service_id' => $service->id,
                'description' => 'Flyers',
                'quantity' => 3,
                'unit_price' => 50,
            ],
        ],
    ])->assertRedirect(route('orders.index'));

    $order = Order::firstOrFail();
    $orderItem = $order->items()->firstOrFail();
    expect($oldItem->fresh()->stock)->toBe(94);

    // User deletes old inventory item and adds a new one to the service
    $oldItem->delete();
    $newItem = InventoryItem::create([
        'name' => 'New Paper',
        'price' => 12,
        'stock' => 100,
        'form' => 'sheet',
    ]);
    $service->inventoryItems()->attach($newItem->id, ['quantity' => 2]);

    // User opens order, checks Sync Inventory on the item, and clicks Save
    $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 150,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'id' => $orderItem->id,
                'service_id' => $service->id,
                'description' => 'Flyers',
                'quantity' => 3,
                'unit_price' => 50,
                'sync_inventory' => true,
            ],
        ],
    ])->assertRedirect(route('orders.edit', $order->id));

    expect($newItem->fresh()->stock)->toBe(94);

    // Saving again without changes should NOT double-deduct
    $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 150,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'id' => $orderItem->id,
                'service_id' => $service->id,
                'description' => 'Flyers',
                'quantity' => 3,
                'unit_price' => 50,
            ],
        ],
    ])->assertRedirect(route('orders.edit', $order->id));

    expect($newItem->fresh()->stock)->toBe(94);
});

test('updating order quantity adjusts inventory by delta and reverting status restores stock', function () {
    $user = User::factory()->create();
    $customer = Customer::create(['name' => 'Test Customer', 'phone' => '09123456789']);

    $item = InventoryItem::create([
        'name' => 'Tarpaulin Roll',
        'price' => 20,
        'stock' => 100,
        'form' => 'roll',
    ]);

    $service = Service::create(['name' => 'Tarp Print', 'price' => 30]);
    $service->inventoryItems()->attach($item->id, ['quantity' => 1]);

    $this->actingAs($user)->post(route('orders.store'), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 120,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'service_id' => $service->id,
                'description' => 'Tarp',
                'quantity' => 1,
                'width' => 2,
                'height' => 2,
                'unit_price' => 30,
            ],
        ],
    ]);

    $order = Order::firstOrFail();
    $orderItem = $order->items()->firstOrFail();
    // 1 * 2 * 2 * 1 = 4 deducted -> 96
    expect($item->fresh()->stock)->toBe(96);

    // Update quantity from 1 to 3 (total deduction 12 -> stock 88)
    $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'in_progress',
        'order_total' => 360,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'id' => $orderItem->id,
                'service_id' => $service->id,
                'description' => 'Tarp',
                'quantity' => 3,
                'width' => 2,
                'height' => 2,
                'unit_price' => 30,
            ],
        ],
    ]);

    expect($item->fresh()->stock)->toBe(88);

    // Revert status to pending -> restores all 12 -> stock 100
    $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'pending',
        'order_total' => 360,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'id' => $orderItem->id,
                'service_id' => $service->id,
                'description' => 'Tarp',
                'quantity' => 3,
                'width' => 2,
                'height' => 2,
                'unit_price' => 30,
            ],
        ],
    ]);

    expect($item->fresh()->stock)->toBe(100);
    expect($order->fresh()->inventory_deducted)->toBeFalse();
});

test('deleting an order restores its deducted inventory', function () {
    $user = User::factory()->create();
    $customer = Customer::create(['name' => 'Test Customer', 'phone' => '09123456789']);

    $item = InventoryItem::create([
        'name' => 'Sticker Sheet',
        'price' => 15,
        'stock' => 50,
        'form' => 'sheet',
    ]);

    $service = Service::create(['name' => 'Sticker Cut', 'price' => 40]);
    $service->inventoryItems()->attach($item->id, ['quantity' => 5]);

    $this->actingAs($user)->post(route('orders.store'), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'ready',
        'order_total' => 80,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'service_id' => $service->id,
                'description' => 'Stickers',
                'quantity' => 2,
                'unit_price' => 40,
            ],
        ],
    ]);

    $order = Order::firstOrFail();
    expect($item->fresh()->stock)->toBe(40);

    $this->actingAs($user)->delete(route('orders.destroy', $order->id));

    expect($item->fresh()->stock)->toBe(50);
});
