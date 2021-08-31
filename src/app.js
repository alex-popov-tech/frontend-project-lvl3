import { string, setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';

i18next.init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: {
        feeds: {
          title: 'Фиды',
          posts: {
            title: 'Посты',
          },
        },
        errors: {
          url: 'Ссылка должна быть валидным URL',
          exists: 'RSS уже существует',
        },
        success: 'RSS успешно загружен',
      },
    },
  },
});

setLocale({
  string: {
    url: i18next.t('errors.url'),
    notOneOf: i18next.t('errors.exists'),
  },
});

const $$ = (selectorOrContext, selector) => (selector
  ? selectorOrContext.querySelectorAll(selector)
  : document.querySelectorAll(selectorOrContext));
const $ = (selectorOrContext, selector) => $$(selectorOrContext, selector)[0];

const renderForm = (state) => {
  $('.text-muted').nextElementSibling?.remove();
  const message = document.createElement('p');
  message.classList.add('feedback', 'm-0', 'position-absolute', 'small');
  message.innerText = state.message;
  if (state.state === 'invalid') {
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

const renderFeeds = (feeds) => {
  const container = $('.feeds');
  if (feeds.state === 'filledWithOne') {
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
  const latestSource = feeds.sources[0];
  const feedContainer = document.createElement('li');
  feedContainer.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedContainer.innerHTML = [
    `<h3 class="h6 m-0">${latestSource.title}</h3>`,
    `<p class="m-0 small text-black-50">${latestSource.description}</p>`,
  ].join('\n');
  $(container, 'ul').after(feedContainer);
};

const renderPosts = (feeds) => {
  const container = $('.posts');
  if (feeds.state === 'filledWithOne') {
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
  const latestSource = feeds.sources[0];
  latestSource.posts.map(({ link, title }) => {
    const postsContainer = document.createElement('li');
    postsContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    postsContainer.innerHTML = [
      `<a href="${link}" class="fw-bold" data-id="3" target="_blank" rel="noopener noreferrer">${title}</a>`,
      '<button type="button" class="btn btn-outline-primary btn-sm" data-id="3" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>',
    ].join('\n');
    return postsContainer;
  }).forEach((li) => $(container, 'ul').before(li));
};

const state = onChange({
  form: {
    state: 'initial',
    message: '',
  },
  feeds: {
    state: 'empty',
    sources: [],
  },
}, function (path, value, prev, curr) {
  if (path === 'form.state') {
    renderForm(this.form);
  }
  if (path === 'feeds.state') {
    renderFeeds(this.feeds);
    renderPosts(this.feeds);
  }
});

export default () => {
  $('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    const urlSchema = string().url().notOneOf(state.feeds.sources.map((it) => it.url));

    urlSchema.validate(url)
      .catch((validationError) => {
        state.form.message = validationError.errors;
        state.form.state = 'invalid';
      })
      .then(() => {
        state.form.message = i18next.t('success');
        state.form.state = 'submited';
        return axios.get(url).then(({ data }) => {
          const rssDom = new DOMParser().parseFromString(data, 'application/xml');
          const title = $(rssDom, 'channel title').textContent;
          const feedUrl = $(rssDom, 'channel link').textContent;
          const description = $(rssDom, 'channel description').textContent;
          const posts = Array.from($$(rssDom, 'channel item'))
            .map((item) => ({ title: $(item, 'title').textContent, description: $(item, 'description').textContent, link: $(item, 'link').textContent }));

          return {
            url: feedUrl, title, description, posts,
          };
        });
      })
      .then((feed) => {
        state.feeds.sources.unshift(feed);
        state.feeds.state = state.feeds.state === 'empty' ? 'filledWithOne' : 'filled';
      });
  });
};
