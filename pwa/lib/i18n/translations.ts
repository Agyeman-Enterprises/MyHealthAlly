/**
 * UI Text Translations
 * Basic translation dictionary for common UI elements
 * Can be extended with full translation files later
 */

export type TranslationKey = 
  | 'settings.title'
  | 'settings.language'
  | 'settings.notifications'
  | 'settings.appearance'
  | 'settings.profile'
  | 'settings.security'
  | 'settings.devices'
  | 'settings.help'
  | 'settings.contact'
  | 'settings.legal'
  | 'language.title'
  | 'language.description'
  | 'language.save'
  | 'language.saved'
  | 'common.save'
  | 'common.cancel'
  | 'common.loading'
  | 'common.error'
  | 'common.success';

const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Appearance',
    'settings.profile': 'Profile',
    'settings.security': 'Security',
    'settings.devices': 'Connected Devices',
    'settings.help': 'Help & FAQ',
    'settings.contact': 'Contact Us',
    'settings.legal': 'Terms & Privacy',
    'language.title': 'Language',
    'language.description': 'Choose your preferred language for the app',
    'language.save': 'Save Preference',
    'language.saved': 'Language preference saved.',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading…',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  es: {
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.appearance': 'Apariencia',
    'settings.profile': 'Perfil',
    'settings.security': 'Seguridad',
    'settings.devices': 'Dispositivos Conectados',
    'settings.help': 'Ayuda y Preguntas Frecuentes',
    'settings.contact': 'Contáctenos',
    'settings.legal': 'Términos y Privacidad',
    'language.title': 'Idioma',
    'language.description': 'Elija su idioma preferido para la aplicación',
    'language.save': 'Guardar Preferencia',
    'language.saved': 'Preferencia de idioma guardada.',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.loading': 'Cargando…',
    'common.error': 'Error',
    'common.success': 'Éxito',
  },
  ko: {
    'settings.title': '설정',
    'settings.language': '언어',
    'settings.notifications': '알림',
    'settings.appearance': '외관',
    'settings.profile': '프로필',
    'settings.security': '보안',
    'settings.devices': '연결된 기기',
    'settings.help': '도움말 및 FAQ',
    'settings.contact': '문의하기',
    'settings.legal': '약관 및 개인정보',
    'language.title': '언어',
    'language.description': '앱의 기본 언어를 선택하세요',
    'language.save': '선호도 저장',
    'language.saved': '언어 선호도가 저장되었습니다.',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.loading': '로딩 중…',
    'common.error': '오류',
    'common.success': '성공',
  },
  ch: {
    'settings.title': 'Settings',
    'settings.language': 'Lengguahe',
    'settings.notifications': 'Notifikasion',
    'settings.appearance': 'Apariensia',
    'settings.profile': 'Perfil',
    'settings.security': 'Seguridat',
    'settings.devices': 'Dispositivos Konektadu',
    'settings.help': 'Ayuda y FAQ',
    'settings.contact': 'Kontakta',
    'settings.legal': 'Términos y Privasidat',
    'language.title': 'Lengguahe',
    'language.description': 'Ayek i lengguahe-mu preferensia para i app',
    'language.save': 'Na&apos;setbe i Preferensia',
    'language.saved': 'Ma&apos;setbe i lengguahe preferensia.',
    'common.save': 'Na&apos;setbe',
    'common.cancel': 'Kansela',
    'common.loading': 'Kakarga…',
    'common.error': 'Error',
    'common.success': 'Éxito',
  },
};

/**
 * Get translation for a key in the specified language
 * Falls back to English if translation not found
 */
export function getTranslation(key: TranslationKey, lang: string = 'en'): string {
  const langTranslations = translations[lang] || translations['en'];
  if (!langTranslations) {
    return key;
  }
  return langTranslations[key] || translations['en']?.[key] || key;
}

/**
 * Get all translations for a language
 */
export function getTranslations(lang: string = 'en'): Record<TranslationKey, string> {
  const langTranslations = translations[lang];
  if (langTranslations) {
    return langTranslations;
  }
  const enTranslations = translations['en'];
  if (enTranslations) {
    return enTranslations;
  }
  // Fallback - should never happen but satisfies TypeScript
  return {} as Record<TranslationKey, string>;
}
