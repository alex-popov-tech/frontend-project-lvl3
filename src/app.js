import { string } from 'yup';
import axios from 'axios';
import { i18next } from './setup';
import state from './state';
import { $, $$ } from './helpers';

const FEED_PULL_INTERVAL = 5 * 1000;

const pullFeed = (feedUrl) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(feedUrl)}`).then(({ data }) => {
  const rssDom = new DOMParser().parseFromString(data.contents, 'application/xml');
  const title = $(rssDom, 'channel title').textContent;
  const url = $(rssDom, 'channel link').textContent;
  const description = $(rssDom, 'channel description').textContent;
  const posts = Array.from($$(rssDom, 'channel item'))
    .map((item, i) => ({ title: $(item, 'title').textContent, description: $(item, 'description').textContent, url: $(item, 'link').textContent }));

  return {
    url, title, description, posts,
  };
});

const startFeedPulling = (url, interval) => pullFeed(url)
  .then((source) => {
    if (!state.feeds.sources.find((it) => source.url === it.url)) {
      state.feeds.sources.unshift(source);
    }

    source.posts
      .filter((pulledPost) => !state.feeds.posts
        .map((existingPost) => existingPost.url).includes(pulledPost.url))
      .forEach((post) => state.feeds.posts.unshift(post));
  }).finally(() => setTimeout(() => startFeedPulling(url, interval), interval));

export default () => {
  $('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    const urlSchema = string().url().notOneOf(state.feeds.sources.map((it) => it.url));

    urlSchema.validate(url)
      .catch((validationError) => {
        state.form.message = validationError.errors;
        state.form.state = 'invalid';
      })
      .then(() => {
        state.form.message = i18next.t('success');
        state.form.state = 'submited';
        startFeedPulling(url, FEED_PULL_INTERVAL);
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
