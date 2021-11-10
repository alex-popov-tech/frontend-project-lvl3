import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import { string } from 'yup';
import axios from 'axios';
import getState from './state';
import { $, $$ } from './helpers';
import initI18next from './locale';

const FEED_PULL_INTERVAL = 10 * 1000;

const validateUrl = (url, existingUrls) =>
  string()
    .url()
    .notOneOf(existingUrls.map((it) => it.url))
    .validate(url);

const parseRssContent = (content) => {
  const rssDom = new DOMParser().parseFromString(content, 'application/xml');
  const title = $(rssDom, 'channel title').textContent;
  const link = $(rssDom, 'channel link').textContent;
  const description = $(rssDom, 'channel description').textContent;
  const items = Array.from($$(rssDom, 'channel item')).map((item) => ({
    title: $(item, 'title').textContent,
    description: $(item, 'description').textContent,
    link: $(item, 'link').textContent,
  }));

  return {
    link,
    title,
    description,
    items,
  };
};

const startPulling = (state, url, interval) =>
  axios
    .get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}&disableCache=true`)
    .then(({ data: { contents } }) => ({ ...parseRssContent(contents) }))
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        state.form = {
          message: 'errors.network',
          state: 'invalid',
        };
      }
      state.form = {
        message: 'errors.content',
        state: 'invalid',
      };
    })
    .then((source) => {
      if (!state.sources.find((it) => source.link === it.link)) {
        state.form = {
          message: 'success',
          state: 'valid',
        };
        state.sources.unshift(source);
      }

      const newPosts = source.items
        .filter((pulledPost) => !state.items.map((existingPost) => existingPost.url).includes(pulledPost.url))
        .reverse();
      newPosts.forEach((post) => state.items.unshift(post));

      setTimeout(() => startPulling(state, url, interval), interval);
    });

const addListeners = (state) => {
  $('form').addEventListener('submit', (event) => {
    event.preventDefault();
    state.form = {
      state: 'submitted',
      message: '',
    };
    const url = new FormData(event.target).get('url');
    validateUrl(
      url,
      state.sources.map(({ url: existingUrl }) => existingUrl)
    )
      .catch((validationError) => {
        state.form = {
          message: validationError.errors[0],
          state: 'invalid',
        };
      })
      .then(() => startPulling(state, url, FEED_PULL_INTERVAL));
  });
  $('.posts').addEventListener('click', (event) => {
    event.preventDefault();
    const {
      target: {
        tagName,
        dataset: { id, bsToggle },
      },
    } = event;
    if (tagName === 'BUTTON' && bsToggle === 'modal') {
      state.visitedItems.push({ itemId: id });
      state.modal = {
        itemId: id,
        state: 'visible',
      };
    }
  });
};

export default () => {
  const state = getState();
  initI18next();
  addListeners(state);
};
