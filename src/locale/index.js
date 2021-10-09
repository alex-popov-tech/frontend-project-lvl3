import i18next from 'i18next';
import ru from './ru';

i18next.init({
  lng: 'ru', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    ru,
  },
});

export default i18next;
