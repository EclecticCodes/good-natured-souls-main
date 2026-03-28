import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.POSTGRES_URL!);

export async function initCustomerSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(255),
      middle_name VARCHAR(255),
      last_name VARCHAR(255),
      name VARCHAR(255),
      password_hash VARCHAR(255),
      google_id VARCHAR(255),
      avatar VARCHAR(500),
      phone VARCHAR(50),
      birthday VARCHAR(500),
      birthday_set BOOLEAN DEFAULT false,
      genres TEXT[] DEFAULT ARRAY[]::TEXT[],
      favorite_artists TEXT[] DEFAULT ARRAY[]::TEXT[],
      name_changes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Migrate existing tables — safe to run multiple times
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)`;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255)`;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS name_changes INTEGER DEFAULT 0`;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday_set BOOLEAN DEFAULT false`;

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

  await sql`
    CREATE TABLE IF NOT EXISTS artist_tracks (
      id SERIAL PRIMARY KEY,
      artist_slug VARCHAR(255) NOT NULL,
      artist_name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      duration VARCHAR(20),
      featuring VARCHAR(255),
      mp3_url VARCHAR(500),
      cover_image VARCHAR(500),
      spotify_url VARCHAR(500),
      apple_music_url VARCHAR(500),
      bandcamp_url VARCHAR(500),
      youtube_url VARCHAR(500),
      soundcloud_url VARCHAR(500),
      tidal_url VARCHAR(500),
      released_at DATE,
      is_published BOOLEAN DEFAULT false,
      play_count INTEGER DEFAULT 0,
      order_rank INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('Customer schema initialized');
}
