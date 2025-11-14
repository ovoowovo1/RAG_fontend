import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';

// 檢測瀏覽器語言
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('zh')) {
    return 'zh-TW';
  }
  return 'en';
};

// 從 localStorage 讀取保存的語言設定，如果沒有則使用瀏覽器語言
const savedLanguage = localStorage.getItem('i18nextLng');
const defaultLanguage = savedLanguage || getBrowserLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'en': {
        translation: en
      },
      'zh-TW': {
        translation: zhTW
      }
    },
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React 已經會處理 XSS
    }
  });

// 監聽語言變更，保存到 localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;

