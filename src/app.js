import { string, object, array } from 'yup';
import axios from 'axios';
import { i18next } from './setup';
import getState from './state';
import { $, $$ } from './helpers';

const FEED_PULL_INTERVAL = 5 * 1000;

const startFeedPulling = (state, url, interval) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then(({ data }) => {
    const rssDom = new DOMParser().parseFromString(data.contents, 'application/xml');
    const title = $(rssDom, 'channel title')?.textContent;
    const link = $(rssDom, 'channel link')?.textContent;
    const description = $(rssDom, 'channel description')?.textContent;
    const posts = Array.from($$(rssDom, 'channel item'))
      .map((item) => ({ title: $(item, 'title')?.textContent, description: $(item, 'description')?.textContent, url: $(item, 'link')?.textContent }));

    const result = {
      url, link, title, description, posts,
    };

    return object().shape({
      url: string().url().required(),
      link: string().url().required(),
      title: string().required(),
      description: string().required(),
      posts: array().required(),
    }).validate(result).then(() => result);
  })
  .then((source) => {
    if (!state.feeds.sources.find((it) => source.url === it.url)) {
      state.form.message = i18next.t('success');
      state.form.state = 'valid';
      state.feeds.sources.unshift(source);
    }

    source.posts
      .filter((pulledPost) => !state.feeds.posts
        .map((existingPost) => existingPost.url).includes(pulledPost.url))
      .forEach((post) => state.feeds.posts.unshift(post));

    setTimeout(() => startFeedPulling(state, url, interval), interval);
  })
  .catch((err) => {
    state.form.state = 'invalid';
    state.form.message = i18next.t('errors.invalidUrl');
    throw err;
  });

export default () => {
  const state = getState();
  $('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    const urlSchema = string().url().notOneOf(state.feeds.sources.map((it) => it.url));

    urlSchema.validate(url)
      .then(() => {
        startFeedPulling(state, url, FEED_PULL_INTERVAL);
      })
      .catch((validationError) => {
        state.form.message = validationError.errors[0];
        state.form.state = 'invalid';
      });
  });
  $('.posts').addEventListener('click', (event) => {
    const { target: { tagName, dataset: { id, bsToggle } } } = event;
    if (tagName === 'BUTTON' && bsToggle === 'modal') {
      event.preventDefault();
      state.modal = {
        postId: id,
        state: 'visible',
      };
      state.feeds.posts[parseInt(id, 10)].visited = true;
    }
  });
};
