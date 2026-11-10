<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiReportingService
{
    public function __construct(protected ReportingService $reporting)
    {
    }

    /**
     * Retrieve AI configuration from Settings or environment variables.
     */
    public function getConfig(): array
    {
        $settings = Setting::whereIn('key', [
            'ai_provider',
            'gemini_api_key',
            'gemini_model',
            'anthropic_api_key',
            'anthropic_model',
        ])->get()->keyBy('key');

        $provider = $settings->get('ai_provider')?->value ?: env('AI_PROVIDER', 'gemini');
        $geminiKey = $settings->get('gemini_api_key')?->value ?: env('GEMINI_API_KEY', '');
        $geminiModel = $settings->get('gemini_model')?->value ?: env('GEMINI_MODEL', 'gemini-2.5-flash');
        $anthropicKey = $settings->get('anthropic_api_key')?->value ?: env('ANTHROPIC_API_KEY', '');
        $anthropicModel = $settings->get('anthropic_model')?->value ?: env('ANTHROPIC_MODEL', 'claude-sonnet-4-5');

        return [
            'provider' => $provider,
            'gemini_api_key' => $geminiKey,
            'gemini_model' => $geminiModel,
            'anthropic_api_key' => $anthropicKey,
            'anthropic_model' => $anthropicModel,
            'has_gemini_key' => !empty($geminiKey),
            'has_anthropic_key' => !empty($anthropicKey),
        ];
    }

    /**
     * Generate an AI business report or multi-turn chat reply grounded on live BMS data.
     *
     * @param array<int, array{role: string, content: string}> $messages
     */
    public function chat(
        array $messages,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $overrideProvider = null
    ): array {
        $config = $this->getConfig();
        $provider = $overrideProvider ?: $config['provider'];

        $snapshot = $this->reporting->getFullBusinessSnapshot($startDate, $endDate);
        $systemInstruction = $this->buildSystemInstruction($snapshot);

        // Normalize messages to ensure alternating user/assistant roles starting with user
        $normalized = $this->normalizeMessages($messages);

        if ($provider === 'anthropic' || $provider === 'claude') {
            $apiKey = $config['anthropic_api_key'];
            if (empty($apiKey)) {
                throw new RuntimeException('Anthropic API Key is not configured. Please add it in System Settings or .env (ANTHROPIC_API_KEY).');
            }
            $text = $this->callAnthropic($apiKey, $config['anthropic_model'], $systemInstruction, $normalized);
            $modelUsed = $config['anthropic_model'];
            $providerUsed = 'claude';
        } else {
            $apiKey = $config['gemini_api_key'];
            if (empty($apiKey)) {
                throw new RuntimeException('Google Gemini API Key is not configured. Please add it in System Settings or .env (GEMINI_API_KEY).');
            }
            $text = $this->callGemini($apiKey, $config['gemini_model'], $systemInstruction, $normalized);
            $modelUsed = $config['gemini_model'];
            $providerUsed = 'gemini';
        }

        return [
            'provider' => $providerUsed,
            'model' => $modelUsed,
            'reply' => $text,
            'report_markdown' => $text,
            'period' => $snapshot['financial_summary']['period'],
        ];
    }

    /**
     * Backwards-compatible single-prompt wrapper.
     */
    public function generateReport(
        string $prompt,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $overrideProvider = null
    ): array {
        return $this->chat(
            [['role' => 'user', 'content' => $prompt]],
            $startDate,
            $endDate,
            $overrideProvider
        );
    }

    /**
     * Normalize chat history so it starts with a 'user' message and merges consecutive identical roles.
     */
    protected function normalizeMessages(array $messages): array
    {
        $cleaned = [];
        foreach ($messages as $msg) {
            $role = ($msg['role'] ?? 'user') === 'assistant' || ($msg['role'] ?? '') === 'model' ? 'assistant' : 'user';
            $content = trim((string) ($msg['content'] ?? ''));
            if ($content === '') {
                continue;
            }

            if (empty($cleaned) && $role !== 'user') {
                continue;
            }

            $lastIndex = count($cleaned) - 1;
            if ($lastIndex >= 0 && $cleaned[$lastIndex]['role'] === $role) {
                $cleaned[$lastIndex]['content'] .= "\n\n" . $content;
            } else {
                $cleaned[] = [
                    'role' => $role,
                    'content' => $content,
                ];
            }
        }

        if (empty($cleaned)) {
            throw new RuntimeException('No user message provided.');
        }

        return $cleaned;
    }

    protected function buildSystemInstruction(array $snapshot): string
    {
        $jsonContext = json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return <<<PROMPT
You are the Executive AI Financial & Operations Analyst for Inksite Business Management System (BMS), a printing and fabrication business in the Philippines.
All currency values are in Philippine Pesos (₱ / PHP).

Rules:
1. Rely strictly on the verified live BMS database snapshot provided below. Never invent numbers, orders, or customers.
2. You are in a multi-turn conversation with the business owner/admin. Answer both broad report requests and specific follow-up questions concisely and accurately.
3. Format your response in clean, readable Markdown with clear headings, bullet points, and tables where helpful.
4. Highlight actionable recommendations (e.g., overdue receivables to collect, low-stock materials to reorder, high-margin services, expense anomalies, or employee overtime trends).
5. Format currency values clearly as ₱X,XXX.XX.

=== LIVE BMS DATA SNAPSHOT ===
{$jsonContext}
PROMPT;
    }

    protected function callGemini(string $apiKey, string $model, string $systemInstruction, array $messages): string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $contents = array_map(fn ($m) => [
            'role' => $m['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [
                ['text' => $m['content']],
            ],
        ], $messages);

        $response = Http::timeout(60)->post($url, [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemInstruction],
                ],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.2,
            ],
        ]);

        if ($response->failed()) {
            $errorMsg = $response->json('error.message') ?? $response->body();
            throw new RuntimeException("Gemini API Error: {$errorMsg}");
        }

        $candidates = $response->json('candidates', []);
        $parts = $candidates[0]['content']['parts'] ?? [];
        $text = collect($parts)->pluck('text')->implode("\n");

        if (empty($text)) {
            throw new RuntimeException('Gemini returned an empty response.');
        }

        return $text;
    }

    protected function callAnthropic(string $apiKey, string $model, string $systemInstruction, array $messages): string
    {
        $anthropicMessages = array_map(fn ($m) => [
            'role' => $m['role'] === 'assistant' ? 'assistant' : 'user',
            'content' => $m['content'],
        ], $messages);

        $response = Http::timeout(60)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $model,
                'max_tokens' => 4096,
                'temperature' => 0.2,
                'system' => $systemInstruction,
                'messages' => $anthropicMessages,
            ]);

        if ($response->failed()) {
            $errorMsg = $response->json('error.message') ?? $response->body();
            throw new RuntimeException("Claude API Error: {$errorMsg}");
        }

        $contentBlocks = $response->json('content', []);
        $text = collect($contentBlocks)
            ->where('type', 'text')
            ->pluck('text')
            ->implode("\n");

        if (empty($text)) {
            throw new RuntimeException('Claude returned an empty response.');
        }

        return $text;
    }
}
