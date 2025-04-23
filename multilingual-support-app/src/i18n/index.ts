import i18n from 'i18n';
import path from 'path';

const locales = ['en', 'es'];

i18n.configure({
  locales,
  directory: path.join(__dirname, './'),
  defaultLocale: 'en',
  autoReload: true,
  syncFiles: true,
  updateFiles: false,
  api: {
    __: 'translate', // __() method for translation
    __n: 'translateN' // __n() method for pluralization
  }
});

// Load translation files
locales.forEach(locale => {
  i18n.loadLocaleFile(path.join(__dirname, `${locale}.json`), locale);
});

export default i18n;