
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CookiesPage() {
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
              Ana Sayfa
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-[#1A1A1A] mb-8">
            Çerez Politikası
          </h1>
          
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
            <section>
              <p className="text-[#1A1A1A]/60 mb-6">
                Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Bu Çerez Politikası, QR Menü web sitesinde kullanılan çerezler ve benzer 
                teknolojiler hakkında bilgi vermektedir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                1. Çerez Nedir?
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla 
                cihazınıza (bilgisayar, tablet, telefon) kaydedilen küçük metin dosyalarıdır. 
                Çerezler, web sitesinin düzgün çalışmasını sağlamak ve kullanıcı deneyimini 
                iyileştirmek için kullanılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                2. Çerez Türleri
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">2.1. Zorunlu Çerezler</h3>
                  <p className="text-[#1A1A1A]/80 leading-relaxed">
                    Web sitesinin temel işlevlerini yerine getirmesi için gereklidir. Bu çerezler 
                    olmadan site düzgün çalışmaz.
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-[#1A1A1A]/80">
                    <li>Oturum yönetimi</li>
                    <li>Güvenlik doğrulaması</li>
                    <li>Alışveriş sepeti işlevselliği</li>
                    <li>Dil tercihleri</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">2.2. İşlevsel Çerezler</h3>
                  <p className="text-[#1A1A1A]/80 leading-relaxed">
                    Kullanıcı tercihlerinizi hatırlayarak kişiselleştirilmiş bir deneyim sunar.
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-[#1A1A1A]/80">
                    <li>Tema tercihleri (açık/koyu mod)</li>
                    <li>Bölge ve dil seçimleri</li>
                    <li>Görüntüleme tercihleri</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">2.3. Analitik Çerezler</h3>
                  <p className="text-[#1A1A1A]/80 leading-relaxed">
                    Web sitesi kullanımını analiz ederek hizmetimizi geliştirmemize yardımcı olur.
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-[#1A1A1A]/80">
                    <li>Ziyaretçi sayısı ve davranışları</li>
                    <li>Sayfa görüntüleme istatistikleri</li>
                    <li>Kullanıcı yolculuğu analizi</li>
                    <li>Hata raporlama</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">2.4. Pazarlama Çerezleri</h3>
                  <p className="text-[#1A1A1A]/80 leading-relaxed">
                    Size özel reklamlar göstermek ve pazarlama kampanyalarının etkinliğini ölçmek için kullanılır.
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-[#1A1A1A]/80">
                    <li>Reklam hedefleme</li>
                    <li>Sosyal medya entegrasyonu</li>
                    <li>Kampanya performansı</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                3. Kullandığımız Çerezler
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F7F3EB]">
                      <th className="border border-[#1A1A1A]/10 p-3 text-left">Çerez Adı</th>
                      <th className="border border-[#1A1A1A]/10 p-3 text-left">Tür</th>
                      <th className="border border-[#1A1A1A]/10 p-3 text-left">Süre</th>
                      <th className="border border-[#1A1A1A]/10 p-3 text-left">Amaç</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#1A1A1A]/80">
                    <tr>
                      <td className="border border-[#1A1A1A]/10 p-3">session_id</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Zorunlu</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Oturum</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Kullanıcı oturumu yönetimi</td>
                    </tr>
                    <tr>
                      <td className="border border-[#1A1A1A]/10 p-3">auth_token</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Zorunlu</td>
                      <td className="border border-[#1A1A1A]/10 p-3">7 gün</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Kimlik doğrulama</td>
                    </tr>
                    <tr>
                      <td className="border border-[#1A1A1A]/10 p-3">lang_pref</td>
                      <td className="border border-[#1A1A1A]/10 p-3">İşlevsel</td>
                      <td className="border border-[#1A1A1A]/10 p-3">1 yıl</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Dil tercihi</td>
                    </tr>
                    <tr>
                      <td className="border border-[#1A1A1A]/10 p-3">_ga</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Analitik</td>
                      <td className="border border-[#1A1A1A]/10 p-3">2 yıl</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Google Analytics - Ziyaretçi tanımlama</td>
                    </tr>
                    <tr>
                      <td className="border border-[#1A1A1A]/10 p-3">_gid</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Analitik</td>
                      <td className="border border-[#1A1A1A]/10 p-3">24 saat</td>
                      <td className="border border-[#1A1A1A]/10 p-3">Google Analytics - Kullanıcı aktivitesi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                4. Üçüncü Taraf Çerezleri
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-3">
                Bazı çerezler üçüncü taraf hizmet sağlayıcılar tarafından yerleştirilir:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-[#1A1A1A]/80">
                <li>
                  <strong>Google Analytics:</strong> Web sitesi kullanım istatistikleri için
                </li>
                <li>
                  <strong>Ödeme Sağlayıcıları:</strong> Güvenli ödeme işlemleri için
                </li>
                <li>
                  <strong>Sosyal Medya:</strong> İçerik paylaşımı ve sosyal medya entegrasyonu için
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                5. Çerez Yönetimi
              </h2>
              <div className="space-y-3 text-[#1A1A1A]/80">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">5.1. Tarayıcı Ayarları</h3>
                  <p className="leading-relaxed">
                    Çoğu tarayıcı çerezleri otomatik olarak kabul eder, ancak tarayıcı ayarlarınızdan 
                    çerezleri reddedebilir veya silebilirsiniz. Ancak bu durumda web sitesinin bazı 
                    özellikleri çalışmayabilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">5.2. Çerez Tercihleri</h3>
                  <p className="leading-relaxed">
                    Web sitemizi ilk ziyaretinizde çıkan çerez onay panelinden tercihlerinizi 
                    seçebilirsiniz. Tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">5.3. Tarayıcı Bazlı Yönetim</h3>
                  <p className="leading-relaxed mb-2">Çerezleri yönetmek için tarayıcınıza özel linkler:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" className="text-[#34C8B6] hover:underline">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/tr/kb/cerezleri-silme" target="_blank" className="text-[#34C8B6] hover:underline">Mozilla Firefox</a></li>
                    <li><a href="https://support.apple.com/tr-tr/guide/safari/sfri11471/mac" target="_blank" className="text-[#34C8B6] hover:underline">Safari</a></li>
                    <li><a href="https://support.microsoft.com/tr-tr/microsoft-edge" target="_blank" className="text-[#34C8B6] hover:underline">Microsoft Edge</a></li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                6. Do Not Track (DNT)
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Tarayıcınızın "Do Not Track" özelliğini destekliyoruz. Bu özelliği etkinleştirdiğinizde, 
                izleme çerezlerini kullanmayız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                7. Mobil Cihazlar
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Mobil cihazlarda çerez yönetimi cihaz ve tarayıcı ayarlarınızdan yapılabilir. 
                Ayrıca mobil reklam kimliklerini (IDFA/AAID) de ilgili cihaz ayarlarından 
                sıfırlayabilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                8. Çerez Politikası Güncellemeleri
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Bu Çerez Politikasını zaman zaman güncelleyebiliriz. Güncellemeler bu sayfada 
                yayınlanacak ve üst kısımda güncelleme tarihi belirtilecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                9. İletişim
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">
                  Çerez politikamız hakkında sorularınız için:
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
