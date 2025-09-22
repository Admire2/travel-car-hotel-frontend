import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Welcome": "Welcome to Travel Car & Hotel Reservation App",
      "Book": "Book cars and hotels with ease!"
    }
  },
  fr: {
    translation: {
      "Welcome": "Bienvenue dans l'application de réservation de voitures et d'hôtels",
      "Book": "Réservez des voitures et des hôtels facilement!"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
