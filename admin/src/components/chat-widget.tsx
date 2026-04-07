"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, User, Store, ChevronRight, Calendar, ExternalLink } from "lucide-react";

/* ─── Types ─── */
type MsgRole = "bot" | "user";
type Msg = {
  role: MsgRole;
  text: string;
  buttons?: { label: string; value: string; icon?: "user" | "store" | "calendar" | "link" }[];
};
type Lang = "da" | "fo" | "en";
type UserType = "private" | "business" | null;
type BookingStage = "idle" | "name" | "contact" | "done";

/* ─── Language detection ─── */
const FO_WORDS = /\b(hevur|hvussu|hvat|tørvar|kunnu|verður|eingin|fyritøk|búð|gjalda|kundi|okkum|títt|títtar|tær|vilt|kanst|hvørt|bert|bóka|møti|tøku|hetta|eg eri|mær|okkara|frálíkt|vælkomin|takk fyri|góðan dag|góða kvøld)\b/i;
const EN_WORDS = /\b(the|is|are|what|how|does|can|you|your|this|that|with|for|from|would|could|should|about|want|need|help|meeting|book|price|cost|pay|store|business|app|download|works?|get|free|terminal)\b/i;

function detectLang(text: string): Lang {
  const lower = text.toLowerCase();
  const foScore = (lower.match(FO_WORDS) || []).length;
  const enScore = (lower.match(EN_WORDS) || []).length;
  if (foScore >= 2) return "fo";
  if (foScore >= 1 && enScore === 0) return "fo";
  if (enScore >= 2) return "en";
  return "da";
}

/* ─── Knowledge base ─── */
type KB = Record<string, { patterns: RegExp; reply: Record<Lang, string>; followUp?: Record<Lang, { label: string; value: string; icon?: "calendar" | "link" }[]> }>;

