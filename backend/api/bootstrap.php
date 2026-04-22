<?php
/**
 * Bootstrap commun : charge la config, gere CORS, fournit helpers + PDO.
 * A inclure en tete de chaque endpoint.
 */

declare(strict_types=1);

// --- Config ------------------------------------------------------------
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Missing config.php on server']);
    exit;
}
$CONFIG = require $configPath;

// --- CORS --------------------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $CONFIG['cors_allowed_origins'] ?? [], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// --- Helpers -----------------------------------------------------------
function json_response($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400, array $extra = []): void {
    json_response(array_merge(['error' => $message], $extra), $status);
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_error('Invalid JSON body', 400);
    }
    return $decoded;
}

function method(): string {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function require_method(array $methods): void {
    if (!in_array(method(), $methods, true)) {
        json_error('Method not allowed', 405);
    }
}

// --- PDO ---------------------------------------------------------------
function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    global $CONFIG;
    $c = $CONFIG['db'];
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $c['host'], $c['port'], $c['database'], $c['charset']
    );
    try {
        $pdo = new PDO($dsn, $c['user'], $c['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        $msg = $CONFIG['debug'] ? $e->getMessage() : 'DB connection error';
        json_error($msg, 500);
    }
    return $pdo;
}

// --- Global exception handler -----------------------------------------
set_exception_handler(function (Throwable $e) use ($CONFIG) {
    $msg = !empty($CONFIG['debug']) ? $e->getMessage() : 'Internal server error';
    json_error($msg, 500);
});
