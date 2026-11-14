<?php

use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;

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

    // User opens order and clicks Save
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
