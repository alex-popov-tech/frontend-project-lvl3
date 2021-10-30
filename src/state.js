import onChange from 'on-change';
import { renderSource, renderForm, renderPost, updatePost, renderModal } from './render';

export default () => {
  const state = {
    form: {
      state: 'initial',
      message: '',
    },
    sources: [],
    // post data, sourceId
    posts: [],
    //  { postId }
    visitedPosts: [],
    modal: {
      state: 'hidden',
      postId: 0,
    },
  };

  const watchedState = onChange(state, (path, value) => {
    if (value) {
      if (path === 'form') {
        renderForm(state.form);
      }
      if (path === 'sources') {
        const sourceData = { id: state.sources.length - 1, ...value[0] };
        renderSource(sourceData);
      }
      if (path === 'posts') {
        const post = value[0];
        post.id = state.posts.length - 1;
        renderPost(post);
      }
      if (path === 'visitedPosts') {
        const { postId } = value[0];
        updatePost(postId);
      }
      if (path === 'modal') {
        const modal = value;
        const post = state.posts.find(({ id }) => id === parseInt(modal.postId, 10));
        renderModal(post);
      }
    }
  });
  return watchedState;
};
