
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Building2,
  ArrowRight,
  ChevronDown,
  ArrowLeft,
  TrendingUp,
  Clock,
  Shield,
  Smartphone,
  BarChart3,
  Users,
  Palette,
  Globe,
} from "lucide-react";

export default function Pricing() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/membership-plans')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched plans:', data);
        setDbPlans(data.plans || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching plans:', err);
        setDbPlans([]);
        setLoading(false);
      })
  }, [])

  const getIconForPlan = (planType: string) => {
    const icons: Record<string, any> = {
      'free': Sparkles,
      'basic': Zap,
      'premium': Building2
    }
    return icons[planType.toLowerCase()] || Sparkles
  }

  const getDescriptionForPlan = (planType: string) => {
    const descriptions: Record<string, string> = {
      'free': 'Deneme ve küçük işletmeler için',
      'basic': 'Küçük ve orta ölçekli işletmeler için',
      'premium': 'Büyüyen işletmeler için tam özellikli paket'
    }
    return descriptions[planType.toLowerCase()] || ''
  }

  const getSubtitleForPlan = (planType: string) => {
    const subtitles: Record<string, string> = {
      'free': 'Ücretsiz',
      'basic': 'Başlangıç',
      'premium': 'En Popüler'
    }
    return subtitles[planType.toLowerCase()] || ''
  }

  const plans = dbPlans
    .filter(dbPlan => {
      if (!dbPlan) return false;
      const planType = dbPlan.planType || dbPlan.plan_type;
      return planType && String(planType).trim() !== '' && String(planType).toLowerCase() !== 'null';
    })
    .map(dbPlan => {
      const planType = String(dbPlan.planType || dbPlan.plan_type || 'free').toLowerCase().trim();
      const monthlyPrice = parseFloat(String(dbPlan.monthlyPrice || dbPlan.monthly_price || 0));
      const yearlyPrice = parseFloat(String(dbPlan.yearlyPrice || dbPlan.yearly_price || 0));
      
      let features = [];
      if (Array.isArray(dbPlan.features) && dbPlan.features.length > 0) {
        features = dbPlan.features.map((f: string) => ({ text: f, included: true }));
      } else {
        // Fallback özellikler
        const defaultFeatures: Record<string, string[]> = {
          'free': ['1 Mekan', 'Temel QR Menü', 'Community Destek'],
          'basic': ['3 Mekan', 'Gelişmiş Analitik', 'Email Destek', 'Özelleştirilebilir Tema'],
          'premium': ['Sınırsız Mekan', 'Öncelikli Destek', 'Tüm Özellikler', 'API Erişimi', 'Özel Tasarım']
        };
        features = (defaultFeatures[planType] || defaultFeatures['free']).map(f => ({ text: f, included: true }));
      }
      
      return {
        name: planType.charAt(0).toUpperCase() + planType.slice(1),
        subtitle: getSubtitleForPlan(planType),
        description: getDescriptionForPlan(planType),
        monthlyPrice,
        yearlyPrice,
        icon: getIconForPlan(planType),
        popular: planType === 'premium',
        features,
        cta: planType === 'free' ? 'Ücretsiz Başla' : `${planType.charAt(0).toUpperCase() + planType.slice(1)}'e Geç`,
        ctaStyle: planType === 'premium' ? 'primary' : 'secondary'
      };
    });

  const faqs = [
    {
      question: "Ücretsiz deneme süresi var mı?",
      answer: "Evet! Free plan tamamen ücretsiz olarak kullanılabilir. Premium özelliklerini denemek isterseniz 14 gün ücretsiz deneme hakkınız var.",
    },
    {
      question: "İstediğim zaman planımı değiştirebilir miyim?",
      answer: "Tabii ki! Dilediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Ödeme farkı otomatik hesaplanır.",
    },
    {
      question: "Ödeme güvenli mi?",
      answer: "Tüm ödemeler SSL sertifikası ile şifrelenmiş ve PCI DSS standartlarına uygun güvenli ödeme altyapısı kullanılarak işlenir.",
    },
    {
      question: "İptal etmek istersem ne olur?",
      answer: "Hiçbir bağlayıcılık yok. İstediğiniz zaman iptal edebilirsiniz. Ödeme döneminin sonuna kadar hizmetiniz aktif kalır.",
    },
  ];

  const benefits = [
    {
      icon: Smartphone,
      title: "Mobil Uyumlu",
      description: "Tüm cihazlarda mükemmel görüntüleme deneyimi"
    },
    {
      icon: TrendingUp,
      title: "Satışları Artırın",
      description: "Gelişmiş analitik ile işletmenizi büyütün"
    },
    {
      icon: Clock,
      title: "Hızlı Kurulum",
      description: "5 dakikada menünüzü yayına alın"
    },
    {
      icon: Shield,
      title: "Güvenli Altyapı",
      description: "Verileriniz SSL ile korunur"
    },
    {
      icon: BarChart3,
      title: "Detaylı Raporlar",
      description: "Gerçek zamanlı istatistikler ve raporlar"
    },
    {
      icon: Users,
      title: "7/24 Destek",
      description: "Her zaman yanınızdayız"
    },
    {
      icon: Palette,
      title: "Özelleştirilebilir",
      description: "Markanıza özel tasarım seçenekleri"
    },
    {
      icon: Globe,
      title: "Çoklu Dil",
      description: "Menünüzü birden fazla dilde sunun"
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Planlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Üyelik planları bulunamadı.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/70 via-[#1A1A1A]/60 to-[#1A1A1A]/90"></div>
        </div>

        {/* Navigation */}
        <div className="absolute top-6 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all text-[#1A1A1A] font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Anasayfa
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="hidden sm:block"
                >
                  <img 
                    src="/logo-qrim.png" 
                    alt="Logo" 
                    className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/login")}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-medium transition-all"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                >
                  Kayıt Ol
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#34C8B6]" />
                <span className="text-sm font-medium text-white">
                  Şu an 3.200+ işletme kullanıyor
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                İşletmenize En Uygun
                <span className="block bg-gradient-to-r from-[#D7A449] to-[#34C8B6] bg-clip-text text-transparent">
                  Planı Seçin
                </span>
              </h1>

              <p className="text-xl text-white/95 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                Küçük kafeden büyük zincire, her işletme için uygun çözümler.
                Şeffaf fiyatlandırma, gizli maliyet yok.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-2 border border-white/20">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-white text-[#1A1A1A]"
                      : "text-white/80"
                  }`}
                >
                  Aylık
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all relative ${
                    billingPeriod === "yearly"
                      ? "bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-[#1A1A1A]"
                      : "text-white/80"
                  }`}
                >
                  Yıllık
                  <span className="absolute -top-2 -right-2 bg-[#34C8B6] text-white text-xs px-2 py-0.5 rounded-full">
                    %20 İndirim
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="py-24 px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${
                  plan.popular
                    ? "md:scale-105 border-[#34C8B6] shadow-2xl shadow-[#34C8B6]/20"
                    : "border-[#1A1A1A]/10 hover:border-[#34C8B6]/50 hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-white px-6 py-2 rounded-full text-sm font-bold">
                    {plan.subtitle}
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    plan.popular
                      ? "bg-gradient-to-br from-[#34C8B6]/20 to-[#D7A449]/20"
                      : "bg-[#1A1A1A]/5"
                  }`}>
                    <plan.icon className={`w-7 h-7 ${plan.popular ? "text-[#34C8B6]" : "text-[#1A1A1A]"}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                    {plan.name}
                  </h3>
                  {!plan.popular && (
                    <p className="text-sm text-[#1A1A1A]/60 mb-4">{plan.subtitle}</p>
                  )}
                  <p className="text-sm text-[#1A1A1A]/60 mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    {plan.monthlyPrice > 0 ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-[#1A1A1A]">
                            {billingPeriod === "monthly"
                              ? plan.monthlyPrice.toLocaleString('tr-TR')
                              : plan.yearlyPrice.toLocaleString('tr-TR')}
                          </span>
                          <span className="text-[#1A1A1A]/60">₺{billingPeriod === "yearly" ? "/yıl" : "/ay"}</span>
                        </div>
                        {billingPeriod === "yearly" && (
                          <p className="text-sm text-[#34C8B6] mt-2 font-medium">
                            Aylık {(plan.yearlyPrice / 12).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺
                          </p>
                        )}
                        {billingPeriod === "monthly" && plan.yearlyPrice > 0 && (
                          <p className="text-sm text-[#1A1A1A]/60 mt-2">
                            Yıllık öde, {Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100)}% tasarruf et
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-5xl font-bold text-[#1A1A1A]">
                        Ücretsiz
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                    if (token && plan.name !== 'Free') {
                      router.push(`/register?plan=${plan.name.toLowerCase()}&upgrade=true`)
                    } else {
                      router.push(`/register?plan=${plan.name.toLowerCase()}`)
                    }
                  }}
                  className={`w-full py-3.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.ctaStyle === "primary"
                      ? "bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-[#1A1A1A] hover:shadow-xl hover:shadow-[#34C8B6]/30"
                      : "bg-[#1A1A1A]/5 text-[#1A1A1A] hover:bg-[#1A1A1A]/10"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-[#34C8B6] flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-[#1A1A1A]/20 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4">
              Neden QR Menü?
            </h2>
            <p className="text-xl text-[#1A1A1A]/60 max-w-2xl mx-auto">
              Modern işletmeniz için ihtiyacınız olan her şey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-[#1A1A1A]/10 hover:border-[#34C8B6]/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-[#34C8B6]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#1A1A1A]/60">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-6 lg:px-8 bg-white/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#34C8B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-bold text-[#1A1A1A] mb-2">Güvenli Ödeme</h4>
              <p className="text-sm text-[#1A1A1A]/60">SSL şifreli ödeme altyapısı</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#34C8B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-[#1A1A1A] mb-2">7/24 Destek</h4>
              <p className="text-sm text-[#1A1A1A]/60">Her zaman yanınızdayız</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#34C8B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <h4 className="font-bold text-[#1A1A1A] mb-2">Kolay İptal</h4>
              <p className="text-sm text-[#1A1A1A]/60">İstediğiniz zaman iptal edin</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-lg text-[#1A1A1A]/60">
              Aklınıza takılan her şey burada
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-[#1A1A1A]/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#F7F3EB]/50 transition-colors"
                >
                  <span className="font-semibold text-[#1A1A1A] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1A1A1A]/60 flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-[#1A1A1A]/70">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
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
            <h2 className="text-5xl font-bold text-[#F7F3EB] mb-6">
              Hemen Başlayın
            </h2>
            <p className="text-xl text-[#F7F3EB]/70 mb-10">
              Dakikalar içinde modern menünüzü oluşturun
            </p>
            <button
              onClick={() => router.push("/register")}
              className="px-10 py-5 bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-[#1A1A1A] rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-[#34C8B6]/30 transition-all duration-300 inline-flex items-center gap-3"
            >
              Ücretsiz Deneyin
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
