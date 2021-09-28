import { string } from 'yup';
import axios from 'axios';
import { i18next } from './setup';
import getState from './state';
import { $, $$ } from './helpers';

const FEED_PULL_INTERVAL = 5 * 1000;

const pullFeed = (feedUrl) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feedUrl)}`).then(({ data }) => {
  const rssDom = new DOMParser().parseFromString(data.contents, 'application/xml');
  const title = $(rssDom, 'channel title').textContent;
  const link = $(rssDom, 'channel link').textContent;
  const description = $(rssDom, 'channel description').textContent;
  const posts = Array.from($$(rssDom, 'channel item'))
    .map((item, i) => ({ title: $(item, 'title').textContent, description: $(item, 'description').textContent, url: $(item, 'link').textContent }));

  return {
    url: feedUrl, link, title, description, posts,
  };
});

const startFeedPulling = (state, url, interval) => pullFeed(url)
  .then((source) => {
    if (!state.feeds.sources.find((it) => source.url === it.url)) {
      state.form.message = i18next.t('success');
      state.form.state = 'submitted';
      state.feeds.sources.unshift(source);
    }

    source.posts
      .filter((pulledPost) => !state.feeds.posts
        .map((existingPost) => existingPost.url).includes(pulledPost.url))
      .forEach((post) => state.feeds.posts.unshift(post));
  }).finally(() => setTimeout(() => startFeedPulling(state, url, interval), interval));

export default () => {
  const state = getState();
  $('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    const urlSchema = string().url().notOneOf(state.feeds.sources.map((it) => it.url));

    urlSchema.validate(url)
      .then(() => {
        state.form.state = 'valid';
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
