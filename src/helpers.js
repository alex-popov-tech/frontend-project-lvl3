export const $$ = (selectorOrContext, selector) => (selector
  ? selectorOrContext?.querySelectorAll(selector)
  : document?.querySelectorAll(selectorOrContext));
export const $ = (selectorOrContext, selector) => $$(selectorOrContext, selector)[0];
