import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import getState from './state';
import addStateListeners from './view';
import addEventListeners from './listeners';
import initI18next from './locale';

export default () => {
  const elements = {
    form: {
      container: document.querySelector('form'),
      feedback: document.querySelector('.feedback'),
      url: document.querySelector('#url'),
      submit: document.querySelector('button[type="submit"]'),
    },
    items: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: {
      header: document.querySelector('#modal .modal-header'),
      body: document.querySelector('#modal .modal-body'),
      footerButton: document.querySelector('#modal .full-article'),
    },
  };
  const i18next = initI18next();
  const state = getState();
  const watchedState = addStateListeners(elements, state, i18next);
  addEventListeners(elements, watchedState);
};