const knowledge: KB = {
  greeting: {
    patterns: /^(hej|hey|hi|hello|halló|góðan dag|goddag|yo|hei|moin)\b/i,
    reply: {
      da: "Hej! 👋 Hvad kan jeg hjælpe dig med?",
      fo: "Hey! 👋 Hvat kann eg hjálpa tær við?",
      en: "Hey! 👋 What can I help you with?",
    },
  },
  howWorks: {
    patterns: /\b(hvordan|hvussu|how)\b.*\b(virker|fungerer|works?|virkar)\b/i,
    reply: {
      da: "PayWay virker sådan:\n\n1️⃣ Din butik får en unik QR-kode\n2️⃣ Kunder scanner med PayWay-appen og betaler\n3️⃣ Pengene udbetales dagligt til din bankkonto\n\nIngen kortterminal, ingen binding — kun 1–2% pr. transaktion.\n\nVil du se det i praksis?",
      fo: "PayWay virkar soleiðis:\n\n1️⃣ Tín búð fær eina serliga QR-kotu\n2️⃣ Kundar skanna við PayWay-appini og gjalda\n3️⃣ Pengar verða útgoldnir dagliga til títt bankakontu\n\nEingin kortterminal, eingi binding — bert 1–2% fyri hvørja transaksiónina.\n\nVilt tú síggja tað í verki?",
      en: "PayWay works like this:\n\n1️⃣ Your store gets a unique QR code\n2️⃣ Customers scan with the PayWay app and pay\n3️⃣ Money is paid out daily to your bank account\n\nNo card terminal, no commitment — only 1–2% per transaction.\n\nWant to see it in action?",
    },
    followUp: {
      da: [{ label: "Book et møde", value: "book", icon: "calendar" }, { label: "Start gratis", value: "signup", icon: "link" }],
      fo: [{ label: "Bóka møti", value: "book", icon: "calendar" }, { label: "Start ókeypis", value: "signup", icon: "link" }],
      en: [{ label: "Book a meeting", value: "book", icon: "calendar" }, { label: "Start free", value: "signup", icon: "link" }],
    },
  },
  price: {
    patterns: /\b(pris|kost|price|cost|gebyr|fee|hvad koster|hvat kostar|how much|dyr|billig|cheap|expensive|afgift)\b/i,
    reply: {
      da: "PayWay Business koster:\n\n✅ 1–2% pr. transaktion\n✅ Ingen fast månedlig afgift\n✅ Ingen binding\n✅ Alt inkluderet: dashboard, QR-kode, support\n\n💎 Lige nu er Business Premium GRATIS — det inkluderer Account Manager, analytics, API-adgang og meget mere.\n\nDet er billigere end enhver kortterminal-løsning!",
      fo: "PayWay Business kostar:\n\n✅ 1–2% fyri hvørja transaksiónina\n✅ Eingi fast mánaðarlig avgift\n✅ Eingi binding\n✅ Alt inkluderat: dashboard, QR-kota, stuðul\n\n💎 Júst nú er Business Premium ÓKEYPIS — tað inkluderar Account Manager, analytics, API-atgongd og mikið meira.\n\nTað er billigari enn hvørja sum helst kortterminal-loysn!",
      en: "PayWay Business costs:\n\n✅ 1–2% per transaction\n✅ No fixed monthly fee\n✅ No commitment\n✅ Everything included: dashboard, QR code, support\n\n💎 Right now Business Premium is FREE — includes Account Manager, analytics, API access and much more.\n\nCheaper than any card terminal solution!",
    },
    followUp: {
      da: [{ label: "Start gratis nu", value: "signup", icon: "link" }],
      fo: [{ label: "Start ókeypis nú", value: "signup", icon: "link" }],
      en: [{ label: "Start free now", value: "signup", icon: "link" }],
    },
  },
  qr: {
    patterns: /\b(qr|scan|skann|kode|kotu|code)\b/i,
    reply: {
      da: "Du får en unik QR-kode til din butik. Kunder scanner den med PayWay-appen, og betalingen sker på sekunder.\n\nDu kan printe koden eller vise den på en skærm — super simpelt! Ingen hardware nødvendig.",
      fo: "Tú fært eina serliga QR-kotu til títt búð. Kundar skanna hana við PayWay-appini, og gjaldingurin verður gjørd á sekund.\n\nTú kanst prenta kotu ella vísa hana á skíggi — sera einfalt! Eingin tól neyðug.",
      en: "You get a unique QR code for your store. Customers scan it with the PayWay app, and payment happens in seconds.\n\nYou can print the code or display it on a screen — super simple! No hardware needed.",
    },
  },
  cashback: {
    patterns: /\b(cashback|cash back|rabat|discount|loyalitet|loyalty|tilbud|offer)\b/i,
    reply: {
      da: "Alle PayWay-brugere får automatisk cashback, når de handler i din butik — og det koster dig INTET! 🎉\n\nPayWay dækker cashback selv. Det betyder flere genbesøg og mere loyale kunder, uden det koster dig én krone.",
      fo: "Allir PayWay-brúkarar fáa automatiskt cashback, tá ið teir handla í tínari búð — og tað kostar teg EINKI! 🎉\n\nPayWay dekkir cashback sjálvt. Tað merkir fleiri endurkomu og meira loyalir kundar, uttan tað kostar teg eina krónu.",
      en: "All PayWay users automatically get cashback when they shop at your store — and it costs you NOTHING! 🎉\n\nPayWay covers cashback itself. That means more repeat visits and more loyal customers, without costing you a penny.",
    },
  },
  payout: {
    patterns: /\b(udbetal|útgjald|payout|bank|stripe|penge|pengar|money|daglig|daily|hvornår|hvørji)\b/i,
    reply: {
      da: "Dine salg samles og udbetales dagligt direkte til din bankkonto via Stripe. Du kan se alt i dashboardet — hvad der er udbetalt, hvad der afventer, og hvornår næste udbetaling kommer.",
      fo: "Títtar sølur verða samlaðar og útgoldnar dagliga beinleiðis á títt bankakontu gjøgnum Stripe. Tú kanst síggja alt í dashboardinum — hvat er útgoldið, hvat bíðar, og hvørji dag næsta útgjald kemur.",
      en: "Your sales are collected and paid out daily directly to your bank account via Stripe. You can see everything in the dashboard — what's paid out, what's pending, and when the next payout arrives.",
    },
  },
  terminal: {
    patterns: /\b(terminal|kortterminal|card terminal|hardware|maskine|maskin|device)\b/i,
    reply: {
      da: "Med PayWay behøver du INGEN kortterminal! 🚀\n\nSpar penge på dyr hardware og lejeaftaler. Dine kunder betaler direkte fra deres telefon ved at scanne din QR-kode. Det eneste du behøver er en printet QR-kode.",
      fo: "Við PayWay tørvar tú EINGA kortterminal! 🚀\n\nSpar pengar á dýrum tólum og leiguavtalum. Títtar kundar gjalda beinleiðis frá teirra telefón við at skanna títt QR-kotu. Tað einasta tú tørvar er ein prentaða QR-kota.",
      en: "With PayWay you need NO card terminal! 🚀\n\nSave money on expensive hardware and rental agreements. Your customers pay directly from their phone by scanning your QR code. All you need is a printed QR code.",
    },
  },
  app: {
    patterns: /\b(app|download|niðurhala|hent|install|telefon|phone|ios|android|play store|app store)\b/i,
    reply: {
      da: "PayWay-appen er gratis og tilgængelig på både App Store og Google Play! 📱\n\nMed appen kan du:\n• Sende og modtage penge til venner\n• Betale i butikker med QR-kode\n• Oprette grupper til fællesudgifter\n• Se hele din transaktionshistorik",
      fo: "PayWay-appin er ókeypis og tøk bæði á App Store og Google Play! 📱\n\nVið appini kanst tú:\n• Senda og móttaka pengar til vinir\n• Gjalda í búðum við QR-kotu\n• Stovna bólkar til felags útgerðir\n• Síggja alla títt transaksiónssøgu",
      en: "The PayWay app is free and available on both App Store and Google Play! 📱\n\nWith the app you can:\n• Send and receive money to friends\n• Pay in stores with QR code\n• Create groups for shared expenses\n• See your full transaction history",
    },
  },
  groups: {
    patterns: /\b(grupp|group|bólk|fælles|shared|split|dele|deling)\b/i,
    reply: {
      da: "Med PayWay Groups kan du oprette grupper til fællesudgifter — perfekt til roommates, klubber eller familier! 👥\n\n• Real-time saldo for alle\n• Gruppeafstemninger\n• Automatisk opdeling af udgifter\n• Fuld historik over alle transaktioner",
      fo: "Við PayWay Groups kanst tú stovna bólkar til felags útgerðir — fullkomin til íbúðarfelagar, feløg ella familju! 👥\n\n• Real-time saldo fyri allar\n• Bólkaatkvøður\n• Automatisk deiling av útgerðum\n• Full søga av øllum transaksiónum",
      en: "With PayWay Groups you can create groups for shared expenses — perfect for roommates, clubs or families! 👥\n\n• Real-time balance for everyone\n• Group polls\n• Automatic expense splitting\n• Full history of all transactions",
    },
  },
  dashboard: {
    patterns: /\b(dashboard|overblik|overview|analytics|rapporter?|reports?|data|statistik|statistics)\b/i,
    reply: {
      da: "Dit PayWay Business dashboard giver dig:\n\n📊 Salgsoverblik i real-time\n📈 Omsætning pr. time og dag\n📋 Eksportér rapporter som CSV\n💰 Status på udbetalinger\n⚙️ Administrer butik og bankkonto\n\nAlt samlet ét sted — tilgængeligt fra enhver browser.",
      fo: "Títt PayWay Business dashboard gevur tær:\n\n📊 Søluoverblik í real-time\n📈 Umseting pr. tíma og dag\n📋 Útflyt rapportar sum CSV\n💰 Status á útgjaldingum\n⚙️ Stýr búð og bankakontu\n\nAlt samlað eitt stað — tøkt frá hvørjum sum helst kaga.",
      en: "Your PayWay Business dashboard gives you:\n\n📊 Real-time sales overview\n📈 Revenue per hour and day\n📋 Export reports as CSV\n💰 Payout status\n⚙️ Manage store and bank account\n\nEverything in one place — accessible from any browser.",
    },
  },
  security: {
    patterns: /\b(sikker|tryg|safe|secur|kyc|aml|compliance|gdpr|data|persondata|privacy)\b/i,
    reply: {
      da: "Sikkerhed er topprioritet hos PayWay 🔒\n\n• KYC/AML compliance\n• GDPR-kompatibel\n• Betalinger via Stripe (verdens mest sikre betalingsplatform)\n• Krypteret data\n• Biometrisk login i appen",
      fo: "Trygd er í hæsta sæti hjá PayWay 🔒\n\n• KYC/AML compliance\n• GDPR-hóskandi\n• Gjaldingar gjøgnum Stripe (heimsins tryggasta gjaldingaplatform)\n• Krypterat data\n• Biometriskt innritan í appini",
      en: "Security is top priority at PayWay 🔒\n\n• KYC/AML compliance\n• GDPR compliant\n• Payments via Stripe (world's most secure payment platform)\n• Encrypted data\n• Biometric login in the app",
    },
  },
  contact: {
    patterns: /\b(kontakt|contact|mail|email|ring|call|telefon|phone|hjælp|help|support|hjálp|stuðul)\b/i,
    reply: {
      da: "Du kan kontakte os på:\n\n📧 business@payway.fo (virksomheder)\n📧 info@payway.fo (generelt)\n\nEller book et møde direkte — så ringer vi dig op! 😊",
      fo: "Tú kanst kontakta okkum á:\n\n📧 business@payway.fo (fyritøkur)\n📧 info@payway.fo (alment)\n\nElla bóka eitt møti beinleiðis — so ringja vit til tín! 😊",
      en: "You can contact us at:\n\n📧 business@payway.fo (businesses)\n📧 info@payway.fo (general)\n\nOr book a meeting directly — we'll call you! 😊",
    },
    followUp: {
      da: [{ label: "Book møde", value: "book", icon: "calendar" }],
      fo: [{ label: "Bóka møti", value: "book", icon: "calendar" }],
      en: [{ label: "Book meeting", value: "book", icon: "calendar" }],
    },
  },
  signup: {
    patterns: /\b(tilmeld|sign.?up|opret|start|kom i gang|get started|registrer|register|prøv|try|starta)\b/i,
    reply: {
      da: "Du kan komme i gang på under 2 minutter! 🚀\n\nUdfyld en kort formular med dit butiksnavn, CVR og kontaktinfo — så får du adgang til dit dashboard med det samme. En Account Manager kontakter dig inden 24 timer.",
      fo: "Tú kanst byrja á undir 2 minuttum! 🚀\n\nFyll út eina stutta formular við títt búðarnavn, V-tal og kontaktupplýsingar — so fært tú atgongd til títt dashboard beinleiðis. Ein Account Manager tekur samband innan 24 tímar.",
      en: "You can get started in under 2 minutes! 🚀\n\nFill out a short form with your store name, CVR and contact info — you get dashboard access right away. An Account Manager contacts you within 24 hours.",
    },
    followUp: {
      da: [{ label: "Start gratis nu", value: "signup", icon: "link" }],
      fo: [{ label: "Start ókeypis nú", value: "signup", icon: "link" }],
      en: [{ label: "Start free now", value: "signup", icon: "link" }],
    },
  },
  thanks: {
    patterns: /\b(tak|takk|thanks?|thank you|cool|super|perfekt|perfect|fedt|nice|great|awesome)\b/i,
    reply: {
      da: "Selv tak! 😊 Er der andet jeg kan hjælpe med?",
      fo: "Einki at takka fyri! 😊 Er onnurt eg kann hjálpa við?",
      en: "You're welcome! 😊 Anything else I can help with?",
    },
  },
  bye: {
    patterns: /\b(farvel|farvæl|bye|goodbye|hav det|vi ses|see you|adjø|ha det)\b/i,
    reply: {
      da: "Ha det godt! 👋 Du er altid velkommen tilbage.",
      fo: "Hav tað gott! 👋 Tú ert altíð vælkomin aftur.",
      en: "Take care! 👋 You're always welcome back.",
    },
  },
};

