<?php

namespace App\Http\Controllers;

use App\Console\Commands\McpServeCommand;
use App\Services\AiReportingService;
use App\Services\ReportingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

class ReportController extends Controller
{
    public function __construct(
        protected ReportingService $reporting,
        protected AiReportingService $aiReporting
    ) {
    }

    public function index(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $snapshot = $this->reporting->getFullBusinessSnapshot($startDate, $endDate);
        $aiConfig = $this->aiReporting->getConfig();

        $artisanPath = base_path('artisan');
        $phpBinary = defined('PHP_BINARY') && PHP_BINARY ? PHP_BINARY : 'php';

        return Inertia::render('Reports/Index', [
            'snapshot' => $snapshot,
            'filters' => [
                'start_date' => $snapshot['financial_summary']['period']['start_date'],
                'end_date' => $snapshot['financial_summary']['period']['end_date'],
            ],
            'ai_config' => [
                'provider' => $aiConfig['provider'],
                'gemini_model' => $aiConfig['gemini_model'],
                'anthropic_model' => $aiConfig['anthropic_model'],
                'has_gemini_key' => $aiConfig['has_gemini_key'],
                'has_anthropic_key' => $aiConfig['has_anthropic_key'],
            ],
            'mcp_info' => [
                'artisan_path' => $artisanPath,
                'tools' => McpServeCommand::getToolDefinitions(),
                'config_json' => json_encode([
                    'mcpServers' => [
                        'bms-inksite' => [
                            'command' => $phpBinary,
                            'args' => [$artisanPath, 'mcp:serve'],
                        ],
                    ],
                ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            ],
        ]);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'nullable|string|max:4000',
            'messages' => 'nullable|array|min:1|max:50',
            'messages.*.role' => 'required_with:messages|string|in:user,assistant,model',
            'messages.*.content' => 'required_with:messages|string|max:12000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'provider' => 'nullable|in:gemini,claude,anthropic',
        ]);

        try {
            $messages = $validated['messages'] ?? null;
            if (empty($messages) && !empty($validated['prompt'])) {
                $messages = [['role' => 'user', 'content' => $validated['prompt']]];
            }

            if (empty($messages)) {
                return response()->json(['message' => 'Please enter a message or question.'], 422);
            }

            $result = $this->aiReporting->chat(
                $messages,
                $validated['start_date'] ?? null,
                $validated['end_date'] ?? null,
                $validated['provider'] ?? null
            );

            return response()->json($result);
        } catch (Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
