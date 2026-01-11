-- Users table (for cafe owners)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP,
  membership_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'basic', 'premium'
  membership_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues table - now with owner_id
CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo TEXT,
  cover_image TEXT,
  theme VARCHAR(50) DEFAULT 'coffee',
  status VARCHAR(20) DEFAULT 'open',
  online_ordering_enabled BOOLEAN DEFAULT false,
  address TEXT,
  phone VARCHAR(50),
  wifi_password VARCHAR(255),
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sliders table (multiple sliders per venue)
CREATE TABLE IF NOT EXISTS sliders (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sliders_venue ON sliders(venue_id);
CREATE INDEX IF NOT EXISTS idx_sliders_active ON sliders(is_active);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
  calories INTEGER,
  protein DECIMAL(5, 2),
  carbs DECIMAL(5, 2),
  fat DECIMAL(5, 2),
  fiber DECIMAL(5, 2),
  sugar DECIMAL(5, 2),
  sodium INTEGER,
  preparation_time INTEGER, -- minutes
  serving_size VARCHAR(100),
  ingredients TEXT,
  origin VARCHAR(255),
  storage_instructions TEXT,
  dietary_info TEXT[], -- ['vegan', 'gluten-free', 'halal', etc.]
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Variants table
CREATE TABLE IF NOT EXISTS variants (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price_delta DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addons table
CREATE TABLE IF NOT EXISTS addons (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  table_number VARCHAR(50),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id),
  variant_id INTEGER REFERENCES variants(id),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order addons table
CREATE TABLE IF NOT EXISTS order_addons (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  addon_id INTEGER REFERENCES addons(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (super admin)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table tokens for secure QR codes per table
CREATE TABLE IF NOT EXISTS table_tokens (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  table_number VARCHAR(50) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP,
  UNIQUE(venue_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_table_tokens_venue ON table_tokens(venue_id);
CREATE INDEX IF NOT EXISTS idx_table_tokens_token ON table_tokens(token);

-- Item pairings table (AI-generated pairing suggestions)
CREATE TABLE IF NOT EXISTS item_pairings (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  pairing_item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  pairing_reason VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, pairing_item_id)
);

-- User behavior based item associations
CREATE TABLE IF NOT EXISTS item_associations (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  associated_item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  frequency INTEGER DEFAULT 1,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, associated_item_id)
);

-- Membership plans reference table
CREATE TABLE IF NOT EXISTS membership_plans (
  id SERIAL PRIMARY KEY,
  tier VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'basic', 'premium'
  max_categories INTEGER,
  max_items INTEGER,
  price DECIMAL(10, 2),
  features JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert membership plans
INSERT INTO membership_plans (tier, max_categories, max_items, price, features)
VALUES
  ('free', 5, 20, 0.00, '{"name": "Ücretsiz", "support": "Community"}'),
  ('basic', -1, -1, 299.00, '{"name": "Basic", "support": "Email", "analytics": true}'),
  ('premium', -1, -1, 999.00, '{"name": "Premium", "support": "Priority", "analytics": true, "customization": true}')
ON CONFLICT (tier) DO UPDATE SET
  max_categories = EXCLUDED.max_categories,
  max_items = EXCLUDED.max_items,
  price = EXCLUDED.price,
  features = EXCLUDED.features;

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  keywords TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_venues_owner ON venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_venue ON categories(venue_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_variants_item ON variants(item_id);
CREATE INDEX IF NOT EXISTS idx_addons_item ON addons(item_id);
CREATE INDEX IF NOT EXISTS idx_orders_venue ON orders(venue_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_item_pairings_item ON item_pairings(item_id);
CREATE INDEX IF NOT EXISTS idx_item_associations_item ON item_associations(item_id);
CREATE INDEX IF NOT EXISTS idx_item_associations_frequency ON item_associations(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);



-- Pending payments table for iyzico integration
CREATE TABLE IF NOT EXISTS pending_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  basket_id VARCHAR(255) UNIQUE NOT NULL,
  membership_tier VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- System settings table for storing API keys and configurations
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES admin_users(id)
);

-- Settings table for iyzico and Google Translate integration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  iyzico_api_key TEXT,
  iyzico_secret_key TEXT,
  iyzico_base_url TEXT DEFAULT 'https://sandbox-api.iyzipay.com',
  google_translate_api_key TEXT,
  use_google_translate BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waiter calls table for customer service requests
CREATE TABLE IF NOT EXISTS waiter_calls (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  table_number VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_waiter_calls_venue ON waiter_calls(venue_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON waiter_calls(status);

-- Uploaded images table for persistent image storage
CREATE TABLE IF NOT EXISTS uploaded_images (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  data TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_images_filename ON uploaded_images(filename);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_uploaded_by ON uploaded_images(uploaded_by);