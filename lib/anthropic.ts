import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      const isOverloaded = error?.status === 529 || error?.error?.error?.type === 'overloaded_error'
      const isRateLimited = error?.status === 429
      const shouldRetry = isOverloaded || isRateLimited
      
      if (!shouldRetry || attempt === maxRetries) {
        throw error
      }
      
      const delay = initialDelay * Math.pow(2, attempt)
      console.log(`⚠️ API overloaded/rate limited, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export async function generateItemDetails(itemName: string, language: 'tr' | 'en' = 'tr') {
  const prompt = language === 'tr'
    ? `"${itemName}" yiyecek/içecek ürünü için aşağıdaki bilgileri JSON formatında ver. TÜM sayısal alanlar MUTLAKA sayı olmalı (0 bile olsa):
- description: Detaylı açıklama (2-3 cümle, mutlaka doldur)
- calories: Kalori (sayı, 0 veya üzeri, tahmini değer ver)
- protein: Protein gram (ondalık sayı, 0 veya üzeri)
- carbs: Karbonhidrat gram (ondalık sayı, 0 veya üzeri)
- fat: Yağ gram (ondalık sayı, 0 veya üzeri)
- fiber: Lif gram (ondalık sayı, 0 veya üzeri)
- sugar: Şeker gram (ondalık sayı, 0 veya üzeri)
- sodium: Sodyum miligram (sayı, 0 veya üzeri)
- preparation_time: Hazırlama süresi dakika (sayı, 0 veya üzeri)
- serving_size: Porsiyon boyutu (metin, örn: "1 fincan (200ml)")
- ingredients: İçerik ve malzemeler (detaylı açıklama)
- allergens: Alerjenler (array - boş bile olsa [] döndür. Örn: ["süt", "gluten"] veya [])
- tags: Uygun etiketler (array - en az 2-3 etiket. Örn: ["vegan", "yeni"])
- dietary_info: Diyet bilgisi (array - en az 2-3 öğe. Örn: ["vegetarian", "halal"])
- origin: Menşei (ülke/bölge adı)
- storage_instructions: Saklama koşulları (kısa açıklama)

ÖNEMLİ: Tüm sayı alanları (calories, protein, carbs, fat, fiber, sugar, sodium, preparation_time) MUTLAKA sayı değeri içermeli, boş string OLMAMALI!
SADECE JSON döndür, başka açıklama ekleme!`
    : `For the food/beverage item "${itemName}", provide the following information in JSON format. ALL numeric fields MUST be numbers (even if 0):
- description: Detailed description (2-3 sentences)
- calories: Calories (number, 0 or higher, provide estimate)
- protein: Protein grams (decimal number, 0 or higher)
- carbs: Carbohydrates grams (decimal number, 0 or higher)
- fat: Fat grams (decimal number, 0 or higher)
- fiber: Fiber grams (decimal number, 0 or higher)
- sugar: Sugar grams (decimal number, 0 or higher)
- sodium: Sodium milligrams (number, 0 or higher)
- preparation_time: Preparation time minutes (number, 0 or higher)
- serving_size: Serving size (text, e.g., "1 cup (200ml)")
- ingredients: Ingredients and content (detailed description)
- allergens: Allergens (array - return [] if none. Example: ["milk", "gluten"] or [])
- tags: Appropriate tags (array - at least 2-3 tags. Example: ["vegan", "new"])
- dietary_info: Dietary info (array - at least 2-3 items. Example: ["vegetarian", "halal"])
- origin: Origin (country/region name)
- storage_instructions: Storage instructions (brief description)

IMPORTANT: All number fields (calories, protein, carbs, fat, fiber, sugar, sodium, preparation_time) MUST contain number values, NOT empty strings!
Return ONLY JSON, no additional explanation!`

  try {
    return await retryWithBackoff(async () => {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const content = message.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
      throw new Error('Invalid response format')
    })
  } catch (error) {
    console.error('Error generating item details:', error)
    throw error
  }
}

export async function getSimilarItems(itemName: string, itemDescription: string, language: 'tr' | 'en' = 'tr') {
  const prompt = language === 'tr'
    ? `"${itemName}" (${itemDescription}) ürününe benzer 3-4 ürün öner. JSON formatında şu bilgileri ver:
- name: Ürün adı
- description: Kısa açıklama (1 cümle)
- estimatedPrice: Tahmini fiyat (sayı, TL cinsinden)

JSON array döndür, başka açıklama ekleme. Örnek: [{"name":"Latte","description":"Espresso ve bol sütlü kahve","estimatedPrice":50}]`
    : `Suggest 3-4 similar items to "${itemName}" (${itemDescription}). Provide in JSON format:
- name: Product name
- description: Brief description (1 sentence)
- estimatedPrice: Estimated price (number, in TL)

Return JSON array only, no additional explanation. Example: [{"name":"Latte","description":"Espresso with steamed milk","estimatedPrice":50}]`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }
    return []
  } catch (error) {
    console.error('Error getting similar items:', error)
    return []
  }
}

export async function getPairingItems(itemName: string, itemDescription: string, language: 'tr' | 'en' = 'tr', availableItems?: string[]) {
  const availableItemsHint = availableItems && availableItems.length > 0
    ? `\n\nMevcut menüde şu ürünler var: ${availableItems.join(', ')}. Mümkünse bu ürünlerden öner.`
    : ''

  const prompt = language === 'tr'
    ? `"${itemName}" (${itemDescription}) ile en iyi giden 2-3 ürün öner. Bunlar farklı kategorilerden olabilir (örn: kahve ile tatlı, yemek ile içecek). Genel kategori isimleri kullan (Latte, Cappuccino, Brownie, Cheesecake gibi).${availableItemsHint}

JSON formatında şu bilgileri ver:
- name: Ürün adı (kısa ve yaygın isim kullan)
- description: Neden iyi gider? (1 cümle)
- estimatedPrice: Tahmini fiyat (sayı, TL cinsinden)
- pairingReason: Eşleşme nedeni (kısa, örn: "Mükemmel kahve eşliği")

JSON array döndür, başka açıklama ekleme. Örnek: [{"name":"Latte","description":"Yumuşak içecek","estimatedPrice":45,"pairingReason":"Tatlıyla mükemmel uyum"}]`
    : `Suggest 2-3 items that pair well with "${itemName}" (${itemDescription}). These can be from different categories (e.g., coffee with dessert, meal with drink). Use common category names (Latte, Cappuccino, Brownie, Cheesecake, etc.).${availableItemsHint}

Provide in JSON format:
- name: Product name (short and common name)
- description: Why does it pair well? (1 sentence)
- estimatedPrice: Estimated price (number, in TL)
- pairingReason: Pairing reason (brief, e.g., "Perfect coffee companion")

Return JSON array only, no additional explanation. Example: [{"name":"Latte","description":"Smooth beverage","estimatedPrice":45,"pairingReason":"Perfect with desserts"}]`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }
    return []
  } catch (error) {
    console.error('Error getting pairing items:', error)
    return []
  }
}

export async function translateText(text: string, fromLang: 'tr' | 'en' | 'de' | 'ar', toLang: 'tr' | 'en' | 'de' | 'ar') {
  if (fromLang === toLang) return text

  const languageNames: { [key: string]: string } = {
    'tr': 'Turkish',
    'en': 'English',
    'de': 'German',
    'ar': 'Arabic'
  }

  const prompt = `Translate the following text from ${languageNames[fromLang]} to ${languageNames[toLang]}. Return only the translation, no additional explanation:

${text}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text.trim()
    }
    return text
  } catch (error) {
    console.error('Error translating text:', error)
    return text
  }
}

