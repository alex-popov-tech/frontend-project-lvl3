import onChange from 'on-change';
import { renderSources, renderForm, renderPosts } from './render';

const state = {
  form: {
    state: 'initial',
    message: '',
  },
  feeds: {
    state: 'empty',
    sources: [],
    posts: [],
  },
};

const watchedState = onChange(state, (path, value, prev, curr) => {
  if (value) {
    const isFirstFeed = state.feeds.state === 'filledWithOne';
    if (path === 'form.state') {
      renderForm(state.form);
    }
    if (path === 'feeds.sources') {
      renderSources(state.feeds.sources, { isFirstFeed });
    }
    if (path === 'feeds.posts') {
      renderPosts(curr.args, { isFirstFeed });
    }
  }
});

export default watchedState;
