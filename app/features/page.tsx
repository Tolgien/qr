
"use client";

import { ArrowLeft, ArrowRight, Sparkles, Brain, Scale, Leaf, Thermometer, Globe2, BarChart3, Shield, Zap, Users, Clock, Heart, Award, TrendingUp, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  const router = useRouter();

  const detailedFeatures = [
    {
      icon: Brain,
      title: "Yapay Zeka Destekli Menü Asistanı",
      description: "Ürünleriniz için otomatik açıklama, içerik zenginleştirme ve çeviri",
      details: [
        "Ürün açıklamalarını AI ile zenginleştirin",
        "Otomatik çoklu dil çevirisi (30+ dil)",
        "Menşei, malzeme ve hazırlık bilgilerini otomatik oluşturun",
        "Görsel tanıma ile ürün bilgilerini çıkarın",
        "Müşteri tercihlerine göre öneri sistemi"
      ],
      advantage: "Diğer QR menü sistemlerinde manuel olarak yapmanız gereken açıklamaları AI saniyeler içinde oluşturur."
    },
    {
      icon: Scale,
      title: "Detaylı Besin Değerleri ve Kalori Hesaplama",
      description: "Her ürün için kapsamlı beslenme bilgileri",
      details: [
        "Kalori, protein, karbonhidrat, yağ hesaplaması",
        "Lif, şeker, sodyum değerleri",
        "Porsiyon bazlı besin değerleri",
        "Diyet türüne göre filtreleme (vegan, vejetaryen, glutensiz)",
        "Alerjen uyarı sistemi",
        "Günlük alım yüzdesi hesaplaması"
      ],
      advantage: "Müşterileriniz sağlıklı seçimler yapabilir, alerjenleri takip edebilir. Premium sistemlerde bile nadiren bulunan bir özellik."
    },
    {
      icon: Leaf,
      title: "Menşei ve Sürdürülebilirlik Bilgisi",
      description: "Ürünlerinizin kökenini ve sürdürülebilirlik özelliklerini gösterin",
      details: [
        "Ürün menşei bilgisi (yerel, organik, ithal)",
        "Çiftlik ve tedarikçi bilgileri",
        "Sürdürülebilirlik sertifikaları",
        "Karbon ayak izi göstergesi",
        "Fair trade ve organik etiketleme",
        "Sezonluk ürün vurgulama"
      ],
      advantage: "Müşteriler bilinçli tüketim yapar, işletmeniz sürdürülebilirlik değerlerini yansıtır."
    },
    {
      icon: Thermometer,
      title: "Saklama Koşulları ve Güvenlik Bilgileri",
      description: "Ürün güvenliği ve saklama talimatları",
      details: [
        "Saklama sıcaklığı bilgisi",
        "Raf ömrü ve son kullanma tarihi",
        "Hazırlık ve servis talimatları",
        "Gıda güvenliği uyarıları",
        "Paketleme ve taşıma bilgileri",
        "HACCP uyumluluk göstergeleri"
      ],
      advantage: "Gıda güvenliği standartlarına tam uyum, müşteri güveni artar."
    },
    {
      icon: BarChart3,
      title: "Gelişmiş Analitik ve Raporlama",
      description: "İşletmenizi veriye dayalı yönetin",
      details: [
        "En çok satılan ürünler analizi",
        "Müşteri davranış analizi",
        "Sipariş trendleri ve tahminleme",
        "Peak hours analizi",
        "Kategori performans raporları",
        "Gelir ve karlılık analizi",
        "A/B test özellikleri"
      ],
      advantage: "Rakiplerinizin göremediği trendleri görün, veri odaklı kararlar alın."
    },
    {
      icon: Globe2,
      title: "30+ Dil Desteği ve Yerelleştirme",
      description: "Yabancı misafirlerinize anadillerinde hizmet verin",
      details: [
        "Otomatik dil algılama",
        "30+ dilde menü görüntüleme",
        "Kültürel adaptasyon (para birimi, format)",
        "Bölgesel tercih önerileri",
        "Çoklu menü versiyonları",
        "Görsel ve metin çevirisi"
      ],
      advantage: "Turistik bölgelerde rekabet avantajı, müşteri memnuniyeti artar."
    },
    {
      icon: Shield,
      title: "Güvenlik ve KVKK Uyumluluğu",
      description: "Maksimum veri güvenliği ve yasal uyumluluk",
      details: [
        "SSL/TLS şifreleme",
        "KVKK tam uyumluluk",
        "PCI DSS sertifikalı ödeme",
        "2FA (İki faktörlü kimlik doğrulama)",
        "Düzenli güvenlik denetimleri",
        "GDPR uyumlu veri işleme",
        "Veri yedekleme ve kurtarma"
      ],
      advantage: "Yasal sorumluluklar minimize edilir, müşteri güveni maksimize olur."
    },
    {
      icon: Zap,
      title: "Hızlı Performans ve Sıfır Gecikme",
      description: "Anında yüklenen, akıcı menü deneyimi",
      details: [
        "CDN destekli hızlı görsel yükleme",
        "Progressive Web App teknolojisi",
        "Offline çalışma özelliği",
        "Optimize edilmiş kod yapısı",
        "Lazy loading ile kaynak tasarrufu",
        "99.9% uptime garantisi"
      ],
      advantage: "Müşteriler beklemez, sipariş süreci kesintisiz. Diğer sistemlerdeki yavaşlık problemi yok."
    },
    {
      icon: Users,
      title: "Müşteri Etkileşimi ve Sadakat",
      description: "Müşteri bağlılığını artıran özellikler",
      details: [
        "Yorum ve değerlendirme sistemi",
        "Favori ürünler listesi",
        "Sipariş geçmişi",
        "Puanlama sistemi",
        "Özel günler için hatırlatıcılar",
        "Sadakat programı entegrasyonu",
        "Push notification desteği"
      ],
      advantage: "Müşteri tutma oranı artar, tekrar sipariş %40 daha fazla."
    },
    {
      icon: Clock,
      title: "Gerçek Zamanlı Stok ve Fiyat Yönetimi",
      description: "Anlık güncellemeler, tüm masalarda senkronize",
      details: [
        "Stok takibi ve uyarıları",
        "Dynamic pricing (zaman bazlı fiyat)",
        "Happy hour otomasyonu",
        "Tükenen ürünleri otomatik gizleme",
        "Fiyat geçmişi ve trend analizi",
        "Bulk update özellikleri"
      ],
      advantage: "Manuel güncelleme yok, operasyonel hata %90 azalır."
    },
    {
      icon: Heart,
      title: "Özel Diyet ve Sağlık Filtreleri",
      description: "Her müşteriye özel menü deneyimi",
      details: [
        "Vegan/Vejetaryen filtreleme",
        "Glutensiz/Laktoz içermez işaretleme",
        "Düşük kalorili seçenekler",
        "Diyabetik dostu ürünler",
        "Çocuk menüsü ayrımı",
        "Spor beslenme menüleri"
      ],
      advantage: "Özel beslenme ihtiyacı olan müşteriler kolay seçim yapar, satışlar artar."
    },
    {
      icon: Award,
      title: "Ödüller ve Sertifikalar Gösterimi",
      description: "Prestijinizi dijital ortamda sergileyin",
      details: [
        "Michelin yıldızı gösterimi",
        "Hijyen sertifikaları",
        "Organik sertifikalar",
        "Yerel üretici rozetleri",
        "Ödül ve başarı gösterimi",
        "Şef ve ekip bilgileri"
      ],
      advantage: "Marka değeri yükselir, premium pozisyonlama güçlenir."
    },
    {
      icon: TrendingUp,
      title: "AI Destekli Satış Optimizasyonu",
      description: "Yapay zeka ile kârlılığınızı artırın",
      details: [
        "Otomatik upsell önerileri",
        "Combo menü oluşturma",
        "Stokta fazla olan ürün kampanyaları",
        "Müşteri segmentasyonu",
        "Dinamik promosyon optimizasyonu",
        "Fiyat elastikiyeti analizi"
      ],
      advantage: "Ortalama sipariş tutarı %25 artar, stok verimliliği maksimize olur."
    }
  ];

  const comparisonFeatures = [
    { feature: "Detaylı Besin Değerleri", us: true, others: false },
    { feature: "AI İçerik Zenginleştirme", us: true, others: false },
    { feature: "30+ Dil Desteği", us: true, others: "Sınırlı" },
    { feature: "Menşei ve Sürdürülebilirlik", us: true, others: false },
    { feature: "Saklama Koşulları", us: true, others: false },
    { feature: "Gelişmiş Analitik", us: true, others: "Temel" },
    { feature: "Offline Çalışma", us: true, others: false },
    { feature: "KVKK Uyumluluğu", us: true, others: "Kısmi" },
    { feature: "QR Kod", us: true, others: true },
    { feature: "Temel Menü", us: true, others: true }
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      {/* Hero Section with Background Image */}
      <div className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop)',
          }}
        >
          {/* Gradient Overlay */}
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
              <button
                onClick={() => router.push("/register")}
                className="px-6 py-2.5 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
              >
                Ücretsiz Başla
              </button>
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
                  Premium Özellikler
                </span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                Rakiplerinizi
                <span className="block bg-gradient-to-r from-[#D7A449] to-[#34C8B6] bg-clip-text text-transparent">
                  Geride Bırakın
                </span>
              </h1>

              <p className="text-xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Diğer QR menü sistemlerinin sunamadığı gelişmiş özellikleri keşfedin. 
                AI destekli, detaylı besin değerleri, sürdürülebilirlik bilgileri ve daha fazlası.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Detailed Features */}
      <section className="py-20 px-6 lg:px-8 bg-white/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12">
            {detailedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-[#1A1A1A]/5 hover:shadow-2xl transition-all duration-300"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-[#34C8B6] to-[#D7A449] rounded-2xl flex items-center justify-center mb-6">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                      {feature.title}
                    </h2>
                    <p className="text-lg text-[#1A1A1A]/70 mb-6">
                      {feature.description}
                    </p>
                    <div className="bg-gradient-to-r from-[#34C8B6]/10 to-[#D7A449]/10 border-l-4 border-[#34C8B6] rounded-lg p-4">
                      <p className="text-sm font-semibold text-[#1A1A1A]/80">
                        <span className="text-[#34C8B6]">Rekabet Avantajı:</span> {feature.advantage}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#F7F3EB] rounded-2xl p-6">
                    <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#34C8B6]" />
                      Özellikler
                    </h3>
                    <ul className="space-y-3">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[#1A1A1A]/80">
                          <span className="w-1.5 h-1.5 bg-[#34C8B6] rounded-full mt-2 flex-shrink-0"></span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              Neden Biz Farklıyız?
            </h2>
            <p className="text-xl text-[#1A1A1A]/60">
              Diğer QR menü sistemleriyle karşılaştırma
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1A1A1A]/10">
                    <th className="text-left p-6 text-[#1A1A1A] font-semibold">Özellik</th>
                    <th className="text-center p-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#34C8B6] to-[#D7A449] text-white rounded-full font-semibold">
                        QR Menü
                      </div>
                    </th>
                    <th className="text-center p-6 text-[#1A1A1A]/60 font-semibold">Diğer Sistemler</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index} className="border-b border-[#1A1A1A]/5 hover:bg-[#F7F3EB]/50 transition-colors">
                      <td className="p-6 text-[#1A1A1A]">{item.feature}</td>
                      <td className="p-6 text-center">
                        {item.us === true ? (
                          <CheckCircle2 className="w-6 h-6 text-[#34C8B6] mx-auto" />
                        ) : (
                          <span className="text-[#1A1A1A]/60">{item.us}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {item.others === true ? (
                          <CheckCircle2 className="w-6 h-6 text-gray-400 mx-auto" />
                        ) : item.others === false ? (
                          <span className="text-2xl text-red-400">✕</span>
                        ) : (
                          <span className="text-[#1A1A1A]/40 text-sm">{item.others}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-[#F7F3EB] mb-6">
              Farkı Deneyimleyin
            </h2>
            <p className="text-xl text-[#F7F3EB]/70 mb-10 max-w-2xl mx-auto">
              Premium özelliklerle donatılmış QR menü sistemi ile işletmenizi bir üst seviyeye taşıyın
            </p>
            <button
              onClick={() => router.push("/register")}
              className="group px-10 py-5 bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-[#1A1A1A] rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-[#34C8B6]/30 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              14 Gün Ücretsiz Deneyin
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
