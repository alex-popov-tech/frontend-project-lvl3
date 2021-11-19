export default () => ({
  form: {
    state: 'initial',
    message: '',
  },
  feeds: [],
  items: [],
  visitedItems: [],
  modal: {
    state: 'hidden',
    itemId: 0,
  },
});
