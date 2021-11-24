import onChange from 'on-change';

const updateForm = ({ feedback, url, submit }, formState, i18next) => {
  switch (formState.state) {
    case 'submitted':
      url.readOnly = true;
      submit.disabled = true;
      break;
    case 'invalid':
      url.readOnly = false;
      submit.disabled = false;
      url.classList.add('is-invalid');
      url.classList.remove('is-valid');
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
      feedback.textContent = i18next.t(formState.message);
      break;
    case 'valid':
      url.readOnly = false;
      submit.disabled = false;
      url.classList.add('is-valid');
      url.classList.remove('is-invalid');
      url.value = '';
      url.focus();
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t(formState.message);
      break;
    default:
      throw new Error(`Unexpected form state ${formState.state}`);
  }
};

const renderFeed = (container, { isFirst, id, title, description }, i18next) => {
  if (isFirst) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    container.append(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.innerHTML = `<h2 class="card-title h4">${i18next.t('feeds.title')}</h2>`;
    card.append(cardBody);
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(feedsList);
  }
  const feedContainer = document.createElement('li');
  feedContainer.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedContainer.innerHTML = [
    `<h3 class="h6 m-0">${title}</h3>`,
    `<p class="m-0 small text-black-50">${description}</p>`,
  ].join('\n');
  container.querySelector('ul').after(feedContainer);
};

const renderItem = (container, { isFirst, id, title, link: href }, i18next) => {
  if (isFirst) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    container.append(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.innerHTML = `<h3 class="card-title h4">${i18next.t('feeds.items.title')}</h3>`;
    card.append(cardBody);
    const feedsContainer = document.createElement('ul');
    feedsContainer.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(feedsContainer);
  }
  const itemContainer = document.createElement('li');
  container.querySelector('ul').prepend(itemContainer);
  itemContainer.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0'
  );
  const link = document.createElement('a');
  link.classList.add('fw-bold');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = title;
  link.dataset.id = id;

  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18next.t('feeds.items.viewButton');
  button.dataset.id = id;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';

  itemContainer.append(link, button);
};

const updateItem = (container, itemId) => {
  const post = container.querySelector(`a[data-id="${itemId}"`);
  post.classList.replace('fw-bold', 'fw-normal');
};

const renderModal = ({ header, body, footerButton }, { title, link, description }) => {
  header.innerHTML = `<h5 class='modal-title'>${title}</h5>`;
  body.innerHTML = description;
  footerButton.href = link;
};

export default (elements, state, i18next) => {
  const { modal, form, feeds, items } = elements;

  return onChange(state, (path, value, prev, apply) => {
    if (value) {
      switch (path) {
        case 'form': {
          updateForm(elements.form, state.form, i18next);
          break;
        }
        case 'feeds': {
          const feed = apply.args[0];
          const isFirst = state.feeds.length === 1;
          renderFeed(elements.feeds, { isFirst, ...feed}, i18next);
          break;
        }
        case 'items': {
          const item = apply.args[0];
          const isFirst = state.items.length === 1;
          renderItem(elements.items, { isFirst, ...item}, i18next);
          break;
        }
        case 'visitedItems': {
          const { itemId } = apply.args[0];
          updateItem(elements.items, itemId);
          break;
        }
        case 'modal': {
          const { itemId } = value;
          const item = state.items.find(({ id }) => id === itemId);
          renderModal(elements.modal, item);
          break;
        }
      }
    }
  });
};
