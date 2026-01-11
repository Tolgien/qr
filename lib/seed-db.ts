
import pool from './db'
import bcrypt from 'bcryptjs'

async function seedDatabase() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10)
    await client.query(`
      INSERT INTO admin_users (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', passwordHash])
    
    // Insert venues
    const moltoVenueResult = await client.query(`
      INSERT INTO venues (slug, name, logo, cover_image, status, languages)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (slug) DO UPDATE 
      SET name = EXCLUDED.name
      RETURNING id
    `, [
      'molto-cafe',
      'Molto Cafe',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=400&fit=crop',
      'open',
      ['en', 'tr']
    ])
    
    const venueId = moltoVenueResult.rows[0].id

    // Insert second example venue
    await client.query(`
      INSERT INTO venues (slug, name, logo, cover_image, status, languages)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (slug) DO NOTHING
    `, [
      'urban-bistro',
      'Urban Bistro',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop',
      'open',
      ['en', 'tr']
    ])
    
    // Insert categories
    const coffeeCategory = await client.query(`
      INSERT INTO categories (venue_id, name, display_order, image)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [venueId, 'Coffee', 1, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop'])
    
    const breakfastCategory = await client.query(`
      INSERT INTO categories (venue_id, name, display_order, image)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [venueId, 'Breakfast', 2, 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop'])
    
    const dessertsCategory = await client.query(`
      INSERT INTO categories (venue_id, name, display_order, image)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [venueId, 'Desserts', 3, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop'])
    
    // Insert coffee items
    const espresso = await client.query(`
      INSERT INTO items (category_id, name, description, price, image, tags, calories, protein, carbs, fat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `, [
      coffeeCategory.rows[0].id,
      'Espresso',
      'Rich and bold Italian espresso',
      35,
      'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop',
      ['new'],
      5,
      0.1,
      1.0,
      0.0
    ])
    
    // Add variants for espresso
    await client.query(`
      INSERT INTO variants (item_id, name, price_delta)
      VALUES ($1, $2, $3), ($1, $4, $5)
    `, [espresso.rows[0].id, 'Single', 0, 'Double', 15])
    
    // Add addons for espresso
    await client.query(`
      INSERT INTO addons (item_id, name, price)
      VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)
    `, [espresso.rows[0].id, 'Extra Shot', 10, 'Almond Milk', 8, 'Oat Milk', 8])
    
    const cappuccino = await client.query(`
      INSERT INTO items (category_id, name, description, price, image, calories, protein, carbs, fat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `, [
      coffeeCategory.rows[0].id,
      'Cappuccino',
      'Creamy espresso with steamed milk foam',
      45,
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
      120,
      6.0,
      12.0,
      4.0
    ])
    
    await client.query(`
      INSERT INTO variants (item_id, name, price_delta)
      VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)
    `, [cappuccino.rows[0].id, 'Small', 0, 'Medium', 10, 'Large', 20])
    
    // Insert breakfast items
    const avocadoToast = await client.query(`
      INSERT INTO items (category_id, name, description, price, image, tags, allergens, calories, protein, carbs, fat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
    `, [
      breakfastCategory.rows[0].id,
      'Avocado Toast',
      'Smashed avocado on sourdough with cherry tomatoes',
      65,
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
      ['vegan', 'new'],
      ['gluten'],
      320,
      8.0,
      35.0,
      18.0
    ])
    
    // Insert dessert items
    await client.query(`
      INSERT INTO items (category_id, name, description, price, image, allergens, calories, protein, carbs, fat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      dessertsCategory.rows[0].id,
      'Tiramisu',
      'Classic Italian coffee-flavored dessert',
      62,
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
      ['eggs', 'dairy', 'gluten'],
      450,
      8.0,
      55.0,
      22.0
    ])
    
    // Buraya kendi verilerinizi ekleyebilirsiniz
    // Örnek: Yeni kategori ekleme
    /*
    const yourCategory = await client.query(`
      INSERT INTO categories (venue_id, name, display_order, image)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [venueId, 'Yeni Kategori', 4, 'https://example.com/image.jpg'])
    
    // Örnek: Yeni ürün ekleme
    await client.query(`
      INSERT INTO items (
        category_id, name, description, price, image, 
        calories, protein, carbs, fat, allergens, dietary_info,
        preparation_time, serving_size, ingredients, origin, storage_instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `, [
      yourCategory.rows[0].id,
      'Ürün Adı',
      'Ürün açıklaması',
      50,
      'https://example.com/product.jpg',
      200,  // calories
      5.0,  // protein
      30.0, // carbs
      10.0, // fat
      ['süt', 'gluten'], // allergens
      ['vegetarian'], // dietary_info
      15, // preparation_time (dakika)
      '250ml', // serving_size
      'İçindekiler: ...', // ingredients
      'Türkiye', // origin
      'Serin yerde saklayın' // storage_instructions
    ])
    */
    
    await client.query('COMMIT')
    console.log('✅ Database seeded successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    client.release()
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