function findAnswer(text: string, lang: Lang, userType: UserType): { reply: string; buttons?: Msg["buttons"] } {
  for (const [, entry] of Object.entries(knowledge)) {
    if (entry.patterns.test(text)) {
      return {
        reply: entry.reply[lang],
        buttons: entry.followUp?.[lang]?.map((b) => ({ ...b })),
      };
    }
  }

  const fallback: Record<Lang, string> = {
    da: userType === "business"
      ? "Godt spørgsmål! Jeg er ikke 100% sikker på svaret, men vores team kan helt sikkert hjælpe. Vil du booke et møde, eller skrive til os på business@payway.fo?"
      : "Godt spørgsmål! Jeg kan ikke helt svare på det, men du kan skrive til os på info@payway.fo, så hjælper vi dig videre 😊",
    fo: userType === "business"
      ? "Gott spursmál! Eg eri ikki 100% vís/ur um svarið, men okkara lið kann heilt ávíst hjálpa. Vilt tú bóka eitt møti, ella senda okkum á business@payway.fo?"
      : "Gott spursmál! Eg kann ikki heilt svara á tað, men tú kanst senda okkum á info@payway.fo, so hjálpa vit tær víðari 😊",
    en: userType === "business"
      ? "Great question! I'm not 100% sure of the answer, but our team can definitely help. Want to book a meeting, or email us at business@payway.fo?"
      : "Great question! I can't fully answer that, but you can email us at info@payway.fo and we'll help you further 😊",
  };

  const btns: Msg["buttons"] | undefined = userType === "business"
    ? [{
        label: lang === "fo" ? "Bóka møti" : lang === "en" ? "Book meeting" : "Book møde",
        value: "book",
        icon: "calendar" as const,
      }]
    : undefined;

  return { reply: fallback[lang], buttons: btns };
}

