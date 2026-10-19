<?php
/**
 * LEVIX — High-Performance Native Hostinger MySQL API
 * Connects directly to Hostinger's local MySQL server (u214946046_levix).
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Credentials
$dbHost = getenv('MYSQL_HOST') ?: 'localhost';
$dbName = getenv('MYSQL_DATABASE') ?: 'u214946046_levix';
$dbUser = getenv('MYSQL_USER') ?: 'u214946046_levix77';
$dbPass = getenv('MYSQL_PASSWORD') ?: 'Sainath2578';

// Auto-read from .env if present
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            if ($key === 'MYSQL_PASSWORD' && $val) $dbPass = $val;
            if ($key === 'MYSQL_USER' && $val) $dbUser = $val;
            if ($key === 'MYSQL_DATABASE' && $val) $dbName = $val;
            if ($key === 'MYSQL_HOST' && $val) $dbHost = $val;
        }
    }
}

// Fallback to disk JSON if password not configured yet
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$fallbackFile = $dataDir . '/products.json';

function getFallbackProducts($file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $decoded = json_decode($content, true);
        if (is_array($decoded)) return $decoded;
    }
    return [];
}

function saveFallbackProducts($file, $products) {
    file_put_contents($file, json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

$pdo = null;
if (!empty($dbPass)) {
    try {
        $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        // Auto-create products table if not exists
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
                updated_at VARCHAR(64),
                INDEX idx_slug (slug),
                INDEX idx_category (category_id),
                INDEX idx_published (is_published)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (PDOException $e) {
        // Log notice, continue with JSON fallback
        $pdo = null;
    }
}

// Request Routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Standardize route path
$route = preg_replace('#^/api#', '', $uri);
$route = trim($route, '/');

// --- PRODUCTS API ---
if ($route === 'products' || strpos($route, 'products/') === 0) {
    if ($method === 'GET') {
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
            $rows = $stmt->fetchAll();
            $products = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'name' => $r['name'],
                    'slug' => $r['slug'],
                    'description' => $r['description'],
                    'shortDescription' => $r['short_description'],
                    'sku' => $r['sku'],
                    'categoryId' => $r['category_id'],
                    'categoryName' => $r['category_name'],
                    'images' => json_decode($r['images'], true) ?: [],
                    'colorImages' => json_decode($r['color_images'], true) ?: new stdClass(),
                    'price' => (int)$r['price'],
                    'salePrice' => $r['sale_price'] !== null ? (int)$r['sale_price'] : null,
                    'stock' => (int)$r['stock'],
                    'hasVariants' => (bool)$r['has_variants'],
                    'variants' => json_decode($r['variants'], true) ?: [],
                    'isPublished' => (bool)$r['is_published'],
                    'isFeatured' => (bool)$r['is_featured'],
                    'isNewArrival' => (bool)$r['is_new_arrival'],
                    'isBestseller' => (bool)$r['is_bestseller'],
                    'details' => json_decode($r['details'], true) ?: new stdClass(),
                    'seoTitle' => $r['seo_title'],
                    'seoDescription' => $r['seo_description'],
                    'createdAt' => $r['created_at'],
                    'updatedAt' => $r['updated_at'],
                ];
            }, $rows);
            echo json_encode(['success' => true, 'source' => 'mysql', 'products' => $products]);
            exit;
        }

        // Fallback to JSON
        $products = getFallbackProducts($fallbackFile);
        echo json_encode(['success' => true, 'source' => 'file', 'products' => $products]);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || empty($body['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Product name is required']);
            exit;
        }

        $id = !empty($body['id']) ? $body['id'] : 'prod-' . time() . '-' . rand(100, 999);
        $now = date('c');

        if ($pdo) {
            $stmt = $pdo->prepare("
                INSERT INTO products (
                    id, name, slug, description, short_description, sku, category_id, category_name,
                    images, color_images, price, sale_price, stock, has_variants, variants,
                    is_published, is_featured, is_new_arrival, is_bestseller, details,
                    seo_title, seo_description, created_at, updated_at
                ) VALUES (
                    :id, :name, :slug, :description, :short_description, :sku, :category_id, :category_name,
                    :images, :color_images, :price, :sale_price, :stock, :has_variants, :variants,
                    :is_published, :is_featured, :is_new_arrival, :is_bestseller, :details,
                    :seo_title, :seo_description, :created_at, :updated_at
                ) ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    slug = VALUES(slug),
                    description = VALUES(description),
                    short_description = VALUES(short_description),
                    sku = VALUES(sku),
                    category_id = VALUES(category_id),
                    category_name = VALUES(category_name),
                    images = VALUES(images),
                    color_images = VALUES(color_images),
                    price = VALUES(price),
                    sale_price = VALUES(sale_price),
                    stock = VALUES(stock),
                    has_variants = VALUES(has_variants),
                    variants = VALUES(variants),
                    is_published = VALUES(is_published),
                    is_featured = VALUES(is_featured),
                    is_new_arrival = VALUES(is_new_arrival),
                    is_bestseller = VALUES(is_bestseller),
                    details = VALUES(details),
                    seo_title = VALUES(seo_title),
                    seo_description = VALUES(seo_description),
                    updated_at = VALUES(updated_at)
            ");

            $stmt->execute([
                ':id' => $id,
                ':name' => $body['name'],
                ':slug' => !empty($body['slug']) ? $body['slug'] : strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $body['name'])),
                ':description' => $body['description'] ?? '',
                ':short_description' => $body['shortDescription'] ?? '',
                ':sku' => $body['sku'] ?? 'LVX-' . rand(1000, 9999),
                ':category_id' => $body['categoryId'] ?? 'cat-t-shirts',
                ':category_name' => $body['categoryName'] ?? 'T-Shirts',
                ':images' => json_encode($body['images'] ?? []),
                ':color_images' => json_encode($body['colorImages'] ?? []),
                ':price' => (int)($body['price'] ?? 199900),
                ':sale_price' => isset($body['salePrice']) && $body['salePrice'] !== null ? (int)$body['salePrice'] : null,
                ':stock' => (int)($body['stock'] ?? 10),
                ':has_variants' => !empty($body['hasVariants']) ? 1 : 0,
                ':variants' => json_encode($body['variants'] ?? []),
                ':is_published' => isset($body['isPublished']) ? ($body['isPublished'] ? 1 : 0) : 1,
                ':is_featured' => isset($body['isFeatured']) ? ($body['isFeatured'] ? 1 : 0) : 1,
                ':is_new_arrival' => isset($body['isNewArrival']) ? ($body['isNewArrival'] ? 1 : 0) : 1,
                ':is_bestseller' => !empty($body['isBestseller']) ? 1 : 0,
                ':details' => json_encode($body['details'] ?? []),
                ':seo_title' => $body['seoTitle'] ?? $body['name'],
                ':seo_description' => $body['seoDescription'] ?? ($body['description'] ?? ''),
                ':created_at' => $body['createdAt'] ?? $now,
                ':updated_at' => $now,
            ]);

            echo json_encode(['success' => true, 'source' => 'mysql', 'id' => $id]);
            exit;
        }

        // Fallback save to JSON
        $products = getFallbackProducts($fallbackFile);
        $updatedProduct = array_merge($body, ['id' => $id, 'updatedAt' => $now]);
        $filtered = array_filter($products, function($p) use ($id) { return $p['id'] !== $id; });
        array_unshift($filtered, $updatedProduct);
        saveFallbackProducts($fallbackFile, array_values($filtered));

        echo json_encode(['success' => true, 'source' => 'file', 'id' => $id]);
        exit;
    }

    if ($method === 'DELETE') {
        $parts = explode('/', $route);
        $delId = end($parts);
        if ($pdo) {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
            $stmt->execute([':id' => $delId]);
            echo json_encode(['success' => true, 'message' => 'Deleted from MySQL']);
            exit;
        }

        $products = getFallbackProducts($fallbackFile);
        $filtered = array_filter($products, function($p) use ($delId) { return $p['id'] !== $delId; });
        saveFallbackProducts($fallbackFile, array_values($filtered));
        echo json_encode(['success' => true, 'message' => 'Deleted from file']);
        exit;
    }
}

// --- CATEGORIES API ---
if ($route === 'categories' || strpos($route, 'categories/') === 0) {
    if ($method === 'GET') {
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM categories ORDER BY display_order ASC");
            $rows = $stmt->fetchAll();
            $categories = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'name' => $r['name'],
                    'slug' => $r['slug'],
                    'description' => $r['description'],
                    'imageUrl' => $r['image_url'],
                    'displayOrder' => (int)$r['display_order'],
                    'isPublished' => (bool)$r['is_published'],
                    'isFeatured' => (bool)$r['is_featured'],
                ];
            }, $rows);
            echo json_encode(['success' => true, 'source' => 'mysql', 'categories' => $categories]);
            exit;
        }
        echo json_encode(['success' => true, 'categories' => []]);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || empty($body['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Category name is required']);
            exit;
        }
        $id = !empty($body['id']) ? $body['id'] : 'cat-' . time();
        if ($pdo) {
            $stmt = $pdo->prepare("
                INSERT INTO categories (id, name, slug, description, image_url, display_order, is_published, is_featured)
                VALUES (:id, :name, :slug, :description, :image_url, :display_order, :is_published, :is_featured)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name), slug = VALUES(slug), description = VALUES(description),
                    image_url = VALUES(image_url), display_order = VALUES(display_order),
                    is_published = VALUES(is_published), is_featured = VALUES(is_featured)
            ");
            $stmt->execute([
                ':id' => $id,
                ':name' => $body['name'],
                ':slug' => !empty($body['slug']) ? $body['slug'] : strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $body['name'])),
                ':description' => $body['description'] ?? '',
                ':image_url' => $body['imageUrl'] ?? '',
                ':display_order' => (int)($body['displayOrder'] ?? 1),
                ':is_published' => isset($body['isPublished']) ? ($body['isPublished'] ? 1 : 0) : 1,
                ':is_featured' => isset($body['isFeatured']) ? ($body['isFeatured'] ? 1 : 0) : 1,
            ]);
            echo json_encode(['success' => true, 'category' => array_merge($body, ['id' => $id])]);
            exit;
        }
        echo json_encode(['success' => true, 'category' => array_merge($body, ['id' => $id])]);
        exit;
    }
}

// --- SETTINGS API ---
if ($route === 'settings' || strpos($route, 'settings/') === 0) {
    if ($method === 'GET') {
        if ($pdo) {
            $stmt = $pdo->query("SELECT data FROM store_settings WHERE id = 'general'");
            $row = $stmt->fetch();
            if ($row && !empty($row['data'])) {
                $settings = json_decode($row['data'], true);
                echo json_encode(['success' => true, 'source' => 'mysql', 'settings' => $settings]);
                exit;
            }
        }
        echo json_encode(['success' => true, 'settings' => null]);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if ($pdo && $body) {
            $stmt = $pdo->prepare("
                INSERT INTO store_settings (id, data, updated_at)
                VALUES ('general', :data, :updated_at)
                ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)
            ");
            $stmt->execute([
                ':data' => json_encode($body),
                ':updated_at' => date('c'),
            ]);
            echo json_encode(['success' => true, 'settings' => $body]);
            exit;
        }
        echo json_encode(['success' => true, 'settings' => $body]);
        exit;
    }
}

// Fallback Health
echo json_encode([
    'status' => 'ok',
    'database' => $pdo ? 'connected (MySQL)' : 'file fallback',
    'timestamp' => date('c'),
]);
