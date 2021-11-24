import { setLocale } from 'yup';
import i18next from 'i18next';
import ru from './ru';

export default () => {
  const instance = i18next.createInstance();
  instance.init({
    lng: 'ru', // if you're using a language detector, do not define the lng option
    debug: true,
    resources: {
      ru,
    },
  });
  setLocale({
    string: {
      url: instance.t('errors.url'),
    },
    mixed: {
      notOneOf: instance.t('errors.exists'),
    },
  });
  return instance;
};
