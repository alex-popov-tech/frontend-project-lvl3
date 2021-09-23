import { setLocale } from 'yup';
import { i18next } from './locale';

setLocale({
  string: {
    url: i18next.t('errors.url'),
    notOneOf: i18next.t('errors.exists'),
  },
});

export { i18next };
