<?php
/**
 * LEVIX — CLI Tool to convert legacy base64 images stored in MySQL
 * into static files in /public/uploads/ and update database rows.
 * Run once via SSH or hPanel CLI: php tools/fix_images.php
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    echo "This script must only be run from the command line.\n";
    exit(1);
}

// Locate environment file
$envFiles = [
    __DIR__ . '/../.env',
    __DIR__ . '/../../.env',
];

$env = [];
foreach ($envFiles as $file) {
    if (file_exists($file)) {
        $lines = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, '#') === 0 || empty($line)) continue;
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                $env[trim($k)] = trim($v);
            }
        }
    }
}

$dbHost = getenv('MYSQL_HOST') ?: ($env['MYSQL_HOST'] ?? 'localhost');
$dbName = getenv('MYSQL_DATABASE') ?: ($env['MYSQL_DATABASE'] ?? 'u214946046_levix');
$dbUser = getenv('MYSQL_USER') ?: ($env['MYSQL_USER'] ?? 'u214946046_levix77');
$dbPass = getenv('MYSQL_PASSWORD') ?: ($env['MYSQL_PASSWORD'] ?? '');

if (empty($dbPass)) {
    echo "Error: MYSQL_PASSWORD missing in .env file.\n";
    exit(1);
}

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "Connected to MySQL database {$dbName} successfully.\n";
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

$dir = dirname(__DIR__) . '/public/uploads/';
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
}

function convert(string $v, string $dir): string {
    if (!preg_match('#^data:image/(jpeg|jpg|png|webp);base64,(.+)$#si', $v, $m)) {
        return $v;
    }
    $bin = base64_decode($m[2], true);
    if ($bin === false || !@getimagesizefromstring($bin)) {
        return $v;
    }
    $ext = strtolower($m[1]) === 'jpeg' ? 'jpg' : strtolower($m[1]);
    $name = 'img-' . bin2hex(random_bytes(8)) . '.' . $ext;
    file_put_contents($dir . $name, $bin);
    echo "  -> Saved {$name} (" . round(strlen($bin) / 1024, 1) . " KB)\n";
    return '/uploads/' . $name;
}

function fixJson(?string $json, string $dir, bool &$changed): string {
    $data = json_decode((string)$json, true);
    if ($data === null) return (string)$json;

    array_walk_recursive($data, function (&$v) use ($dir, &$changed) {
        if (is_string($v) && stripos($v, 'data:image/') === 0) {
            $n = convert($v, $dir);
            if ($n !== $v) {
                $v = $n;
                $changed = true;
            }
        }
    });

    return json_encode($data);
}

echo "Scanning products table...\n";
$pStmt = $pdo->query('SELECT id, images, color_images FROM products');
$prodCount = 0;
while ($r = $pStmt->fetch()) {
    $changed = false;
    $img = fixJson($r['images'], $dir, $changed);
    $col = fixJson($r['color_images'], $dir, $changed);
    if ($changed) {
        $uStmt = $pdo->prepare('UPDATE products SET images = ?, color_images = ? WHERE id = ?');
        $uStmt->execute([$img, $col, $r['id']]);
        $prodCount++;
        echo "Updated product {$r['id']}\n";
    }
}
echo "Products updated: {$prodCount}\n";

echo "Scanning orders table...\n";
$oStmt = $pdo->query('SELECT id, items FROM orders');
$ordCount = 0;
while ($r = $oStmt->fetch()) {
    $changed = false;
    $it = fixJson($r['items'], $dir, $changed);
    if ($changed) {
        $uStmt = $pdo->prepare('UPDATE orders SET items = ? WHERE id = ?');
        $uStmt->execute([$it, $r['id']]);
        $ordCount++;
        echo "Updated order {$r['id']}\n";
    }
}
echo "Orders updated: {$ordCount}\n";
echo "Done.\n";
