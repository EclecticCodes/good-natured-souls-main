import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.POSTGRES_URL!);

export async function initCustomerSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      password_hash VARCHAR(255),
      google_id VARCHAR(255),
      avatar VARCHAR(500),
      phone VARCHAR(50),
      birthday DATE,
      genres TEXT[] DEFAULT ARRAY[]::TEXT[],
      favorite_artists TEXT[] DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id SERIAL PRIMARY KEY,
      customer_email VARCHAR(255) NOT NULL,
      label VARCHAR(100) DEFAULT 'Home',
      name VARCHAR(255),
      line1 VARCHAR(255) NOT NULL,
      line2 VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      zip VARCHAR(20) NOT NULL,
      country VARCHAR(100) DEFAULT 'US',
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_wishlist (
      id SERIAL PRIMARY KEY,
      customer_email VARCHAR(255) NOT NULL,
      product_id VARCHAR(255) NOT NULL,
      product_name VARCHAR(255),
      product_type VARCHAR(100),
      product_price NUMERIC(10,2),
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(customer_email, product_id)
    )
  `;

  console.log('Customer schema initialized');
}
