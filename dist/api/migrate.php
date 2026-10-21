<?php
/**
 * LEVIX — One-Time Database Migration & Index Creation Script
 * Run once from CLI: php public/api/migrate.php
 * Strictly blocks web access for security.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    echo "This script must only be run from the command line.\n";
    exit(1);
}

// Load environment
$envFiles = [
    __DIR__ . '/../../.env',
    __DIR__ . '/../.env',
    dirname(dirname(__DIR__)) . '/.env',
];

$envLoaded = [];
foreach ($envFiles as $envFile) {
    if (file_exists($envFile)) {
        $lines = @file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, '#') === 0 || empty($line)) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $envLoaded[trim($key)] = trim($val);
            }
        }
    }
}

$dbHost = getenv('MYSQL_HOST') ?: ($envLoaded['MYSQL_HOST'] ?? 'localhost');
$dbName = getenv('MYSQL_DATABASE') ?: ($envLoaded['MYSQL_DATABASE'] ?? 'u214946046_levix');
$dbUser = getenv('MYSQL_USER') ?: ($envLoaded['MYSQL_USER'] ?? 'u214946046_levix77');
$dbPass = getenv('MYSQL_PASSWORD') ?: ($envLoaded['MYSQL_PASSWORD'] ?? '');

if (empty($dbPass)) {
    echo "Error: MYSQL_PASSWORD missing in .env configuration.\n";
    exit(1);
}

try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    echo "Connected to MySQL database [{$dbName}] on [{$dbHost}].\n";
} catch (PDOException $e) {
    echo "Connection error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "1. Creating tables if not exist...\n";

// 1. Products Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description LONGTEXT,
        short_description TEXT,
        sku VARCHAR(100),
        category_id VARCHAR(100),
        category_name VARCHAR(100),
        images LONGTEXT,
        color_images LONGTEXT,
        price INT NOT NULL,
        sale_price INT NULL,
        stock INT DEFAULT 10,
        has_variants TINYINT(1) DEFAULT 0,
        variants LONGTEXT,
        is_published TINYINT(1) DEFAULT 1,
        is_featured TINYINT(1) DEFAULT 1,
        is_new_arrival TINYINT(1) DEFAULT 1,
        is_bestseller TINYINT(1) DEFAULT 0,
        details LONGTEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at VARCHAR(64),
        updated_at VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 2. Variants Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(128) NOT NULL,
        sku VARCHAR(80) UNIQUE,
        size VARCHAR(20),
        color VARCHAR(40),
        stock INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 3. Categories Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        display_order INT DEFAULT 1,
        is_published TINYINT(1) DEFAULT 1,
        is_featured TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 4. Orders Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(128) PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        customer_uid VARCHAR(128),
        tracking_token CHAR(32) NOT NULL,
        customer_email VARCHAR(255),
        customer_name VARCHAR(255),
        items LONGTEXT,
        shipping_address LONGTEXT,
        subtotal INT NOT NULL,
        shipping_fee INT NOT NULL,
        discount INT DEFAULT 0,
        total INT NOT NULL,
        coupon_code VARCHAR(50) DEFAULT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50),
        fulfillment_status VARCHAR(50) DEFAULT 'Pending',
        courier VARCHAR(100) DEFAULT NULL,
        awb VARCHAR(100) DEFAULT NULL,
        admin_note TEXT DEFAULT NULL,
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100) UNIQUE,
        reserved_until DATETIME DEFAULT NULL,
        created_at VARCHAR(64),
        updated_at VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 5. Users Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        phone VARCHAR(50),
        addresses LONGTEXT,
        created_at VARCHAR(64),
        updated_at VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 6. Coupons Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(50) PRIMARY KEY,
        discount_percent INT NOT NULL,
        min_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");
$pdo->exec("
    INSERT IGNORE INTO coupons (code, discount_percent, min_order, is_active) VALUES
    ('LEVIX10', 10, 0, 1),
    ('WELCOME10', 10, 0, 1),
    ('LEVIX15', 15, 150000, 1);
");

// 7. Rate Limits Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS rate_limits (
        k VARCHAR(120) PRIMARY KEY,
        n INT NOT NULL DEFAULT 1,
        reset_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 8. Webhook Events Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS webhook_events (
        event_id VARCHAR(64) PRIMARY KEY,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 9. Store Settings Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(100) PRIMARY KEY,
        data LONGTEXT,
        updated_at VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// 10. Audit Log Table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS audit_log (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        actor_uid VARCHAR(64) NOT NULL,
        action VARCHAR(60) NOT NULL,
        entity VARCHAR(60) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        detail JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

echo "2. Applying required database indexes (Fix 3 & Fix 4)...\n";
$indexes = [
    "ALTER TABLE orders ADD INDEX idx_customer_created (customer_uid, created_at)",
    "ALTER TABLE orders ADD INDEX idx_status_created (fulfillment_status, created_at)",
    "ALTER TABLE orders ADD INDEX idx_updated (updated_at)",
    "ALTER TABLE orders ADD INDEX idx_tracking (tracking_token)",
    "ALTER TABLE products ADD INDEX idx_pub_created (is_published, created_at)",
    "ALTER TABLE products ADD INDEX idx_slug (slug)",
    "ALTER TABLE products ADD INDEX idx_category (category_id)",
    "ALTER TABLE categories ADD INDEX idx_slug (slug)",
    "ALTER TABLE categories ADD INDEX idx_order (display_order)",
    "ALTER TABLE users ADD INDEX idx_email (email)",
];

foreach ($indexes as $idxSql) {
    try {
        $pdo->exec($idxSql);
        echo "  ✔ Applied index: {$idxSql}\n";
    } catch (Exception $e) {
        // Index may already exist
        echo "  ℹ Index note: {$e->getMessage()}\n";
    }
}

echo "Migration complete! All tables and indexes are ready.\n";
