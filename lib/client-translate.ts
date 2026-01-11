// Simple in-memory cache for API translations
const translationCache: Record<string, string> = {}

// Extended translation dictionary for comprehensive menu terms
const translations: Record<string, Record<string, string>> = {
  // Categories
  'Kahveler': { en: 'Coffees' },
  'Yiyecekler': { en: 'Foods' },
  'İçecekler': { en: 'Beverages' },
  'Tatlılar': { en: 'Desserts' },
  'Atıştırmalıklar': { en: 'Snacks' },
  'Kahvaltı': { en: 'Breakfast' },
  'Ana Yemekler': { en: 'Main Courses' },
  'Salatalar': { en: 'Salads' },
  'Çorbalar': { en: 'Soups' },

  // Coffee types
  'Espresso': { en: 'Espresso' },
  'Americano': { en: 'Americano' },
  'Cappuccino': { en: 'Cappuccino' },
  'Latte': { en: 'Latte' },
  'Mocha': { en: 'Mocha' },
  'Filtre Kahve': { en: 'Filter Coffee' },
  'Türk Kahvesi': { en: 'Turkish Coffee' },
  'Çay': { en: 'Tea' },
  'Yeşil Çay': { en: 'Green Tea' },
  'Sıcak Çikolata': { en: 'Hot Chocolate' },

  // Common adjectives
  'taze': { en: 'fresh' },
  'sıcak': { en: 'hot' },
  'soğuk': { en: 'cold' },
  'özel': { en: 'special' },
  'lezzetli': { en: 'delicious' },
  'ev yapımı': { en: 'homemade' },
  'organik': { en: 'organic' },
  'günlük': { en: 'daily' },
  'mevsim': { en: 'seasonal' },
  'doğal': { en: 'natural' },
  'kaliteli': { en: 'quality' },
  'damak': { en: 'palate' },
  'tadınıza': { en: 'taste' },
  'geleneksel': { en: 'traditional' },
  'modern': { en: 'modern' },
  'mükemmel': { en: 'perfect' },
  'uyumunu': { en: 'harmony' },
  'sunuyor': { en: 'offers' },
  'hitap': { en: 'appeal' },
  'eden': { en: 'that' },

  // Nouns
  'malzemelerle': { en: 'ingredients' },
  'malzemeler': { en: 'ingredients' },
  'ile': { en: 'with' },
  'özenle': { en: 'carefully' },
  'hazırlanmış': { en: 'prepared' },
  'lezzet': { en: 'flavor' },
  'tariflerle': { en: 'recipes' },
  'dokunuşların': { en: 'touches' },
  'için': { en: 'for' },
  've': { en: 'and' },
  'bu': { en: 'this' },
  'ürünü': { en: 'product' },
  'kullanılır': { en: 'used' },
  'içermez': { en: 'contains no' },
  'hazırlanır': { en: 'prepared' },
  'koşullarda': { en: 'conditions' },
  'hijyenik': { en: 'hygienic' },
  'saklayın': { en: 'store' },
  'saklayınız': { en: 'store' },
  'yerde': { en: 'place' },
  'serin': { en: 'cool' },
  'kuru': { en: 'dry' },
  'bir': { en: 'a' },

  // Phrases
  'Taze ve kaliteli malzemelerle özenle hazırlanmış, damak tadınıza hitap eden bu özel lezzet, geleneksel tariflerle modern dokunuşların mükemmel uyumunu sunuyor.':
    { en: 'Carefully prepared with fresh and quality ingredients, this special flavor offers the perfect harmony of traditional recipes and modern touches to appeal to your palate.' },
  'Taze malzemeler ile özenle hazırlanmaktadır.': { en: 'Carefully prepared with fresh ingredients.' },
  'Taze malzemelerle özenle hazırlanmıştır': { en: 'Carefully prepared with fresh ingredients' },
  'Özenle hazırlanmıştır': { en: 'Carefully prepared' },
  'Günlük taze malzemeler kullanılır': { en: 'Daily fresh ingredients are used' },
  'Katkı maddesi içermez': { en: 'Contains no additives' },
  'Hijyenik koşullarda hazırlanır': { en: 'Prepared in hygienic conditions' },
  'Serin ve kuru bir yerde saklayın': { en: 'Store in a cool and dry place' },
  'Serin ve kuru yerde saklayınız': { en: 'Store in a cool and dry place' },
  'İçerik & Malzemeler': { en: 'Ingredients & Contents' },
  'Besin Değerleri': { en: 'Nutrition Facts' },
  'başına ortalama değerler': { en: 'average values per' },
  'Günlük referans alım değerleri': { en: 'Daily reference intake values' },
  'kcal diyete göre hesaplanmıştır': { en: 'kcal diet' },

  // Allergens
  'süt': { en: 'milk' },
  'gluten': { en: 'gluten' },
  'fındık': { en: 'nuts' },
  'yumurta': { en: 'egg' },
  'soya': { en: 'soy' },
  'balık': { en: 'fish' },
  'Alerjen Uyarısı': { en: 'Allergen Warning' },

  // Dietary
  'vegan': { en: 'vegan' },
  'vejetaryen': { en: 'vegetarian' },
  'vegetarian': { en: 'vegetarian' },
  'glutensiz': { en: 'gluten-free' },
  'gluten-free': { en: 'gluten-free' },
  'laktozsuz': { en: 'lactose-free' },
  'helal': { en: 'halal' },
  'halal': { en: 'halal' },

  // Portions
  'porsiyon': { en: 'serving' },
  'fincan': { en: 'cup' },
  'bardak': { en: 'glass' },
  'tabak': { en: 'plate' },
  'dilim': { en: 'slice' },

  // Variants
  'Küçük': { en: 'Small' },
  'Orta': { en: 'Medium' },
  'Büyük': { en: 'Large' },
  'Ekstra Büyük': { en: 'Extra Large' },

  // Addons
  'Ekstra Shot': { en: 'Extra Shot' },
  'Krema': { en: 'Whipped Cream' },
  'Karamel Sos': { en: 'Caramel Sauce' },
  'Çikolata Sos': { en: 'Chocolate Sauce' },
  'Vanilya Şurup': { en: 'Vanilla Syrup' },

  // Nutrition labels
  'Enerji': { en: 'Energy' },
  'Protein': { en: 'Protein' },
  'Karbonhidrat': { en: 'Carbohydrates' },
  'Yağ': { en: 'Fat' },
  'Lif': { en: 'Fiber' },
  'Şeker': { en: 'Sugar' },
  'Sodyum': { en: 'Sodium' },
  'Doymuş Yağ': { en: 'Saturated Fat' },
  'Günlük': { en: 'Daily' },
  'başına': { en: 'per' },
  'ortalama': { en: 'average' },
  'değerler': { en: 'values' },

  // Info sections
  'Menşei': { en: 'Origin' },
  'Saklama Koşulları': { en: 'Storage Conditions' },
  'Değerlendirmeler': { en: 'Reviews' },
  'değerlendirme': { en: 'reviews' },
  'Sipariş Bilgisi': { en: 'Order Information' },
  'Dakika': { en: 'Minutes' },
  'Porsiyon': { en: 'Serving' },
  'Kalite': { en: 'Quality' },

  // Actions
  'Detaylar için tıklayın': { en: 'Click for details' },
  'Sepete Ekle': { en: 'Add to Cart' },
  'Seçin': { en: 'Select' },
  'Seçenek': { en: 'Option' },
  'Ekstra': { en: 'Extra' },

  // Reviews
  'Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!': { en: 'No reviews yet. Be the first to review!' },
  'İptal': { en: 'Cancel' },
  'Değerlendir': { en: 'Review' },
  'Gönder': { en: 'Submit' },
  'Adınız': { en: 'Your Name' },
  'Puan': { en: 'Rating' },
  'Yorumunuz (opsiyonel)': { en: 'Your Comment (optional)' },
  'Yorumlar yükleniyor...': { en: 'Loading reviews...' },

  // Tags
  'YENİ ÜRÜN': { en: 'NEW PRODUCT' },
  'VEGAN': { en: 'VEGAN' },
  'ACILI': { en: 'SPICY' },
  
  // Modal labels
  'Fiyat': { en: 'Price' },
  'Hazırlık Süresi': { en: 'Preparation Time' },
  'İçindekiler': { en: 'Ingredients' },
  'Diyet Bilgisi': { en: 'Dietary Information' },
  'Bunu Alanlar Şunları da Aldı': { en: 'Frequently Bought Together' },
  'Diğer müşterilerimizin tercihleri': { en: 'Based on customer preferences' },
  'Varyant Seç': { en: 'Select Variant' },
  'Ekstralar': { en: 'Add-ons' },
  'Miktar': { en: 'Quantity' },
  'Özel Not': { en: 'Special Note' },
  'Not ekleyin (opsiyonel)': { en: 'Add note (optional)' },
  'Toplam': { en: 'Total' },
  'Tümü': { en: 'All' },
}