/* ─── Greeting copy ─── */
const GREETING: Record<string, { text: string; privatBtn: string; bizBtn: string }> = {
  fo: { text: "Hey! Vælkomin til PayWay 👋\n\nEr tú privatpersónur ella fyritøka?", privatBtn: "Privatpersónur", bizBtn: "Fyritøka" },
  da: { text: "Hey! Velkommen til PayWay 👋\n\nEr du privatperson eller virksomhed?", privatBtn: "Privatperson", bizBtn: "Virksomhed" },
  en: { text: "Hey! Welcome to PayWay 👋\n\nAre you an individual or a business?", privatBtn: "Individual", bizBtn: "Business" },
};

const PRIVATE_WELCOME: Record<Lang, string> = {
  da: "Fedt! 😊 Jeg kan hjælpe dig med alt om PayWay-appen.\n\nDu kan spørge om:\n• Hvordan appen virker\n• Grupper og fællesudgifter\n• Download og installation\n• Betalinger i butikker\n\nHvad vil du vide?",
  fo: "Frálíkt! 😊 Eg kann hjálpa tær við alt um PayWay-appina.\n\nTú kanst spyrja um:\n• Hvussu appin virkar\n• Bólkar og felags útgerðir\n• Niðurhaling og uppseting\n• Gjaldingar í búðum\n\nHvat vilt tú vita?",
  en: "Great! 😊 I can help you with everything about the PayWay app.\n\nYou can ask about:\n• How the app works\n• Groups and shared expenses\n• Download and installation\n• Payments in stores\n\nWhat would you like to know?",
};

