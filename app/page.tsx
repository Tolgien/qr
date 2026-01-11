"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Venue } from "@/lib/types";
import {
  Scan,
  Smartphone,
  Globe2,
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Check,
  LogIn,
  UserPlus,
  Send,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";

function BlogPosts() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts((data.posts || []).slice(0, 3)) // Only show 3 latest posts
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="col-span-3 text-center py-12">
        <div className="inline-flex items-center gap-3 text-[#1A1A1A]/60">
          <div className="w-6 h-6 border-3 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
          <span>Yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-3 text-center py-12">
        <p className="text-[#1A1A1A]/60">Henüz blog yazısı yok</p>
      </div>
    )
  }

  return (
    <>
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          onClick={() => router.push(`/blog/${post.slug}`)}
          className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group border border-[#1A1A1A]/5"
        >
          {post.image && (
            <div className="h-56 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/60 mb-3">
              <Star className="w-4 h-4" />
              <time>
                {new Date(post.published_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#34C8B6] transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h3>
            <p className="text-[#1A1A1A]/70 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-2 text-[#34C8B6] font-medium">
              Devamını Oku
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.article>
      ))}
    </>
  )
}

function PricingPreviewSection() {
  const router = useRouter()
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/membership-plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data.plans || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  const getPlanTitle = (planType: string) => {
    const titles: Record<string, string> = {
      'free': 'Free',
      'basic': 'Basic',
      'premium': 'Premium'
    }
    return titles[planType] || planType
  }

  const getPlanSubtitle = (planType: string) => {
    const subtitles: Record<string, string> = {
      'free': 'Deneme için',
      'basic': 'Küçük işletmeler için',
      'premium': 'Büyüyen işletmeler için'
    }
    return subtitles[planType] || ''
  }

  if (loading) {
    return (
      <section id="pricing" className="py-24 px-6 lg:px-8 bg-white/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 text-[#1A1A1A]/60">
            <div className="w-6 h-6 border-3 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
            <span>Planlar yükleniyor...</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-24 px-6 lg:px-8 bg-white/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-[#1A1A1A] mb-4">
            Basit ve Şeffaf Fiyatlandırma
          </h2>
          <p className="text-xl text-[#1A1A1A]/60 max-w-2xl mx-auto">
            İşletmenizin büyüklüğüne göre esnek planlar
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const isPremium = plan.planType === 'premium';
            const isBasic = plan.planType === 'basic';
            const isFree = plan.planType === 'free';
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative rounded-2xl transition-all duration-300 ${
                  isPremium
                    ? 'bg-white border-2 border-[#34C8B6] shadow-lg hover:shadow-xl'
                    : 'bg-white border border-gray-200 hover:border-[#34C8B6]/50 hover:shadow-lg'
                }`}
              >
                <div className="relative p-8 h-full">
                  {isPremium && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#34C8B6] text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                        En Popüler
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center mb-6">
                    <div 
                      className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        isPremium 
                          ? 'bg-[#34C8B6]/10' 
                          : isBasic
                          ? 'bg-blue-50'
                          : 'bg-teal-50'
                      }`}
                    >
                      {isPremium && (
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#premium-gradient)" stroke="url(#premium-gradient)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <defs>
                            <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#34C8B6"/>
                              <stop offset="100%" stopColor="#2AA897"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                      {isBasic && (
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="url(#basic-gradient)" stroke="url(#basic-gradient)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <defs>
                            <linearGradient id="basic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3B82F6"/>
                              <stop offset="100%" stopColor="#1D4ED8"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                      {isFree && (
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="url(#free-gradient)" opacity="0.2"/>
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="url(#free-gradient)"/>
                          <path d="M14.5 9H9.5C8.67 9 8 9.67 8 10.5V13.5C8 14.33 8.67 15 9.5 15H14.5C15.33 15 16 14.33 16 13.5V10.5C16 9.67 15.33 9 14.5 9Z" fill="url(#free-gradient)"/>
                          <defs>
                            <linearGradient id="free-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#14B8A6"/>
                              <stop offset="100%" stopColor="#0D9488"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">
                      {getPlanTitle(plan.planType)}
                    </h3>
                    <p className="text-sm text-[#1A1A1A]/60">
                      {getPlanSubtitle(plan.planType)}
                    </p>
                  </div>
                  
                  <div className="text-center mb-8 py-6 bg-gray-50 rounded-xl">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-[#1A1A1A]">
                        {Math.floor(plan.monthlyPrice)}
                      </span>
                      <span className="text-lg text-[#1A1A1A]/70">₺</span>
                      <span className="text-sm text-[#1A1A1A]/60">/ay</span>
                    </div>
                    {plan.yearlyPrice > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-[#34C8B6] font-medium">
                          Yıllık %20 indirimli
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3"
                      >
                        <Check className="w-5 h-5 text-[#34C8B6] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span className="text-[#1A1A1A]/80 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push("/register")}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isPremium
                        ? 'bg-[#34C8B6] text-white hover:bg-[#2AA897]'
                        : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
                    }`}
                  >
                    {isFree ? 'Hemen Başla' : 'Planı Seç'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push("/pricing")}
            className="group px-8 py-4 bg-[#1A1A1A] text-[#F7F3EB] rounded-full font-semibold text-lg hover:bg-[#D7A449] hover:text-[#1A1A1A] transition-all duration-300 inline-flex items-center gap-3"
          >
            Tüm Planları Görüntüle
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        const data = await response.json()
        setError(data.error || 'Mesaj gönderilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl shadow-xl p-8 border border-[#1A1A1A]/5"
    >
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-lg"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2,
                duration: 0.6,
                type: "spring",
                stiffness: 200
              }}
              className="flex-shrink-0"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>
            <div className="flex-1">
              <motion.h4
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-emerald-800 mb-1"
              >
                Başarılı!
              </motion.h4>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-emerald-700 leading-relaxed"
              >
                Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              İsim *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
              placeholder="ornek@email.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
              placeholder="+90 (555) 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Konu
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
              placeholder="Mesaj konusu"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            Mesaj *
          </label>
          <textarea
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent resize-none"
            placeholder="Mesajınızı buraya yazın..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-4 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? 'Gönderiliyor...' : (
            <>
              <Send className="w-5 h-5" />
              Mesaj Gönder
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch("/api/venues");
        const data = await res.json();
        setVenues(data.venues || []);
      } catch (error) {
        console.error("Error fetching venues:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  const features = [
    {
      icon: Smartphone,
      title: "Uygulama Gerektirmez",
      description: "Müşterileriniz herhangi bir cihazdan anında tarama yapıp sipariş verebilir",
    },
    {
      icon: Sparkles,
      title: "Anlık Menü Güncellemeleri",
      description: "Fiyatları ve ürünleri tüm masalarda anında güncelleyin",
    },
    {
      icon: Globe2,
      title: "Çoklu Dil Desteği",
      description: "Yabancı misafirlerinize kendi dillerinde hizmet verin",
    },
    {
      icon: Scan,
      title: "Masa QR Kodları",
      description: "Her masa için otomatik olarak benzersiz kodlar oluşturun",
    },
  ];

  const footerLinks = {
    product: [
      { name: "Özellikler", href: "#features" },
      { name: "Fiyatlandırma", href: "#pricing" },
      { name: "Örnek Menüler", href: "#venues" },
      { name: "Müşteri Yorumları", href: "#testimonials" },
    ],
    company: [
      { name: "Hakkımızda", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Kariyer", href: "#careers" },
      { name: "İletişim", href: "#contact" },
    ],
    support: [
      { name: "Yardım Merkezi", href: "#help" },
      { name: "SSS", href: "#faq" },
      { name: "Kullanım Kılavuzu", href: "#guide" },
      { name: "API Dokümantasyonu", href: "#api" },
    ],
    legal: [
      { name: "Gizlilik Politikası", href: "/privacy" },
      { name: "Kullanım Koşulları", href: "/terms" },
      { name: "Çerez Politikası", href: "/cookies" },
      { name: "KVKK", href: "/kvkk" },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F3EB]/80 backdrop-blur-xl border-b border-[#1A1A1A]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <button onClick={() => router.push("/")}>
                <img 
                  src="/logo-qrim.png" 
                  alt="Logo" 
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              {/* Desktop Menu */}
              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="#features"
                  title="QRim.net Özellikleri"
                  className="text-[#1A1A1A] font-medium hover:text-[#D7A449] transition-colors text-base"
                >
                  Özellikler
                </a>
                <a
                  href="#blog"
                  title="QRim.net Blog Yazıları"
                  className="text-[#1A1A1A] font-medium hover:text-[#D7A449] transition-colors text-base"
                >
                  Blog
                </a>
                <a
                  href="#pricing"
                  title="QRim.net Fiyatlandırma Planları"
                  className="text-[#1A1A1A] font-medium hover:text-[#D7A449] transition-colors text-base"
                >
                  Fiyatlandırma
                </a>
                <a
                  href="#venues"
                  title="Örnek QR Menüler"
                  className="text-[#1A1A1A] font-medium hover:text-[#D7A449] transition-colors text-base"
                >
                  Örnek Menüler
                </a>
                <a
                  href="#testimonials"
                  title="Müşteri Yorumları ve Referanslar"
                  className="text-[#1A1A1A] font-medium hover:text-[#D7A449] transition-colors text-base"
                >
                  Müşteri Yorumları
                </a>
                <a
                  href="#contact"
                  title="QRim.net İletişim"
                  className="text-[#1A1A1A] font-medium hover:text-[#D7A449] transition-colors text-base"
                >
                  İletişim
                </a>
              </nav>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 px-5 py-2.5 text-[#1A1A1A] font-medium hover:text-[#D7A449] transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-[#F7F3EB] rounded-full font-semibold hover:bg-[#D7A449] hover:text-[#1A1A1A] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="w-5 h-5" />
                  Kayıt Ol
                </button>
              </div>

              {/* Mobile Hamburger Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm border border-[#1A1A1A]/10 hover:bg-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={mobileMenuOpen ? "open" : "closed"}
                  className="flex flex-col gap-1.5"
                >
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 8 }
                    }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-6 h-0.5 bg-[#1A1A1A] rounded-full origin-center"
                  />
                  <motion.span
                    variants={{
                      closed: { opacity: 1, x: 0 },
                      open: { opacity: 0, x: -10 }
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-0.5 bg-[#1A1A1A] rounded-full"
                  />
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -8 }
                    }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-6 h-0.5 bg-[#1A1A1A] rounded-full origin-center"
                  />
                </motion.div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                mass: 0.8
              }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#F7F3EB] z-50 md:hidden overflow-y-auto shadow-2xl"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#1A1A1A]/10">
                <div className="flex items-center gap-3">
                  <img 
                    src="/logo-qrim.png" 
                    alt="Logo" 
                    className="h-10 w-auto"
                  />
                </div>
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileTap={{ scale: 0.9, rotate: 90 }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 hover:bg-white transition-colors"
                >
                  <X className="w-6 h-6 text-[#1A1A1A]" />
                </motion.button>
              </div>

              {/* Menu Items */}
              <div className="p-6 space-y-2">
                {[
                  { label: "Özellikler", href: "#features", icon: Sparkles, title: "QRim.net Özellikleri" },
                  { label: "Blog", href: "#blog", icon: Star, title: "QRim.net Blog" },
                  { label: "Fiyatlandırma", href: "#pricing", icon: Check, title: "QRim.net Fiyatlandırma" },
                  { label: "Örnek Menüler", href: "#venues", icon: MapPin, title: "Örnek QR Menüler" },
                  { label: "Müşteri Yorumları", href: "#testimonials", icon: Star, title: "Müşteri Referansları" },
                  { label: "İletişim", href: "#contact", icon: Mail, title: "QRim.net İletişim" }
                ].map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    title={item.title}
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 24
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white/60 hover:bg-white transition-all group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-[#1A1A1A]" />
                    </div>
                    <span className="text-[#1A1A1A] font-semibold group-hover:text-[#D7A449] transition-colors">
                      {item.label}
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#1A1A1A]/30 ml-auto group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="p-6 space-y-3 border-t border-[#1A1A1A]/10">
                <motion.button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/80 hover:bg-white text-[#1A1A1A] rounded-xl font-semibold transition-all border border-[#1A1A1A]/10"
                >
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </motion.button>
                <motion.button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/register");
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-[#1A1A1A] rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="w-5 h-5" />
                  Kayıt Ol
                </motion.button>
              </div>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 text-center text-sm text-[#1A1A1A]/60"
              >
                <p>© 2024 QR Menü</p>
                <p className="mt-1">Tüm hakları saklıdır</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#34C8B6]/10 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#34C8B6]" />
                <span className="text-sm font-medium text-[#1A1A1A]">
                  Menü Deneyiminizi Dönüştürün
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1A1A1A] mb-6 leading-tight tracking-tight">
                Dijital Menüler
                <span className="block bg-gradient-to-r from-[#D7A449] to-[#34C8B6] bg-clip-text text-transparent">
                  Artık Premium
                </span>
              </h1>

              <p className="text-lg md:text-xl text-[#1A1A1A]/70 mb-8 leading-relaxed">
                Tara • Sipariş Ver • Keyfini Çıkar
              </p>

              <p className="text-base md:text-lg text-[#1A1A1A]/60 mb-10 max-w-lg">
                Kafeniz veya restoranınız için güzel, temassız menüler oluşturun.
                Uygulama yok, karmaşa yok—sadece tarayın ve servis yapın.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push("/register")}
                  className="group px-8 py-4 bg-[#1A1A1A] text-[#F7F3EB] rounded-full font-semibold text-lg hover:bg-[#D7A449] hover:text-[#1A1A1A] transition-all duration-300 shadow-2xl hover:shadow-[#D7A449]/30 flex items-center gap-3"
                >
                  Ücretsiz Başlayın
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() =>
                    venues.length > 0 && router.push(`/menu/${venues[0].slug}`)
                  }
                  className="px-8 py-4 bg-white/60 backdrop-blur-sm text-[#1A1A1A] rounded-full font-semibold text-lg border-2 border-[#1A1A1A]/10 hover:border-[#34C8B6] hover:bg-white transition-all duration-300"
                >
                  Canlı Demo'yu İnceleyin
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto">
                {/* Phone mockup */}
                <div className="relative z-10 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-[#F7F3EB] rounded-[2.5rem] overflow-hidden">
                    <div className="h-[600px] overflow-hidden">
                      <img
                        src="/uploads/qr-menu.jpg"
                        alt="QR Menü Uygulaması"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="w-full h-full bg-gradient-to-br from-[#34C8B6]/20 to-[#D7A449]/20 flex items-center justify-center"><div class="text-center p-8"><div class="w-20 h-20 bg-white/80 rounded-2xl mx-auto mb-4 flex items-center justify-center"><svg class="w-10 h-10 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div><p class="text-sm text-[#1A1A1A]/60">Dijital Menü Önizleme</p></div></div>';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 z-20"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#D7A449] fill-[#D7A449]" />
                    <span className="font-semibold text-[#1A1A1A]">5.0</span>
                  </div>
                  <p className="text-xs text-[#1A1A1A]/60 mt-1">Puan</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-6 -left-6 bg-gradient-to-br from-[#34C8B6] to-[#D7A449] rounded-2xl shadow-xl p-4 z-20"
                >
                  <p className="text-white font-semibold text-lg">1000+</p>
                  <p className="text-white/80 text-xs mt-1">Aktif Menü</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8 bg-white/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-[#1A1A1A] mb-4">
              İhtiyacınız Olan Her Şey
            </h2>
            <p className="text-xl text-[#1A1A1A]/60 max-w-2xl mx-auto">
              Modern restoranlar için tasarlanmış güçlü özellikler
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-[#34C8B6]/10 transition-all duration-300 border border-[#1A1A1A]/5"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-[#1A1A1A]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#1A1A1A]/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => router.push("/features")}
              className="group px-8 py-4 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3"
            >
              Tüm Özellikleri Keşfedin
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-[#1A1A1A] mb-4">
              Blog
            </h2>
            <p className="text-xl text-[#1A1A1A]/60 max-w-2xl mx-auto">
              QRim.net dünyasından en güncel haberler, ipuçları ve trendler
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Blog posts will be loaded here */}
            <BlogPosts />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => router.push("/blog")}
              className="group px-8 py-4 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3"
            >
              Tüm Blog Yazılarını Görüntüle
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <PricingPreviewSection />

      {/* Venues Section - Örnek Menüler */}
      <section id="venues" className="py-24 px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-[#1A1A1A] mb-4">
              Örnek Menüler
            </h2>
            <p className="text-xl text-[#1A1A1A]/60">
              Premium partnerlerimizin canlı menülerini keşfedin
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 text-[#1A1A1A]/60">
                <div className="w-6 h-6 border-3 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
                <span>Mekânlar yükleniyor...</span>
              </div>
            </div>
          ) : venues.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {venues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => router.push(`/menu/${venue.slug}`)}
                    className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#1A1A1A]/5"
                  >
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#34C8B6]/20 to-[#D7A449]/20">
                      {venue.coverImage || venue.logo ? (
                        <img
                          src={venue.coverImage || venue.logo}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-16 h-16 text-[#1A1A1A]/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent"></div>

                      {venue.logo && (
                        <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-2xl shadow-lg overflow-hidden">
                          <img
                            src={venue.logo}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#34C8B6] transition-colors">
                        {venue.name}
                      </h3>

                      {venue.description && (
                        <p className="text-[#1A1A1A]/60 mb-4 line-clamp-2">
                          {venue.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(venue.averageRating || 0)
                                    ? 'text-[#D7A449] fill-[#D7A449]'
                                    : i < Math.ceil(venue.averageRating || 0) && (venue.averageRating || 0) % 1 !== 0
                                    ? 'text-[#D7A449] fill-[#D7A449] opacity-50'
                                    : 'text-gray-300 fill-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {venue.averageRating?.toFixed(1) || '5.0'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({venue.reviewCount || 0} değerlendirme)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1A1A1A]/5">
                        <div className="text-center">
                          <p className="text-xl font-bold text-[#34C8B6]">{venue.totalItems || 0}</p>
                          <p className="text-xs text-gray-500">Ürün</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-[#D7A449]">{venue.totalOrders || 0}</p>
                          <p className="text-xs text-gray-500">Sipariş</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-sm font-medium text-[#34C8B6] group-hover:translate-x-2 transition-transform flex items-center gap-2">
                          Menüyü Görüntüle
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#1A1A1A]/60 text-lg">Henüz örnek menü eklenmemiş</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 lg:px-8 bg-white/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-[#1A1A1A] mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-xl text-[#1A1A1A]/60">
              Binlerce mutlu restoran sahibinin görüşleri
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-[#1A1A1A]/5"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#D7A449] fill-[#D7A449]" />
                ))}
              </div>
              <p className="text-[#1A1A1A]/80 mb-6 leading-relaxed">
                "QR Menü sayesinde menü değişikliklerini anında yapabiliyoruz. Müşterilerimiz artık kendi dillerinde menümüzü görebiliyor. Harika bir çözüm!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6] to-[#D7A449] rounded-full flex items-center justify-center text-white font-bold">
                  AY
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Ayşe Yılmaz</p>
                  <p className="text-sm text-[#1A1A1A]/60">Cafe Latte, İstanbul</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-[#1A1A1A]/5"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#D7A449] fill-[#D7A449]" />
                ))}
              </div>
              <p className="text-[#1A1A1A]/80 mb-6 leading-relaxed">
                "Müşterilerimiz artık kağıt menü beklemiyor. QR kod ile hemen sipariş verebiliyorlar. Hem pratik hem de hijyenik. Kesinlikle tavsiye ederim."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6] to-[#D7A449] rounded-full flex items-center justify-center text-white font-bold">
                  MK
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Mehmet Kaya</p>
                  <p className="text-sm text-[#1A1A1A]/60">Burger House, Ankara</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-[#1A1A1A]/5"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#D7A449] fill-[#D7A449]" />
                ))}
              </div>
              <p className="text-[#1A1A1A]/80 mb-6 leading-relaxed">
                "AI özelliği ile ürün açıklamalarımızı otomatik oluşturuyor. Hem zaman kazanıyoruz hem de profesyonel görünüyoruz. Sistem çok kullanıcı dostu."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6] to-[#D7A449] rounded-full flex items-center justify-center text-white font-bold">
                  ZD
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Zeynep Demir</p>
                  <p className="text-sm text-[#1A1A1A]/60">Moda Cafe, İzmir</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold text-[#1A1A1A] mb-4">
              Bize Ulaşın
            </h2>
            <p className="text-xl text-[#1A1A1A]/60">
              Sorularınız için buradayız
            </p>
          </motion.div>

          <ContactForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-[#F7F3EB] mb-6">
              Dijitale Geçmeye Hazır mısınız?
            </h2>
            <p className="text-xl text-[#F7F3EB]/70 mb-10 max-w-2xl mx-auto">
              Güzel dijital menüler oluşturan yüzlerce restorana katılın
            </p>
            <button
              onClick={() => router.push("/register")}
              className="group px-10 py-5 bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-[#1A1A1A] rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-[#34C8B6]/30 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              Ücretsiz Hesap Oluşturun
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-[#F7F3EB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo-qrim.png" 
                  alt="Logo" 
                  className="h-12 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-[#F7F3EB]/60 mb-6 max-w-sm">
                Modern restoranlar için en iyi dijital menü çözümü. QRim.net ile müşteri deneyimini yükseltin, operasyonları basitleştirin.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/qrim.net"
                  title="QRim.net Instagram Sayfası"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F7F3EB]/10 hover:bg-[#34C8B6] rounded-xl flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/qrim.net"
                  title="QRim.net Facebook Sayfası"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F7F3EB]/10 hover:bg-[#34C8B6] rounded-xl flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/qrim"
                  title="QRim.net Twitter Sayfası"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F7F3EB]/10 hover:bg-[#34C8B6] rounded-xl flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Ürün</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      title={`QRim.net ${link.name}`}
                      className="text-[#F7F3EB]/60 hover:text-[#34C8B6] transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Şirket</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      title={`QRim.net ${link.name}`}
                      className="text-[#F7F3EB]/60 hover:text-[#34C8B6] transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Destek</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      title={`QRim.net ${link.name}`}
                      className="text-[#F7F3EB]/60 hover:text-[#34C8B6] transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Yasal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      title={`QRim.net ${link.name}`}
                      className="text-[#F7F3EB]/60 hover:text-[#34C8B6] transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-[#F7F3EB]/10 pt-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#34C8B6]/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#34C8B6]" />
                </div>
                <div>
                  <p className="text-sm text-[#F7F3EB]/60">E-posta</p>
                  <a
                    href="mailto:destek@qrim.net"
                    title="QRim.net Destek E-posta"
                    className="font-medium hover:text-[#34C8B6] transition-colors text-base"
                  >
                    destek@qrim.net
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D7A449]/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#D7A449]" />
                </div>
                <div>
                  <p className="text-sm text-[#F7F3EB]/60">Telefon</p>
                  <a
                    href="tel:+905001234567"
                    title="QRim.net Destek Telefon"
                    className="font-medium hover:text-[#34C8B6] transition-colors text-base"
                  >
                    +90 (500) 123 45 67
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-[#F7F3EB]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#F7F3EB]/60 text-sm">
              © 2024 QRim.net. Tüm hakları saklıdır.
            </p>
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-2 text-[#F7F3EB]/40 text-xs">
                <span>Crafted with</span>
                <svg
                  className="w-4 h-4 text-[#34C8B6]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>in Turkey</span>
              </div>
              <p className="text-[#F7F3EB]/30 text-[10px] italic font-light">
                clean code, clean mind
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}