
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F3EB]/80 backdrop-blur-xl border-b border-[#1A1A1A]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#34C8B6] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-[#1A1A1A] mb-8">
            Gizlilik Politikası
          </h1>
          
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
            <section>
              <p className="text-[#1A1A1A]/60 mb-6">
                Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                QRIM olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu Gizlilik Politikası, 
                hizmetlerimizi kullanırken toplanan, kullanılan ve paylaşılan kişisel verilerin nasıl 
                işlendiğini açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                1. Toplanan Bilgiler
              </h2>
              <div className="space-y-4 text-[#1A1A1A]/80">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">1.1. Kişisel Bilgiler</h3>
                  <p className="leading-relaxed">
                    Hizmetlerimize kayıt olurken toplanan bilgiler:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Ad ve soyad</li>
                    <li>E-posta adresi</li>
                    <li>Telefon numarası</li>
                    <li>İşletme bilgileri</li>
                    <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">1.2. Kullanım Verileri</h3>
                  <p className="leading-relaxed">
                    Hizmetlerimizi kullanırken otomatik olarak toplanan bilgiler:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>IP adresi</li>
                    <li>Tarayıcı türü ve sürümü</li>
                    <li>Ziyaret edilen sayfalar</li>
                    <li>Ziyaret tarihi ve saati</li>
                    <li>Cihaz bilgileri</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                2. Bilgilerin Kullanımı
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Hizmetlerimizi sağlamak ve yönetmek</li>
                  <li>Kullanıcı hesaplarını oluşturmak ve yönetmek</li>
                  <li>Müşteri desteği sağlamak</li>
                  <li>Hizmetlerimizi geliştirmek ve özelleştirmek</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                  <li>Yasal yükümlülükleri yerine getirmek</li>
                  <li>Pazarlama ve tanıtım faaliyetleri (onayınız dahilinde)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                3. Bilgilerin Paylaşımı
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <p className="leading-relaxed">
                  Kişisel bilgilerinizi üçüncü taraflarla paylaşmayız, satmayız veya kiralamayız. 
                  Ancak aşağıdaki durumlarda bilgi paylaşımı yapabiliriz:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Hizmet sağlayıcılar (hosting, ödeme işleme, analitik)</li>
                  <li>Yasal zorunluluklar</li>
                  <li>İşletme devri durumunda</li>
                  <li>Açık onayınız ile</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                4. Veri Güvenliği
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-[#1A1A1A]/80">
                <li>SSL/TLS şifreleme</li>
                <li>Güvenli veri depolama</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Erişim kontrolü ve yetkilendirme</li>
                <li>Veri yedekleme sistemleri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                5. Çerezler
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. 
                Çerezlerin nasıl kullanıldığı hakkında detaylı bilgi için 
                <a href="/cookies" className="text-[#34C8B6] hover:underline mx-1">
                  Çerez Politikamızı
                </a>
                inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                6. Kullanıcı Hakları
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenmişse bilgi talep etme</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                  <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                  <li>Silinmesini veya yok edilmesini isteme</li>
                  <li>İtiraz etme</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                7. Veri Saklama
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Kişisel verilerinizi, yasal yükümlülüklerimizi yerine getirmek ve meşru iş 
                amaçlarımız için gerekli olan süre boyunca saklarız. Hesabınızı kapattığınızda, 
                verileriniz 30 gün içinde silinir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                8. Çocukların Gizliliği
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Hizmetlerimiz 18 yaş altındaki kişilere yönelik değildir. Bilerek 18 yaş altındaki 
                kişilerden kişisel bilgi toplamıyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                9. Politika Değişiklikleri
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler 
                olması durumunda, e-posta yoluyla veya web sitemiz üzerinden bildirimde bulunacağız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                10. İletişim
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">
                  Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                </p>
                <ul className="space-y-1">
                  <li><strong>E-posta:</strong> destek@qrmenu.com</li>
                  <li><strong>Telefon:</strong> +90 (500) 123 45 67</li>
                  <li><strong>Adres:</strong> İstanbul, Türkiye</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