const BIZ_WELCOME: Record<Lang, string> = {
  da: "Super! 💼 Jeg er her for at hjælpe med PayWay Business.\n\nDu kan spørge om:\n• Hvordan det virker\n• Priser og gebyrer\n• Dashboard og features\n• Daglige udbetalinger\n• Cashback til kunder\n\nEller book et møde direkte — hvad vil du vide?",
  fo: "Frálíkt! 💼 Eg eri hetta til hjálpa við PayWay Business.\n\nTú kanst spyrja um:\n• Hvussu tað virkar\n• Prísir og gebyrar\n• Dashboard og funktiónir\n• Dagligar útgjaldingar\n• Cashback til kundar\n\nElla bóka eitt møti beinleiðis — hvat vilt tú vita?",
  en: "Great! 💼 I'm here to help with PayWay Business.\n\nYou can ask about:\n• How it works\n• Prices and fees\n• Dashboard and features\n• Daily payouts\n• Cashback for customers\n\nOr book a meeting directly — what would you like to know?",
};

const BOOKING_ASK_NAME: Record<Lang, string> = {
  da: "Selvfølgelig! 📅 Lad os booke et møde.\n\nHvad hedder din virksomhed?",
  fo: "Sjálvandi! 📅 Lat okkum bóka eitt møti.\n\nHvat eitur títt fyritøka?",
  en: "Of course! 📅 Let's book a meeting.\n\nWhat's your company name?",
};

