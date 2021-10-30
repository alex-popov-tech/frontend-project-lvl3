import { string, object, array } from 'yup';
import axios from 'axios';
import i18next from './setup';
import getState from './state';
import { $, $$ } from './helpers';

const FEED_PULL_INTERVAL = 10 * 1000;

const validateUrl = (state, url) =>
  string()
    .url()
    .notOneOf(state.sources.map((it) => it.url))
    .validate(url)
    .catch((validationError) => {
      state.form = {
        message: validationError.errors[0],
        state: 'invalid',
      };
      throw validationError;
    });

const startPulling = (state, url, interval) =>
  axios
    .get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}&disableCache=true`)
    .catch((networkError) => {
      state.form = {
        message: i18next.t('errors.network'),
        state: 'invalid',
      };
      setTimeout(() => startPulling(state, url, interval), interval);
      throw networkError;
    })
    .then(({ data: { contents } }) => {
      try {
        const rssDom = new DOMParser().parseFromString(contents, 'application/xml');
        const title = $(rssDom, 'channel title').textContent;
        const link = $(rssDom, 'channel link').textContent;
        const description = $(rssDom, 'channel description').textContent;
        const posts = Array.from($$(rssDom, 'channel item')).map((item) => ({
          title: $(item, 'title').textContent,
          description: $(item, 'description').textContent,
          link: $(item, 'link').textContent,
        }));

        const result = {
          url,
          link,
          title,
          description,
          posts,
        };

        return result;
      } catch (contentError) {
        state.form = {
          message: i18next.t('errors.content'),
          state: 'invalid',
        };
        throw contentError;
      }
    })
    .then((source) => {
      if (!state.sources.find((it) => source.url === it.url)) {
        state.form = {
          message: i18next.t('success'),
          state: 'valid',
        };
        state.sources.unshift(source);
      }

      const newPosts = source.posts
        .filter((pulledPost) => !state.posts.map((existingPost) => existingPost.url).includes(pulledPost.url))
        .reverse();
      newPosts.forEach((post) => state.posts.unshift(post));

      setTimeout(() => startPulling(state, url, interval), interval);
    });

export default () => {
  const state = getState();
  $('form').addEventListener('submit', (event) => {
    event.preventDefault();
    state.form = {
      state: 'submitted',
      message: '',
    };
    const url = new FormData(event.target).get('url');
    validateUrl(state, url)
      .then(() => startPulling(state, url, FEED_PULL_INTERVAL))
      .catch(() => {
        /* NOP */
      });
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
      state.visitedPosts.push({ postId: id });
      state.modal = {
        postId: id,
        state: 'visible',
      };
    }
  });
};
