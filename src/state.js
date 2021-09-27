import onChange from 'on-change';
import { renderSource, renderForm, renderPost, updatePost, renderModal } from './render';

const state = {
  form: {
    state: 'initial',
    message: '',
  },
  feeds: {
    sources: [],
    posts: [],
  },
  modal: {
    state: 'hidden',
    postId: 0,
  },
};

const watchedState = onChange(state, (path, value, prev, curr) => {
  if (value) {
    if (path === 'form.state') {
      renderForm(state.form);
    }
    if (path === 'feeds.sources') {
      const sourceData = { id: state.feeds.sources.length - 1, ...value[0] };
      renderSource(sourceData);
    }
    if (path === 'feeds.posts') {
      const postData = { id: state.feeds.posts.length - 1, ...value[0] };
      renderPost(postData);
    }
    if (path.match(/feeds.posts.\d.visited/)) {
      const postId = parseInt(path.match(/\d/)[0], 10);
      updatePost(postId);
    }
    if (path === 'modal') {
      const modal = value;
      const post = state.feeds.posts.find((_, id) => id === parseInt(modal.postId, 10));
      renderModal(post);
    }
  }
});

export default watchedState;