const BOOKING_ASK_CONTACT: Record<Lang, string> = {
  da: "👍 Og hvad er din e-mail eller dit telefonnummer, så vi kan kontakte dig?",
  fo: "👍 Og hvat er títt teldupostur ella telefonnummar, so vit kunnu kontakta teg?",
  en: "👍 And what's your email or phone number so we can reach you?",
};

const BOOKING_CONFIRM: Record<Lang, string> = {
  da: "Perfekt! ✅ Vi har noteret din booking.\n\nEn Account Manager kontakter dig inden 24 timer for at sætte mødet op.\n\nEr der andet jeg kan hjælpe med?",
  fo: "Fullkomið! ✅ Vit hava skrásett títt bóking.\n\nEin Account Manager tekur samband við teg innan 24 tímar fyri at seta møtið upp.\n\nEr onnurt eg kann hjálpa við?",
  en: "Perfect! ✅ We've noted your booking.\n\nAn Account Manager will contact you within 24 hours to set up the meeting.\n\nAnything else I can help with?",
};

/* ─── Component ─── */
export function ChatWidget({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [userType, setUserType] = useState<UserType>(null);
  const [bookingStage, setBookingStage] = useState<BookingStage>("idle");
  const [detectedLang, setDetectedLang] = useState<Lang>((locale as Lang) || "da");
  const scrollRef = useRef<HTMLDivElement>(null);
  const g = GREETING[locale] ?? GREETING.da;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "bot",
        text: g.text,
        buttons: [
          { label: g.privatBtn, value: "private", icon: "user" },
          { label: g.bizBtn, value: "business", icon: "store" },
        ],
      }]);
    }
  }, [open, messages.length, g]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const addBot = useCallback((text: string, buttons?: Msg["buttons"], delay = 500) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text, buttons }]);
    }, delay);
  }, []);

  const handleTypeSelect = (type: "private" | "business") => {
    setUserType(type);
    const label = type === "private" ? g.privatBtn : g.bizBtn;
    setMessages((prev) => [...prev, { role: "user", text: label }]);
    const welcome = type === "private" ? PRIVATE_WELCOME : BIZ_WELCOME;
    addBot(welcome[detectedLang]);
  };

  const handleButton = (value: string) => {
    if (value === "private" || value === "business") {
      handleTypeSelect(value);
      return;
    }
    if (value === "book") {
      setBookingStage("name");
      const lang = detectedLang;
      const label = lang === "fo" ? "Bóka møti" : lang === "en" ? "Book meeting" : "Book møde";
      setMessages((prev) => [...prev, { role: "user", text: label }]);
      addBot(BOOKING_ASK_NAME[lang]);
      return;
    }
    if (value === "signup") {
      window.open("/business/opret", "_blank");
      return;
    }
  };

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    setInput("");

    const lang = detectLang(msg);
    setDetectedLang(lang);
    setMessages((prev) => [...prev, { role: "user", text: msg }]);

    if (bookingStage === "name") {
      setBookingStage("contact");
      addBot(BOOKING_ASK_CONTACT[lang]);
      return;
    }
    if (bookingStage === "contact") {
      setBookingStage("done");
      addBot(BOOKING_CONFIRM[lang]);
      return;
    }

    if (/\b(book|bóka|møde|møti|meeting|aftale)\b/i.test(msg) && userType === "business") {
      setBookingStage("name");
      addBot(BOOKING_ASK_NAME[lang]);
      return;
    }

    const { reply, buttons } = findAnswer(msg, lang, userType);
    addBot(reply, buttons);
  };

  const handleReset = () => {
    setMessages([]);
    setUserType(null);
    setBookingStage("idle");
    setDetectedLang((locale as Lang) || "da");
  };

  const iconMap = {
    user: User,
    store: Store,
    calendar: Calendar,
    link: ExternalLink,
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          open ? "bg-[#0a2f5b] shadow-[#0a2f5b]/25" : "bg-[#2ec964] shadow-[#2ec964]/30 hover:scale-105"
        }`}
      >
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {!open && <div className="fixed bottom-6 right-6 z-40 h-14 w-14 animate-ping rounded-full bg-[#2ec964]/30 pointer-events-none" />}

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-[#0a2f5b]/[0.08] bg-white shadow-2xl shadow-[#0a2f5b]/10">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0a2f5b] to-[#0d3d73] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <img src="/payway-icon.png" alt="PayWay" className="h-6 w-6 rounded-md" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">PayWay</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#2ec964] animate-pulse" />
                  <p className="text-[11px] text-white/50">Online</p>
                </div>
              </div>
            </div>
            {messages.length > 1 && (
              <button onClick={handleReset} className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white/70">
                {detectedLang === "fo" ? "Nýtt samrøðu" : detectedLang === "en" ? "New chat" : "Ny chat"}
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "user" && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#2ec964] px-4 py-3 text-[13px] leading-relaxed text-white whitespace-pre-line">{msg.text}</div>
                  </div>
                )}
                {msg.role === "bot" && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#0a2f5b]/[0.04] px-4 py-3 text-[13px] leading-relaxed text-[#0a2f5b] whitespace-pre-line">{msg.text}</div>
                  </div>
                )}
                {msg.buttons && (
                  <div className="mt-2 flex flex-wrap gap-2 pl-1">
                    {msg.buttons.map((btn) => {
                      const Icon = btn.icon ? iconMap[btn.icon] : ChevronRight;
                      return (
                        <button
                          key={btn.value}
                          onClick={() => handleButton(btn.value)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#0a2f5b]/10 bg-white px-4 py-2.5 text-[12px] font-semibold text-[#0a2f5b] transition-all hover:border-[#2ec964]/30 hover:bg-[#2ec964]/[0.05] hover:text-[#2ec964]"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-[#0a2f5b]/[0.06] px-4 py-3">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={locale === "fo" ? "Skriva boð..." : locale === "en" ? "Write a message..." : "Skriv en besked..."}
                className="flex-1 rounded-xl border border-[#0a2f5b]/[0.08] bg-[#0a2f5b]/[0.02] px-4 py-2.5 text-[13px] text-[#0a2f5b] placeholder-[#0a2f5b]/25 outline-none transition-all focus:border-[#2ec964]/30 focus:ring-1 focus:ring-[#2ec964]/10"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2ec964] text-white shadow-md shadow-[#2ec964]/20 transition-all hover:bg-[#25a854] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
