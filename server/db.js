import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost'
const MYSQL_PORT = Number(process.env.MYSQL_PORT) || 3306
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'u214946046_levix'
const MYSQL_USER = process.env.MYSQL_USER || 'u214946046_levix77'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || ''

let pool = null
let isConnected = false

export function getPool() {
  if (!pool && MYSQL_PASSWORD) {
    try {
      pool = mysql.createPool({
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      })
    } catch (err) {
      console.warn('MySQL pool initialization note:', err.message)
    }
  }
  return pool
}

export async function initDatabase() {
  if (!MYSQL_PASSWORD) {
    console.info('⚡ [MySQL] Waiting for MYSQL_PASSWORD in .env to connect to Hostinger database.')
    return false
  }

  const p = getPool()
  if (!p) return false

  try {
    const conn = await p.getConnection()
    console.log(`✅ [MySQL] Successfully connected to Hostinger MySQL Database: ${MYSQL_DATABASE}`)

    // 1. Products Table
    await conn.query(`
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
    `)

    // 2. Categories Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        display_order INT DEFAULT 1,
        is_published TINYINT(1) DEFAULT 1,
        is_featured TINYINT(1) DEFAULT 1,
        INDEX idx_slug (slug),
        INDEX idx_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 3. Orders Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(128) PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL,
        customer_uid VARCHAR(128),
        customer_email VARCHAR(255),
        customer_name VARCHAR(255),
        items LONGTEXT,
        shipping_address LONGTEXT,
        subtotal INT NOT NULL,
        shipping_fee INT NOT NULL,
        discount INT DEFAULT 0,
        total INT NOT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50),
        fulfillment_status VARCHAR(50),
        razorpay_order_id VARCHAR(100),
        created_at VARCHAR(64),
        updated_at VARCHAR(64),
        INDEX idx_order_num (order_number),
        INDEX idx_customer (customer_uid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 4. Store Settings Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(100) PRIMARY KEY,
        data LONGTEXT,
        updated_at VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    conn.release()
    isConnected = true
    console.log('✅ [MySQL] All required database tables verified/initialized successfully.')
    return true
  } catch (err) {
    console.warn('⚠️ [MySQL] Connection check notice:', err.message)
    isConnected = false
    return false
  }
}

export function isMySQLConnected() {
  return isConnected
}