// Translate a single word with case preservation
function translateWord(word: string, toLang: string): string {
  if (!word || toLang === 'tr') return word

  // Trim and clean the word
  const cleanWord = word.trim()
  if (!cleanWord) return word

  // Check if it's a number or currency
  if (/^\d+[.,]?\d*$/.test(cleanWord) || /^[₺$€£]/.test(cleanWord)) {
    return word
  }

  const lowerWord = cleanWord.toLowerCase()
  const firstChar = cleanWord.charAt(0)
  const isCapitalized = firstChar === firstChar.toUpperCase()

  // Direct match (case-sensitive)
  if (translations[cleanWord]) {
    return translations[cleanWord][toLang] || word
  }

  // Case-insensitive match
  const foundKey = Object.keys(translations).find(key => key.toLowerCase() === lowerWord)
  if (foundKey && translations[foundKey]) {
    const translated = translations[foundKey][toLang]
    if (!translated || translated.trim() === '') return word

    // Preserve capitalization
    if (isCapitalized && translated.length > 0) {
      return translated.charAt(0).toUpperCase() + translated.slice(1)
    }
    return translated
  }

  return word
}

// Translate text using Google Translate API
export async function translateText(text: string, targetLang: 'en' | 'tr' | 'de' | 'ar'): Promise<string> {
  if (!text || targetLang === 'tr') return text

  const trimmedText = text.trim()
  if (!trimmedText) return text

  // Check if entire text is in dictionary (for instant common phrases)
  const lowerText = trimmedText.toLowerCase()
  if (translations[trimmedText] && translations[trimmedText][targetLang]) {
    return translations[trimmedText][targetLang]
  }
  if (translations[lowerText]) {
    const translated = translations[lowerText][targetLang]
    if (translated && translated.trim() !== '') {
      if (trimmedText.charAt(0) === trimmedText.charAt(0).toUpperCase() && translated.length > 0) {
        return translated.charAt(0).toUpperCase() + translated.slice(1)
      }
      return translated
    }
  }

  // Check cache
  const cacheKey = `${trimmedText}:${targetLang}`
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey]
  }

  // Use Google Translate API for everything else
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmedText,
        target: targetLang,
        source: 'tr'
      })
    })

    if (!response.ok) {
      console.error('Translation API error:', response.statusText)
      return text
    }

    const data = await response.json()
    const translatedText = data.translatedText || text
    
    // Cache the result
    translationCache[cacheKey] = translatedText
    
    return translatedText
  } catch (error) {
    console.error('Translation failed:', error)
    return text
  }
}

// Translate array of strings
export async function translateArray(items: string[], targetLang: 'en' | 'tr' | 'de' | 'ar'): Promise<string[]> {
  if (!items || items.length === 0 || targetLang === 'tr') return items

  return Promise.all(items.map(item => translateText(item, targetLang)))
}

// Batch translate multiple fields
export async function batchTranslate(
  texts: Array<{ text: string; field: string }>,
  targetLang: 'en' | 'tr' | 'de' | 'ar'
): Promise<Record<string, string>> {
  if (!texts || texts.length === 0 || targetLang === 'tr') {
    return texts.reduce((acc, item) => ({ ...acc, [item.field]: item.text }), {})
  }

  const translationsResult = await Promise.all(
    texts.map(async ({ text, field }) => ({
      field,
      text: await translateText(text, targetLang)
    }))
  )

  return translationsResult.reduce((acc, { field, text }) => ({ ...acc, [field]: text }), {})
}