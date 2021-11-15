import onChange from 'on-change';
import { renderSource, renderForm, renderPost, updatePost, renderModal } from './render';

export default () => {
  const state = {
    form: {
      state: 'initial',
      message: '',
    },
    sources: [],
    items: [],
    visitedItems: [],
    modal: {
      state: 'hidden',
      postId: 0,
    },
  };

  const watchedState = onChange(state, (path, value, prev, apply) => {
    if (value) {
      switch (path) {
        case 'form': {
          renderForm(state.form);
          break;
        }
        case 'sources': {
          const sourceData = apply.args[0];
          sourceData.id = `${state.sources.length - 1}`;
          renderSource(sourceData);
          break;
        }
        case 'items': {
          const post = apply.args[0];
          post.id = `${state.items.length - 1}`;
          renderPost(post);
          break;
        }
        case 'visitedItems': {
          const { itemId } = apply.args[0];
          updatePost(itemId);
          break;
        }
        case 'modal': {
          const modal = value;
          const post = state.items.find(({ id }) => id === modal.itemId);
          renderModal(post);
          break;
        }
      }
    }
  });
  return watchedState;
};
