export default function Head() {
  return (
    <>
      <meta
        name="google-site-verification"
        content="ooRPh9ARBFQcpoqzQLk0pf_5jjNG_bgMQqXJCrm7Lzc"
      />
      <link rel="canonical" href="https://qrim.net" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "QRim.net",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "TRY",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "1000",
            },
            description:
              "QR kod ile restoran ve cafe menülerini dijitalleştiren profesyonel menü sistemi. Temassız sipariş, anlık güncelleme, çoklu dil desteği.",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "QRim.net",
            url: "https://qrim.net",
            logo: "https://qrim.net/logo-qrim.png",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+90-500-123-45-67",
              contactType: "customer service",
              areaServed: "TR",
              availableLanguage: ["Turkish", "English"],
            },
            sameAs: [
              "https://www.instagram.com/qrim.net",
              "https://www.facebook.com/qrim.net",
              "https://twitter.com/qrim",
              "https://www.linkedin.com/company/qrim",
            ],
          }),
        }}
      />
    </>
  );
}
