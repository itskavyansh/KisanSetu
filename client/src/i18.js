import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./Locales/en.json";
import kn from "./Locales/kn.json";
import hi from "./Locales/hi.json";
import ta from "./Locales/ta.json";
import te from "./Locales/te.json";

const savedLanguage = typeof window !== 'undefined' ? (localStorage.getItem('language') || 'en') : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    kn: { translation: kn },
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
  },
  lng: savedLanguage, // default language (persisted if available)
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
