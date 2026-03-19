import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";

const SETTINGS_KEY = "hidestay_platform_settings";

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
  footerText: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: "HIDESTAY",
  supportEmail: "hidestayindiapvtltd@gmail.com",
  supportPhone: "+91 98765 43210",
  companyAddress: "Rishikesh, Uttarakhand, India",
  footerText: "Discover Hidden Stays in India",
};

function loadSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

const FAQS = [
  {
    q: "How do I book a stay?",
    a: "Browse any category (Hotels, Resorts, Homestays, Guest Houses) from the home screen, select a property, and tap 'Book Now'. Fill in your details and confirm your booking.",
  },
  {
    q: "How do I cancel my booking?",
    a: "To cancel a booking, please contact our support team with your Booking ID. Cancellation policies vary by property.",
  },
  {
    q: "Is my payment secure?",
    a: "HIDESTAY uses industry-standard security. Payments are processed directly at the property — we operate on a 'Pay at Hotel' model, so no online payment is collected through the app.",
  },
  {
    q: "Can I modify my booking?",
    a: "Yes, booking modifications can be made up to 24 hours before check-in. Contact our support team via email or phone with your Booking ID and the changes you'd like to make.",
  },
  {
    q: "How do I contact the hotel directly?",
    a: "After booking, your confirmation page includes the property's contact details. You can also reach out to our support team and we'll connect you with the hotel directly.",
  },
];

export default function HelpSupport() {
  const [settings, setSettings] = useState<PlatformSettings>(loadSettings);

  useEffect(() => {
    // Re-read settings on focus (in case admin changed settings in another tab)
    const handleFocus = () => setSettings(loadSettings());
    window.addEventListener("focus", handleFocus);
    setSettings(loadSettings());
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const phoneClean = settings.supportPhone.replace(/[^0-9+]/g, "");
  const whatsappNumber = phoneClean.startsWith("+")
    ? phoneClean.slice(1)
    : phoneClean.startsWith("0")
      ? `91${phoneClean.slice(1)}`
      : phoneClean;

  return (
    <div data-ocid="help.page" className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-display font-black text-foreground text-xl">
            Help & Support
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            We're here to help — anytime
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Company Info */}
        <Card className="border-border shadow-xs bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-display font-black text-primary tracking-widest text-xl">
                {settings.platformName}
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-body mb-4">
              Discover hidden stays across India — from mountain retreats to
              coastal havens.
            </p>
            <div className="space-y-2 text-sm font-body">
              <div className="flex items-start gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{settings.companyAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{settings.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{settings.supportPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <section>
          <h2 className="font-display font-bold text-foreground text-lg mb-3">
            Contact Us
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <a
              href={`tel:${phoneClean}`}
              data-ocid="help.call.button"
              className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl shadow-xs hover:shadow-green hover:-translate-y-0.5 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-body font-semibold text-foreground">
                Call Us
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                {settings.supportPhone}
              </span>
            </a>
            <a
              href={`mailto:${settings.supportEmail}`}
              data-ocid="help.email.button"
              className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl shadow-xs hover:shadow-green hover:-translate-y-0.5 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-body font-semibold text-foreground">
                Email Us
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                {settings.supportEmail}
              </span>
            </a>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="help.whatsapp.button"
              className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl shadow-xs hover:shadow-green hover:-translate-y-0.5 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-body font-semibold text-foreground">
                WhatsApp
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Chat with us
              </span>
            </a>
          </div>
        </section>

        {/* Support Hours */}
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-sm">
                Support Hours
              </h3>
              <p className="text-muted-foreground text-xs font-body mt-0.5">
                Monday – Saturday: 9:00 AM – 9:00 PM IST
              </p>
              <p className="text-muted-foreground text-xs font-body">
                Sunday: 10:00 AM – 6:00 PM IST
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <section>
          <h2 className="font-display font-bold text-foreground text-lg mb-3">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${i}`}
                data-ocid="help.faq.panel"
                className="border border-border rounded-xl px-4 shadow-xs bg-card"
              >
                <AccordionTrigger className="font-body font-semibold text-sm text-foreground py-3 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-muted-foreground pb-3">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-xs font-body pt-2">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </main>
    </div>
  );
}
