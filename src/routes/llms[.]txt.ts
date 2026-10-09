// Server-rendered llms.txt so every link follows the configured SITE.url
// (VITE_SITE_URL) instead of a hard-coded domain.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE } from "@/lib/site-info";

const body = () => `# ${SITE.legalName.en} — ${SITE.brand.ar}

> Professional 24/7 taxi and chauffeur service for transfers from King Abdulaziz International Airport (Jeddah, KAIA/JED) to Makkah Al-Mukarramah and Al-Madinah Al-Munawwarah, with fixed prices, licensed drivers, and a modern fleet of sedans, GMC SUVs, Hiace and family vans. Serving Umrah pilgrims, families, and business travelers across the Kingdom of Saudi Arabia.
>
> خدمة تاكسي وسائق خاص احترافية على مدار الساعة للتوصيل من مطار الملك عبدالعزيز الدولي بجدة إلى مكة المكرمة والمدينة المنورة، بأسعار ثابتة وسائقين مرخصين وأسطول حديث من السيدان و GMC والهايس والفانات العائلية. نخدم المعتمرين والعائلات ورجال الأعمال في المملكة العربية السعودية.

## Primary services
- Jeddah Airport (JED / KAIA) → Makkah taxi, 24/7
- Jeddah Airport → Madinah taxi
- Makkah → Madinah intercity transfer
- Umrah packages with driver
- Hourly chauffeur & city rides in Jeddah, Makkah, Taif, Madinah

## Core pages
- [الرئيسية (Arabic home)](${SITE.url}/ar): Overview, routes, live WhatsApp booking.
- [English home](${SITE.url}/en): Overview, routes, live WhatsApp booking.
- [Services / الخدمات](${SITE.url}/ar/services): Full list of transfer and Umrah services.
- [Airport transfers / نقل المطار](${SITE.url}/ar/airport-transfers): Meet-and-greet with flight tracking.
- [Fleet / الأسطول](${SITE.url}/ar/fleet): Sedan, GMC, Hiace, family van, luxury SUV.
- [Pricing / الأسعار](${SITE.url}/ar/pricing): Fixed fares and per-km rates.
- [Cities / المدن](${SITE.url}/ar/cities): Jeddah, Makkah, Madinah, Taif.
- [Airports / المطارات](${SITE.url}/ar/airports): Jeddah (JED), Madinah (MED), Taif (TIF).
- [Routes / المسارات](${SITE.url}/ar/routes): Fixed-price intercity routes.
- [Blog / المدونة](${SITE.url}/ar/blog): Umrah travel guides and airport tips.
- [FAQ / الأسئلة الشائعة](${SITE.url}/ar/faq)
- [Contact / تواصل معنا](${SITE.url}/ar/contact)
- [About / من نحن](${SITE.url}/ar/about)

## Booking
- WhatsApp: https://wa.me/${SITE.whatsapp}
- Phone: tel:${SITE.phone}
- Available 24/7, English & Arabic support

## Optional
- [Sitemap XML](${SITE.url}/sitemap.xml)
- [Robots](${SITE.url}/robots.txt)
- [Site map (human)](${SITE.url}/ar/sitemap)
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(body(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
