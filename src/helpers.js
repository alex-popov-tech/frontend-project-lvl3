import { string, mixed } from 'yup';
import axios from 'axios';

export const validateUrl = (url, existingUrls) => string().url().validate(url)
  .then(() =>
    mixed()
      .notOneOf(existingUrls.map((it) => new URL(it).origin))
      .validate(new URL(url).origin));

export const pullRss = (url) =>
  axios
    .get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}&disableCache=true`)
    .then(({ data: { contents } }) => contents);

export const parseRss = (content) => {
  const rssDom = new DOMParser().parseFromString(content, 'application/xml');
  const title = rssDom.querySelector('channel title').textContent;
  const link = rssDom.querySelector('channel link').textContent;
  const description = rssDom.querySelector('channel description').textContent;
  const items = Array.from(rssDom.querySelectorAll('channel item')).map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));

  return {
    link,
    title,
    description,
    items,
  };
};
