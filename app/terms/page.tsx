"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
            Kullanım Koşulları
          </h1>

          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
            <section>
              <p className="text-[#1A1A1A]/60 mb-6">
                Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                QR Menü hizmetlerini kullanarak, aşağıdaki kullanım koşullarını kabul etmiş olursunuz. 
                Lütfen bu koşulları dikkatlice okuyun.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                1. Hizmet Tanımı
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                QR Menü, restoranlar, kafeler ve diğer yiyecek-içecek işletmeleri için dijital 
                menü oluşturma ve yönetme platformudur. Hizmetimiz, QR kod tabanlı menü sistemleri, 
                sipariş yönetimi ve analitik araçlar sunar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                2. Hesap Oluşturma ve Güvenlik
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">2.1. Hesap Bilgileri</h3>
                  <p className="leading-relaxed">
                    Hizmetlerimizi kullanmak için bir hesap oluşturmanız gerekmektedir. 
                    Kayıt sırasında doğru, güncel ve eksiksiz bilgiler vermeniz zorunludur.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">2.2. Hesap Güvenliği</h3>
                  <p className="leading-relaxed">
                    Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Şifrenizi başkalarıyla 
                    paylaşmamalı ve şüpheli aktivite fark ettiğinizde derhal bize bildirmelisiniz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">2.3. Yaş Sınırı</h3>
                  <p className="leading-relaxed">
                    Hizmetlerimizi kullanmak için en az 18 yaşında olmalısınız veya yasal 
                    velinin onayına sahip olmalısınız.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                3. Abonelik ve Ödeme
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">3.1. Planlar</h3>
                  <p className="leading-relaxed">
                    Ücretsiz, Basic ve Premium olmak üzere farklı abonelik planları sunuyoruz. 
                    Her planın özellikleri fiyatlandırma sayfasında detaylı olarak açıklanmıştır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">3.2. Ödeme Koşulları</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ödemeler aylık veya yıllık olarak yapılabilir</li>
                    <li>Yıllık ödemelerde %15 indirim uygulanır</li>
                    <li>Tüm fiyatlar KDV dahildir</li>
                    <li>Ödemeler kredi kartı veya banka kartı ile alınır</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">3.3. İptal ve İade</h3>
                  <p className="leading-relaxed">
                    Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal işlemi mevcut 
                    abonelik döneminizin sonunda geçerli olur. Kullanılmayan günler için iade 
                    yapılmaz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">3.4. Fiyat Değişiklikleri</h3>
                  <p className="leading-relaxed">
                    Fiyatlarımızı değiştirme hakkını saklı tutarız. Fiyat değişiklikleri mevcut 
                    abonelikler için sonraki yenileme döneminde geçerli olur.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                4. Kullanım Kuralları
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">Hizmetlerimizi kullanırken aşağıdakileri yapamazsınız:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Yasadışı veya yetkisiz amaçlarla kullanma</li>
                  <li>Başkalarının haklarını ihlal etme</li>
                  <li>Zararlı yazılım yükleme veya dağıtma</li>
                  <li>Sistemin güvenliğini tehlikeye atma</li>
                  <li>Otomatik araçlar veya botlar kullanma</li>
                  <li>Yanıltıcı veya yanlış bilgi paylaşma</li>
                  <li>Hizmeti kötüye kullanma veya suistimal etme</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                5. İçerik ve Fikri Mülkiyet
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">5.1. Kullanıcı İçeriği</h3>
                  <p className="leading-relaxed">
                    Platforma yüklediğiniz içerikler (menü öğeleri, görseller, açıklamalar) 
                    sizin sorumluluğunuzdadır. İçeriğinizin yasalara uygun olduğunu taahhüt edersiniz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">5.2. Platform İçeriği</h3>
                  <p className="leading-relaxed">
                    QR Menü platformu, logosu, tasarımı ve tüm içeriği telif hakkı ve fikri 
                    mülkiyet haklarıyla korunmaktadır. İzinsiz kullanım yasaktır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">5.3. Lisans</h3>
                  <p className="leading-relaxed">
                    Size platformu kullanmak için sınırlı, münhasır olmayan, devredilemez bir 
                    lisans veriyoruz. Bu lisans aboneliğiniz sona erdiğinde geçersiz olur.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                6. Hizmet Garantisi ve Sorumluluk
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">6.1. Hizmet Sunumu</h3>
                  <p className="leading-relaxed">
                    Hizmetlerimizi kesintisiz ve hatasız sunmak için çaba gösteririz, ancak 
                    %100 çalışma süresi garantisi vermeyiz. Bakım ve güncellemeler için geçici 
                    kesintiler olabilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">6.2. Sorumluluk Reddi</h3>
                  <p className="leading-relaxed">
                    Hizmet "olduğu gibi" sunulmaktadır. Platformun kullanımından kaynaklanan 
                    dolaylı veya doğrudan zararlardan sorumlu değiliz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">6.3. Veri Yedekleme</h3>
                  <p className="leading-relaxed">
                    Verilerinizi düzenli olarak yedeklemenizi öneririz. Veri kaybından dolayı 
                    sorumluluk kabul etmiyoruz.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                7. Hesap Askıya Alma ve Sonlandırma
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-3">
                Aşağıdaki durumlarda hesabınızı askıya alma veya sonlandırma hakkımız vardır:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-[#1A1A1A]/80">
                <li>Kullanım koşullarının ihlali</li>
                <li>Ödeme sorunları</li>
                <li>Yasadışı aktiviteler</li>
                <li>Platformun kötüye kullanımı</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                8. Değişiklikler
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Bu kullanım koşullarını değiştirme hakkımızı saklı tutarız. Önemli değişiklikler 
                için kullanıcılarımızı bilgilendiririz. Değişiklikler yayınlandıktan sonra 
                hizmeti kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                9. Uyuşmazlık Çözümü
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Bu kullanım koşullarından kaynaklanan uyuşmazlıklar İstanbul mahkemeleri ve 
                icra daireleri tarafından çözümlenecektir. Türk hukuku uygulanır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                10. İletişim
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">
                  Kullanım koşulları hakkında sorularınız için:
                </p>
                <ul className="space-y-1">
                  <li><strong>E-posta:</strong> destek@qrim.net</li>
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