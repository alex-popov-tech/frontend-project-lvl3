import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import { string, mixed } from 'yup';
import axios from 'axios';
import getState from './state';
import { $, $$ } from './helpers';
import initI18next from './locale';

const FEED_PULL_INTERVAL = 10 * 1000;

const validateUrl = (url, existingUrls) =>
  string()
    .url()
    .validate(url)
    .then(() =>
      mixed()
        .notOneOf(existingUrls.map((it) => new URL(it).origin))
        .validate(new URL(url).origin)
    )
    .then(
      (args) => {
        console.log(`then called with ${args}`);
        return url;
      },
      (err) => {
        console.log(`catch called with ${err}`);
        throw err;
      }
    );

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

const pullRss = (url) =>
  axios
    .get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}&disableCache=true`)
    .then(({ data: { contents } }) => contents);

const getNewPosts = (pulledItems, existingItems) =>
  pulledItems.filter((pulledItem) => !existingItems.map(({ link }) => link).includes(pulledItem.link));

const startUpdatingFeed = (state, url) =>
  pullRss(url)
    .then(parseRssContent)
    .then((source) => {
      const newPosts = getNewPosts(source.items, state.items);
      newPosts.reverse().forEach((item) => state.items.unshift(item));
      setTimeout(() => startUpdatingFeed(state, url), FEED_PULL_INTERVAL);
    });

const addListeners = (state) => {
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

  $('form').addEventListener('submit', (event) => {
    event.preventDefault();
    state.form = {
      state: 'submitted',
      message: '',
    };
    const url = new FormData(event.target).get('url');
    const existingUrls = state.sources.map(({ link }) => link);
    validateUrl(url, existingUrls)
      .then(() => pullRss(url))
      .then((content) => parseRssContent(content))
      .then((source) => {
        if (!state.sources.find((it) => source.link === it.link)) {
          state.form = {
            message: 'success',
            state: 'valid',
          };
          state.sources.unshift(source);
        }
        const newPosts = getNewPosts(source.items, state.items);
        newPosts.reverse().forEach((item) => state.items.unshift(item));

        setTimeout(() => startUpdatingFeed(state, url), FEED_PULL_INTERVAL);
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          state.form = {
            message: 'errors.network',
            state: 'invalid',
          };
        } else if (error.name === 'ValidationError') {
          state.form = {
            message: error.errors[0],
            state: 'invalid',
          };
        } else {
          state.form = {
            message: 'errors.content',
            state: 'invalid',
          };
        }
      });
  });
};

export default () => {
  const state = getState();
  initI18next();
  addListeners(state);
};
