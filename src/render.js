import { i18next } from './setup';
import { $ } from './helpers';

export const renderForm = (formState) => {
  $('.text-muted').nextElementSibling?.remove();
  const message = document.createElement('p');
  message.classList.add('feedback', 'm-0', 'position-absolute', 'small');
  message.innerText = formState.message;
  if (formState.state === 'invalid') {
    $('#url').classList.add('is-invalid');
    message.classList.add('text-danger');
  } else {
    $('#url').classList.remove('is-invalid');
    $('#url').value = '';
    $('#url').focus();
    message.classList.add('text-success');
  }
  $('.text-muted').after(message);
};

export const renderSources = (sources, { isFirstFeed }) => {
  const container = $('.feeds');
  if (isFirstFeed) {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    container.append(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.innerHTML = `<h3 class="card-title h4">${i18next.t('feeds.title')}</h3>`;
    card.append(cardBody);
    const feedsContainer = document.createElement('ul');
    feedsContainer.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(feedsContainer);
  }
  const latestSource = sources[0];
  const feedContainer = document.createElement('li');
  feedContainer.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedContainer.innerHTML = [
    `<h3 class="h6 m-0">${latestSource.title}</h3>`,
    `<p class="m-0 small text-black-50">${latestSource.description}</p>`,
  ].join('\n');
  $(container, 'ul').after(feedContainer);
};

export const renderPosts = (postsToAdd, { isFirstFeed }) => {
  const container = $('.posts');
  if (isFirstFeed) {
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
  postsToAdd.map(({ link, title }) => {
    const postsContainer = document.createElement('li');
    postsContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    postsContainer.innerHTML = [
      `<a href="${link}" class="fw-bold" data-id="3" target="_blank" rel="noopener noreferrer">${title}</a>`,
      '<button type="button" class="btn btn-outline-primary btn-sm" data-id="3" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>',
    ].join('\n');
    return postsContainer;
  }).forEach((li) => $(container, 'ul').after(li));
};
