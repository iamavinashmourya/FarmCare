import { useLanguage } from '../context/LanguageContext';
import { translations } from '../data/translations';

export function useTranslation() {
  const { currentLanguage } = useLanguage();

  const t = (key) => {
    try {
      return translations[currentLanguage][key] || translations['en'][key] || key;
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  };

  return { t };
} 