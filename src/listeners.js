import _ from 'lodash';
import { pullRss, parseRss, validateUrl } from './helpers';

const FEED_PULL_INTERVAL = 10 * 1000;

const getNewPosts = (pulledItems, existingItems) => {
  const existingItemLinks = existingItems.map(({ link }) => link);
  return pulledItems.filter((pulledItem) => !existingItemLinks.includes(pulledItem.link));
};

const startUpdatingFeed = (state, url) => pullRss(url).then((content) => {
  const source = parseRss(content);
  const newPosts = getNewPosts(source.items, state.items);
  newPosts.reverse().forEach((item) => state.items.unshift(item));
})
  .finally(() => setTimeout(() => startUpdatingFeed(state, url), FEED_PULL_INTERVAL));

const addFormListener = (elements, state) => elements.form.container.addEventListener('submit', (event) => {
  event.preventDefault();
  state.form = {
    state: 'submitted',
    message: '',
  };
  const url = new FormData(event.target).get('url');
  const existingUrls = state.feeds.map(({ link }) => link);
  validateUrl(url, existingUrls)
    .then(() => pullRss(url))
    .then((content) => {
      const feed = parseRss(content);
      if (!state.feeds.find((it) => feed.link === it.link)) {
        state.form = {
          message: 'success',
          state: 'valid',
        };
        state.feeds.unshift({ id: _.uniqueId(), ...feed });
      }

      const newItems = getNewPosts(feed.items, state.items);
      newItems.reverse().forEach((item) => state.items.unshift({ id: _.uniqueId(), ...item }));

      setTimeout(() => startUpdatingFeed(state, url), FEED_PULL_INTERVAL);
    })
    .catch((error) => {
      if (error.isAxiosError) {
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

const addItemsListener = (elements, state) => elements.items.addEventListener('click', (event) => {
  const {
    target: {
      tagName,
      dataset: { id, bsToggle },
    },
  } = event;
  if (['A', 'BUTTON'].includes(tagName)) {
    state.visitedItems.push(id);
    if (bsToggle === 'modal') {
      event.preventDefault();
      state.modal = {
        itemId: id,
        state: 'visible',
      };
    }
  }
});

export default (elements, state) => {
  addFormListener(elements, state);
  addItemsListener(elements, state);
};
