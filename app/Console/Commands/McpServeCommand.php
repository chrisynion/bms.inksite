<?php

namespace App\Console\Commands;

use App\Services\ReportingService;
use Illuminate\Console\Command;
use Throwable;

class McpServeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mcp:serve';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start the BMS Model Context Protocol (MCP) server over stdio for Claude Desktop, Antigravity, or Gemini CLI';

    public function __construct(protected ReportingService $reporting)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        // Ensure nothing pollutes STDOUT except valid JSON-RPC lines
        ini_set('display_errors', '0');

        $stdin = fopen('php://stdin', 'r');
        if (!$stdin) {
            fwrite(STDERR, "Failed to open STDIN for MCP server.\n");
            return self::FAILURE;
        }

        while (!feof($stdin)) {
            $line = fgets($stdin);
            if ($line === false) {
                break;
            }

            $line = trim($line);
            if ($line === '') {
                continue;
            }

            $request = json_decode($line, true);
            if (!is_array($request)) {
                $this->sendError(null, -32700, 'Parse error');
                continue;
            }

            $this->processMessage($request);
        }

        fclose($stdin);
        return self::SUCCESS;
    }

    protected function processMessage(array $request): void
    {
        $method = $request['method'] ?? null;
        $id = $request['id'] ?? null;
        $params = $request['params'] ?? [];

        // Notifications do not have an ID and do not expect a response
        if ($id === null && str_starts_with((string) $method, 'notifications/')) {
            return;
        }

        try {
            switch ($method) {
                case 'initialize':
                    $clientProtocol = $params['protocolVersion'] ?? '2024-11-05';
                    $this->sendResult($id, [
                        'protocolVersion' => $clientProtocol,
                        'capabilities' => [
                            'tools' => (object) ['listChanged' => false],
                            'resources' => (object) ['subscribe' => false, 'listChanged' => false],
                        ],
                        'serverInfo' => [
                            'name' => 'bms-inksite-reporting-mcp',
                            'version' => '1.0.0',
                        ],
                    ]);
                    break;

                case 'ping':
                    $this->sendResult($id, (object) []);
                    break;

                case 'tools/list':
                    $this->sendResult($id, [
                        'tools' => $this->getToolDefinitions(),
                    ]);
                    break;

                case 'tools/call':
                    $toolName = $params['name'] ?? '';
                    $args = $params['arguments'] ?? [];
                    $data = $this->executeTool($toolName, is_array($args) ? $args : []);
                    $this->sendResult($id, [
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                            ],
                        ],
                        'isError' => false,
                    ]);
                    break;

                case 'resources/list':
                    $this->sendResult($id, [
                        'resources' => [
                            [
                                'uri' => 'bms://reports/current-month-snapshot',
                                'name' => 'Current Month Full Business Snapshot',
                                'description' => 'Complete financial, order, service, inventory, customer, and employee snapshot for the current month.',
                                'mimeType' => 'application/json',
                            ],
                        ],
                    ]);
                    break;

                case 'resources/read':
                    $uri = $params['uri'] ?? '';
                    if ($uri === 'bms://reports/current-month-snapshot') {
                        $snapshot = $this->reporting->getFullBusinessSnapshot();
                        $this->sendResult($id, [
                            'contents' => [
                                [
                                    'uri' => $uri,
                                    'mimeType' => 'application/json',
                                    'text' => json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                                ],
                            ],
                        ]);
                    } else {
                        $this->sendError($id, -32602, "Unknown resource URI: {$uri}");
                    }
                    break;

                default:
                    if ($id !== null) {
                        $this->sendError($id, -32601, "Method not found: {$method}");
                    }
                    break;
            }
        } catch (Throwable $e) {
            fwrite(STDERR, "MCP Error: {$e->getMessage()}\n");
            if ($id !== null) {
                $this->sendResult($id, [
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'Error executing tool: ' . $e->getMessage(),
                        ],
                    ],
                    'isError' => true,
                ]);
            }
        }
    }

    public static function getToolDefinitions(): array
    {
        return [
            [
                'name' => 'get_financial_summary',
                'description' => 'Get revenue from order payments, cashbook/ledger income and expenses by category, net cashflow, outstanding receivables, and current account balances across payment modes (Cash, GCash, Bank Transfer, etc.). Defaults to current month if dates are omitted.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => [
                            'type' => 'string',
                            'description' => 'Start date in YYYY-MM-DD format (optional, defaults to start of current month).',
                        ],
                        'end_date' => [
                            'type' => 'string',
                            'description' => 'End date in YYYY-MM-DD format (optional, defaults to today).',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'analyze_orders_and_services',
                'description' => 'Analyze order volume and value by status (quote, pending, in_progress, ready, completed, cancelled), top-performing services by revenue/quantity, and list unpaid/partially paid orders with balances due.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => [
                            'type' => 'string',
                            'description' => 'Start date in YYYY-MM-DD format (optional).',
                        ],
                        'end_date' => [
                            'type' => 'string',
                            'description' => 'End date in YYYY-MM-DD format (optional).',
                        ],
                        'status' => [
                            'type' => 'string',
                            'description' => 'Optional status filter: quote, pending, in_progress, ready, completed, or cancelled.',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'get_inventory_report',
                'description' => 'Get inventory stock levels, low-stock alerts, out-of-stock count, and estimated inventory value.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'low_stock_threshold' => [
                            'type' => 'integer',
                            'description' => 'Stock threshold for low-stock alerts (default: 10).',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'get_customer_insights',
                'description' => 'Get top customers ranked by revenue paid and customers with the highest unpaid balances.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'limit' => [
                            'type' => 'integer',
                            'description' => 'Maximum number of customers to return per list (default: 10).',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'get_employee_workload',
                'description' => 'Get employee assigned orders count, completed orders, currently active workload, and logged overtime hours/pay for a date range.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => [
                            'type' => 'string',
                            'description' => 'Start date in YYYY-MM-DD format (optional).',
                        ],
                        'end_date' => [
                            'type' => 'string',
                            'description' => 'End date in YYYY-MM-DD format (optional).',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'get_full_business_snapshot',
                'description' => 'Get a complete business snapshot combining financials, orders & services, inventory alerts, customer insights, and employee workload for a given date range.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'start_date' => [
                            'type' => 'string',
                            'description' => 'Start date in YYYY-MM-DD format (optional).',
                        ],
                        'end_date' => [
                            'type' => 'string',
                            'description' => 'End date in YYYY-MM-DD format (optional).',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'sync_paid_orders',
                'description' => 'Synchronize and restore missing payment records for all orders marked as "paid" where payment_amount was recorded as 0 or less than order_total.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => (object) [],
                ],
            ],
        ];
    }

    protected function executeTool(string $name, array $args): array
    {
        return match ($name) {
            'get_financial_summary' => $this->reporting->getFinancialSummary(
                $args['start_date'] ?? null,
                $args['end_date'] ?? null
            ),
            'analyze_orders_and_services' => $this->reporting->analyzeOrdersAndServices(
                $args['start_date'] ?? null,
                $args['end_date'] ?? null,
                $args['status'] ?? null
            ),
            'get_inventory_report' => $this->reporting->getInventoryReport(
                isset($args['low_stock_threshold']) ? (int) $args['low_stock_threshold'] : 10
            ),
            'get_customer_insights' => $this->reporting->getCustomerInsights(
                isset($args['limit']) ? (int) $args['limit'] : 10
            ),
            'get_employee_workload' => $this->reporting->getEmployeeWorkload(
                $args['start_date'] ?? null,
                $args['end_date'] ?? null
            ),
            'get_full_business_snapshot' => $this->reporting->getFullBusinessSnapshot(
                $args['start_date'] ?? null,
                $args['end_date'] ?? null
            ),
            'sync_paid_orders' => $this->reporting->syncPaidOrders(),
            default => throw new \InvalidArgumentException("Unknown MCP tool: {$name}"),
        };
    }

    protected function sendResult(mixed $id, mixed $result): void
    {
        $payload = [
            'jsonrpc' => '2.0',
            'id' => $id,
            'result' => $result,
        ];
        fwrite(STDOUT, json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");
        fflush(STDOUT);
    }

    protected function sendError(mixed $id, int $code, string $message): void
    {
        $payload = [
            'jsonrpc' => '2.0',
            'id' => $id,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ];
        fwrite(STDOUT, json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");
        fflush(STDOUT);
    }
}