export async function searchImage(itemName: string) {
  try {
    // First, get a better search term from AI
    const prompt = `For the food/beverage item "${itemName}", provide the BEST Unsplash search query in English for finding a high-quality food photo. Return ONLY the search term (2-4 words max), nothing else.

Examples:
- Espresso → "espresso coffee cup"
- Cheesecake → "cheesecake dessert"
- Hamburger → "gourmet burger"

Just return the search term:`

    let searchTerm = itemName
    try {
      const message = await retryWithBackoff(async () => {
        return await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 30,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      })

      const content = message.content[0]
      if (content.type === 'text') {
        searchTerm = content.text.trim().replace(/['"]/g, '')
      }
    } catch (aiError) {
      console.warn('⚠️ AI search term generation failed, using original item name:', aiError)
    }

    console.log(`🔍 Searching Unsplash for: "${searchTerm}"`)

    // Search Unsplash with the optimized term
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Return the best quality image
        console.log(`✅ Found ${data.results.length} images on Unsplash`)
        return data.results[0].urls.regular
      }
    }

    // Fallback: try with original item name
    const fallbackResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(itemName)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json()
      if (fallbackData.results && fallbackData.results.length > 0) {
        console.log(`✅ Found image with fallback search`)
        return fallbackData.results[0].urls.regular
      }
    }

    console.log(`❌ No images found on Unsplash`)
    return null
  } catch (error) {
    console.error('Error searching image:', error)
    return null
  }
}