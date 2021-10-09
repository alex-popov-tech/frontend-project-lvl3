import { i18next } from './setup';
import { $ } from './helpers';

export const renderForm = (formState) => {
  const feedback = $('.feedback');
  switch (formState.state) {
    case 'submitted':
      $('#url').readOnly = true;
      $('button[type="submit"]').disabled = true;
      break;
    case 'invalid':
      $('#url').readOnly = false;
      $('button[type="submit"]').disabled = false;
      $('#url').classList.add('is-invalid');
      $('#url').classList.remove('is-valid');
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
      feedback.textContent = formState.message;
      break;
    case 'valid':
      $('#url').readOnly = false;
      $('button[type="submit"]').disabled = false;
      $('#url').classList.add('is-valid');
      $('#url').classList.remove('is-invalid');
      $('#url').value = '';
      $('#url').focus();
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = formState.message;
      break;
    default:
      throw new Error(`Unexpected form state ${formState.state}`);
  }
};

export const renderSource = ({ id, title, description }) => {
  const container = $('.feeds');
  if (id === 0) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    container.append(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.innerHTML = `<h2 class="card-title h4">${i18next.t('feeds.title')}</h2>`;
    card.append(cardBody);
    const feedsContainer = document.createElement('ul');
    feedsContainer.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(feedsContainer);
  }
  const feedContainer = document.createElement('li');
  feedContainer.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedContainer.innerHTML = [
    `<h3 class="h6 m-0">${title}</h3>`,
    `<p class="m-0 small text-black-50">${description}</p>`,
  ].join('\n');
  $(container, 'ul').after(feedContainer);
};

export const renderPost = ({ id, title, url }) => {
  const container = $('.posts');
  if (id === 0) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    container.append(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.innerHTML = `<h3 class="card-title h4">${i18next.t('feeds.posts.title')}</h3>`;
    card.append(cardBody);
    const feedsContainer = document.createElement('ul');
    feedsContainer.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(feedsContainer);
  }
  const postContainer = document.createElement('li');
  $(container, 'ul').prepend(postContainer);
  postContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  const link = document.createElement('a');
  link.classList.add('fw-bold');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = title;
  link.dataset.id = id;

  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18next.t('feeds.posts.viewButton');
  button.dataset.id = id;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';

  postContainer.append(link, button);
};

export const updatePost = (postId) => {
  const post = $(`a[data-id="${postId}"`);
  post.classList.replace('fw-bold', 'fw-normal');
};

export const renderModal = ({ title, url, description }) => {
  const header = $('#modal .modal-header');
  header.innerHTML = `<h5 class='modal-title'>${title}</h5>`;
  const body = $('#modal .modal-body');
  body.innerHTML = description;
  const footerReadButton = $('#modal .full-article');
  footerReadButton.href = url;
};
