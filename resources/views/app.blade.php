<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        @php
            $logoPath = \App\Models\Setting::where('key', 'logo_path')->value('value');
            $faviconUrl = $logoPath ? asset('storage/' . $logoPath) : asset('favicon.ico');
        @endphp
        <link rel="icon" href="{{ $faviconUrl }}">
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
