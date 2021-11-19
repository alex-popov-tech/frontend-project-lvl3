import axios from 'axios';
import { pullRss, parseRss, validateUrl } from './helpers';

const FEED_PULL_INTERVAL = 10 * 1000;

const getNewPosts = (pulledItems, existingItems) =>
  pulledItems.filter((pulledItem) => !existingItems.map(({ link }) => link).includes(pulledItem.link));

const startUpdatingFeed = (state, url) =>
  pullRss(url).then((content) => {
    const source = parseRss(content);
    const newPosts = getNewPosts(source.items, state.items);
    newPosts.reverse().forEach((item) => state.items.unshift(item));
    setTimeout(() => startUpdatingFeed(state, url), FEED_PULL_INTERVAL);
  });

const addFormListener = (elements, state) =>
  elements.form.container.addEventListener('submit', (event) => {
    event.preventDefault();
    state.form = {
      state: 'submitted',
      message: '',
    };
    const url = new FormData(event.target).get('url');
    const existingUrls = state.feeds.map(({ link }) => link);
    validateUrl(url, existingUrls)
      .then(() => {
        return pullRss(url);
      })
      .then((content) => {
        return parseRss(content);
      })
      .then((feed) => {
        if (!state.feeds.find((it) => feed.link === it.link)) {
          state.form = {
            message: 'success',
            state: 'valid',
          };
          state.feeds.unshift(feed);
        }

        const newItems = getNewPosts(feed.items, state.items);
        newItems.reverse().forEach((item) => state.items.unshift(item));

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

const addItemsListener = (elements, state) =>
  elements.items.addEventListener('click', (event) => {
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

export default (elements, state) => {
  addFormListener(elements, state);
  addItemsListener(elements, state);
};
