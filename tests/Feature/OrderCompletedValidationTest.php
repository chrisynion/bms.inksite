<?php

use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use App\Models\Invoice;
use App\Models\Payment;

test('order status cannot be completed if payment status is unpaid or partial', function () {
    $user = User::factory()->create();
    $customer = Customer::create([
        'name' => 'Test Customer',
        'phone' => '09123456789',
    ]);
    $service = Service::create([
        'name' => 'Tarpaulin Printing',
        'price' => 15.00,
    ]);

    // Attempt to create order with status=completed and payment_status=unpaid
    $response = $this->actingAs($user)->post(route('orders.store'), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'completed',
        'order_total' => 100,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'service_id' => $service->id,
                'description' => 'Test Item',
                'quantity' => 1,
                'unit_price' => 100,
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['status']);

    // Attempt to create order with status=completed and payment_status=partial
    $responsePartial = $this->actingAs($user)->post(route('orders.store'), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'completed',
        'order_total' => 100,
        'payment_status' => 'partial',
        'payments' => [
            [
                'payment_mode' => 'Cash',
                'amount' => 50,
                'payment_date' => now()->toDateString(),
            ],
        ],
        'items' => [
            [
                'service_id' => $service->id,
                'description' => 'Test Item',
                'quantity' => 1,
                'unit_price' => 100,
            ],
        ],
    ]);

    $responsePartial->assertSessionHasErrors(['status']);

    // Attempt with status=completed and payment_status=paid
    $responsePaid = $this->actingAs($user)->post(route('orders.store'), [
        'customer_id' => $customer->id,
        'order_date' => now()->toDateString(),
        'status' => 'completed',
        'order_total' => 100,
        'payment_status' => 'paid',
        'payments' => [
            [
                'payment_mode' => 'Cash',
                'amount' => 100,
                'payment_date' => now()->toDateString(),
            ],
        ],
        'items' => [
            [
                'service_id' => $service->id,
                'description' => 'Test Item',
                'quantity' => 1,
                'unit_price' => 100,
            ],
        ],
    ]);

    $responsePaid->assertSessionHasNoErrors();
    $this->assertDatabaseHas('orders', [
        'customer_id' => $customer->id,
        'status' => 'completed',
        'payment_status' => 'paid',
    ]);
});

test('existing order cannot be updated to completed if payment status is not paid', function () {
    $user = User::factory()->create();
    $customer = Customer::create([
        'name' => 'Update Customer',
        'phone' => '09123456788',
    ]);
    $service = Service::create([
        'name' => 'Sticker',
        'price' => 50.00,
    ]);

    $order = Order::create([
        'order_number' => 'ORD-TEST123',
        'customer_id' => $customer->id,
        'status' => 'in_progress',
        'order_total' => 50,
        'payment_status' => 'unpaid',
    ]);

    $item = $order->items()->create([
        'service_id' => $service->id,
        'description' => 'Stickers',
        'quantity' => 1,
        'unit_price' => 50,
        'total_price' => 50,
    ]);

    // Updating to completed while unpaid fails
    $response = $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'status' => 'completed',
        'order_total' => 50,
        'payment_status' => 'unpaid',
        'items' => [
            [
                'id' => $item->id,
                'service_id' => $service->id,
                'description' => 'Stickers',
                'quantity' => 1,
                'unit_price' => 50,
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['status']);

    // Updating to completed while paid succeeds
    $responseSuccess = $this->actingAs($user)->put(route('orders.update', $order->id), [
        'customer_id' => $customer->id,
        'status' => 'completed',
        'order_total' => 50,
        'payment_status' => 'paid',
        'payments' => [
            [
                'payment_mode' => 'Cash',
                'amount' => 50,
                'payment_date' => now()->toDateString(),
            ],
        ],
        'items' => [
            [
                'id' => $item->id,
                'service_id' => $service->id,
                'description' => 'Stickers',
                'quantity' => 1,
                'unit_price' => 50,
            ],
        ],
    ]);

    $responseSuccess->assertSessionHasNoErrors();
    $this->assertEquals('completed', $order->fresh()->status);
    $this->assertEquals('paid', $order->fresh()->payment_status);
});

test('completed order reverts to ready when invoice is demoted from paid or payment is deleted', function () {
    $user = User::factory()->create();
    $customer = Customer::create([
        'name' => 'Invoice Customer',
        'phone' => '09123456781',
    ]);

    $order = Order::create([
        'order_number' => 'ORD-INV123',
        'customer_id' => $customer->id,
        'status' => 'completed',
        'order_total' => 100,
        'payment_status' => 'paid',
        'fully_paid_at' => now(),
    ]);

    $invoice = Invoice::create([
        'invoice_number' => 'INV-0001',
        'order_id' => $order->id,
        'issue_date' => now()->toDateString(),
        'due_date' => now()->addDays(7)->toDateString(),
        'subtotal' => 100,
        'discount_amount' => 0,
        'total_amount' => 100,
        'status' => 'paid',
    ]);

    // Updating invoice to draft/unpaid should revert completed order to ready
    $this->actingAs($user)->put(route('invoices.update', $invoice->id), [
        'status' => 'unpaid',
        'due_date' => now()->addDays(7)->toDateString(),
    ]);

    $order->refresh();
    $this->assertEquals('unpaid', $order->payment_status);
    $this->assertEquals('ready', $order->status);

    // Now test payment deletion demotion
    $order->update([
        'status' => 'completed',
        'payment_status' => 'paid',
        'fully_paid_at' => now(),
    ]);
    $invoice->update(['status' => 'paid']);

    $payment = Payment::create([
        'invoice_id' => $invoice->id,
        'amount' => 100,
        'payment_method' => 'Cash',
        'payment_date' => now()->toDateString(),
    ]);

    $this->actingAs($user)->delete(route('payments.destroy', $payment->id));

    $order->refresh();
    $this->assertEquals('unpaid', $order->payment_status);
    $this->assertEquals('ready', $order->status);
});
