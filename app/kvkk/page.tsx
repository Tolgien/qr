"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function KVKKPage() {
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
            KVKK Aydınlatma Metni
          </h1>

          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
            <section>
              <p className="text-[#1A1A1A]/60 mb-6">
                6698 Sayılı Kişisel Verilerin Korunması Kanunu Uyarınca
              </p>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                QRim olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu
                ("KVKK") kapsamında veri sorumlusu sıfatıyla, kişisel
                verilerinizin işlenmesine ilişkin olarak sizi bilgilendirmek
                isteriz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                1. Veri Sorumlusu
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">
                  <strong>Veri Sorumlusu:</strong> QRim
                </p>
                <p className="leading-relaxed">
                  <strong>Adres:</strong> İstanbul, Türkiye
                </p>
                <p className="leading-relaxed">
                  <strong>E-posta:</strong> kvkk@qrim.net
                </p>
                <p className="leading-relaxed">
                  <strong>Telefon:</strong> +90 (500) 123 45 67
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                2. İşlenen Kişisel Veriler
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    2.1. Kimlik Bilgileri
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ad, soyad</li>
                    <li>TC kimlik numarası (gerekli durumlarda)</li>
                    <li>Doğum tarihi</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    2.2. İletişim Bilgileri
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>E-posta adresi</li>
                    <li>Telefon numarası</li>
                    <li>Adres bilgisi</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    2.3. Müşteri İşlem Bilgileri
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>İşletme adı ve bilgileri</li>
                    <li>Abonelik planı</li>
                    <li>Ödeme geçmişi</li>
                    <li>Sipariş bilgileri</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    2.4. İşlem Güvenliği Bilgileri
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>IP adresi</li>
                    <li>Çerez kayıtları</li>
                    <li>Tarayıcı bilgileri</li>
                    <li>Cihaz bilgileri</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    2.5. Pazarlama Bilgileri
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Çerez kayıtları</li>
                    <li>Kampanya tercihleri</li>
                    <li>İlgi alanları</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                3. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">
                  Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    Hizmet sunumu ve sözleşme yükümlülüklerinin yerine
                    getirilmesi
                  </li>
                  <li>Müşteri memnuniyetinin sağlanması ve geliştirilmesi</li>
                  <li>Ürün ve hizmetlerin pazarlanması ve tanıtımı</li>
                  <li>Talep ve şikayetlerin yönetimi</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                  <li>İstatistiksel analiz ve raporlama</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Finansal işlemlerin yürütülmesi</li>
                  <li>İletişim faaliyetlerinin yürütülmesi</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                4. Kişisel Verilerin Aktarımı
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <p className="leading-relaxed">
                  Kişisel verileriniz, yukarıda belirtilen amaçların
                  gerçekleştirilmesi doğrultusunda, KVKK'nın 8. ve 9.
                  maddelerinde belirtilen kişisel veri işleme şartları ve
                  amaçları çerçevesinde aşağıdaki kişi ve kuruluşlara
                  aktarılabilir:
                </p>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    4.1. Yurt İçi Aktarım
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Hizmet sağlayıcılar (hosting, bulut depolama, ödeme
                      sistemleri)
                    </li>
                    <li>İş ortakları ve tedarikçiler</li>
                    <li>Yetkili kamu kurum ve kuruluşları</li>
                    <li>Yasal merciler</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    4.2. Yurt Dışı Aktarım
                  </h3>
                  <p className="leading-relaxed">
                    Kişisel verileriniz, yeterli önlemler alınarak ve KVKK'nın
                    9. maddesi uyarınca yurt dışındaki sunucu sağlayıcılara
                    aktarılabilir.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                5. Kişisel Veri Toplama Yöntemi
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">
                  Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Web sitesi üzerinden kayıt formları</li>
                  <li>E-posta ve telefon iletişimi</li>
                  <li>Mobil uygulamalar</li>
                  <li>Sosyal medya platformları</li>
                  <li>Çerezler ve benzer teknolojiler</li>
                  <li>Müşteri hizmetleri</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                6. Kişisel Veri Sahibinin Hakları (KVKK Madde 11)
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <p className="leading-relaxed">
                  KVKK'nın 11. maddesi uyarınca, kişisel veri sahipleri olarak
                  aşağıdaki haklara sahipsiniz:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>
                    Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
                  </li>
                  <li>
                    Kişisel verilerin işlenme amacını ve bunların amacına uygun
                    kullanılıp kullanılmadığını öğrenme
                  </li>
                  <li>
                    Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı
                    üçüncü kişileri bilme
                  </li>
                  <li>
                    Kişisel verilerin eksik veya yanlış işlenmiş olması halinde
                    bunların düzeltilmesini isteme
                  </li>
                  <li>
                    KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde
                    kişisel verilerin silinmesini veya yok edilmesini isteme
                  </li>
                  <li>
                    Düzeltme, silme ve yok edilme işlemlerinin kişisel verilerin
                    aktarıldığı üçüncü kişilere bildirilmesini isteme
                  </li>
                  <li>
                    İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla
                    analiz edilmesi suretiyle aleyhinize bir sonucun ortaya
                    çıkmasına itiraz etme
                  </li>
                  <li>
                    Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle
                    zarara uğramanız halinde zararın giderilmesini talep etme
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                7. Haklarınızı Kullanma Yöntemi
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-3">
                <p className="leading-relaxed">
                  Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki
                  yöntemlerle başvurabilirsiniz:
                </p>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    7.1. Başvuru Yöntemleri
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      Yazılı başvuru: İstanbul, Türkiye adresine ıslak imzalı
                      başvuru
                    </li>
                    <li>Kayıtlı elektronik posta (KEP): qrim@hs03.kep.tr</li>
                    <li>Güvenli elektronik imza ile e-posta: kvkk@qrim.net</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    7.2. Başvuruda Bulunması Gerekenler
                  </h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ad, soyad ve başvuru yazılı ise imza</li>
                    <li>TC kimlik numarası</li>
                    <li>İkamet veya işyeri adresi</li>
                    <li>E-posta adresi, telefon veya faks numarası</li>
                    <li>Talep konusu</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">
                    7.3. Cevaplama Süresi
                  </h3>
                  <p className="leading-relaxed">
                    Başvurularınız, talebin niteliğine göre en geç 30 gün içinde
                    ücretsiz olarak sonuçlandırılacaktır. Ancak işlemin ayrıca
                    bir maliyeti gerektirmesi halinde, Kişisel Verileri Koruma
                    Kurulu tarafından belirlenen tarifedeki ücret talep
                    edilebilir.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                8. Veri Güvenliği
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Kişisel verilerinizin güvenliğini sağlamak için KVKK'nın 12.
                maddesi gereğince gerekli teknik ve idari tedbirleri almaktayız.
                Bu kapsamda:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-[#1A1A1A]/80">
                <li>Verilere yetkisiz erişim engellenmektedir</li>
                <li>Veri işleme süreçleri düzenli olarak denetlenmektedir</li>
                <li>Çalışanlarımız veri güvenliği konusunda eğitilmektedir</li>
                <li>Güvenlik açıkları sürekli izlenmektedir</li>
                <li>Veri yedekleme sistemleri kullanılmaktadır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                9. Kişisel Verilerin Saklanma Süresi
              </h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                Kişisel verileriniz, işleme amacının gerekli kıldığı süre
                boyunca ve ilgili mevzuatta öngörülen süreler dahilinde
                saklanmaktadır. Saklama süresinin sona ermesi durumunda kişisel
                verileriniz silinir, yok edilir veya anonim hale getirilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                10. İletişim
              </h2>
              <div className="text-[#1A1A1A]/80 space-y-2">
                <p className="leading-relaxed">
                  KVKK kapsamındaki haklarınız ve kişisel verilerinizin
                  işlenmesi hakkında sorularınız için:
                </p>
                <ul className="space-y-1">
                  <li>
                    <strong>KVKK Birimi E-posta:</strong> kvkk@QRim.net
                  </li>
                  <li>
                    <strong>Genel E-posta:</strong> destek@QRim.net
                  </li>
                  <li>
                    <strong>Telefon:</strong> +90 (500) 123 45 67
                  </li>
                  <li>
                    <strong>Adres:</strong> İstanbul, Türkiye
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-[#F7F3EB] p-6 rounded-2xl">
              <p className="text-sm text-[#1A1A1A]/80 leading-relaxed">
                <strong>Not:</strong> Bu aydınlatma metni, 6698 sayılı Kişisel
                Verilerin Korunması Kanunu ve ilgili mevzuat çerçevesinde
                hazırlanmıştır. Değişiklikler durumunda güncellenecek ve web
                sitemizde yayınlanacaktır.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
