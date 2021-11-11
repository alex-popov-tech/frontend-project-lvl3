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
    items: [],
    //  { postId }
    visitedItems: [],
    modal: {
      state: 'hidden',
      postId: 0,
    },
  };

  const watchedState = onChange(state, (path, value) => {
    if (value) {
      switch (path) {
        case 'form': {
          renderForm(state.form);
          break;
        }
        case 'sources': {
          const sourceData = { id: `${state.sources.length - 1}`, ...value[0] };
          renderSource(sourceData);
          break;
        }
        case 'items': {
          const post = { ...value[0], id: `${state.items.length - 1}` };
          renderPost(post);
          break;
        }
        case 'visitedItems': {
          const { itemId } = value[0];
          updatePost(itemId);
          break;
        }
        case 'modal': {
          const modal = value;
          const post = state.items[parseInt(modal.itemId, 10)];
          renderModal(post);
          break;
        }
      }
    }
  });
  return watchedState;
};
