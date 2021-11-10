import { setLocale } from 'yup';
import i18next from 'i18next';
import ru from './ru';

export default () => {
  i18next.init({
    lng: 'ru', // if you're using a language detector, do not define the lng option
    debug: true,
    resources: {
      ru,
    },
  });
  setLocale({
    string: {
      url: i18next.t('errors.url'),
    },
    mixed: {
      notOneOf: i18next.t('errors.exists'),
    },
  });
};
