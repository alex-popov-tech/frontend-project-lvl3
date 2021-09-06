import { setLocale } from 'yup';
import i18next from 'i18next';

i18next.init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: {
        feeds: {
          title: 'Фиды',
          posts: {
            title: 'Посты',
          },
        },
        errors: {
          url: 'Ссылка должна быть валидным URL',
          exists: 'RSS уже существует',
        },
        success: 'RSS успешно загружен',
      },
    },
  },
});

setLocale({
  string: {
    url: i18next.t('errors.url'),
    notOneOf: i18next.t('errors.exists'),
  },
});

export { i18next };
