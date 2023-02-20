import { _wcl } from './common-lib.js';
import { _wccss } from './common-css.js';
import {
  colorPalette as _fujiColorPalette,
  buttons as _fujiButtons,
  a11y as _fujiA11y,
  dialog as _fujiDialog
} from './fuji-css.js';
import Mustache from './mustache.js';

/*
 reference:
 - https://web.dev/control-focus-with-tabindex/
 - https://web.dev/at-property/
 - https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert
 - https://loading.io/css/
 */

const defaults = {
  params: {},
  l10n: {
    title: 'Category Picker',
    confirm: 'CONFIRM',
    emptyLabel: 'Select'
  },
  webservice: {
    path: 'https://category-public.nevec.yahoo.com/v2/egs/category/node/get_path/tw_auction2_basic/{{categoryId}}',
    node: 'https://category-public.nevec.yahoo.com/v1/egs/category/node/get_node/tw_auction2_basic/{{categoryId}}',
    children: 'https://category-public.nevec.yahoo.com/v2/egs/category/node/get_children/tw_auction2_basic/{{categoryId}}'
  }
};

const booleanAttrs = []; // booleanAttrs default should be false
const objectAttrs = ['l10n', 'params', 'webservice'];
const custumEvents = {
  pick: 'yauction-category-picker-pick',
  cancel: 'yauction-category-picker-cancel',
  error: 'yauction-category-picker-error'
};

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}
${_fujiColorPalette}
${_fujiButtons}
${_fujiA11y}
${_fujiDialog}

:host{position:relative;inline-size:0;block-size:0;visibility:hidden;overflow:hidden;}

/* variables */
.main {
  --title-color: var(--yauction-category-picker-label-color, rgba(35 42 49));
  --theme-color: var(--yauction-category-picker-theme-color, rgba(15 105 255));
  --line-color: var(--yauction-category-picker-line-color, rgba(198 198 200));
  --listing-color: var(--yauction-category-picker-listing-color, rgba(35 42 49));
  --listing-bgc: var(--yauction-category-picker-listing-bgc, rgba(246 248 250));
  --arrow-color: var(--yauction-category-picker-arrow-color, rgba(151 158 168));
  --divide-line-color: var(--yauction-category-picker-section-line-color, rgba(224 228 233));
  --confirm-text-color: var(--yauction-category-picker-confirm-text-color, rgba(255 255 255));
  --confirm-bgc: var(--yauction-category-picker-confirm-bgc, rgba(58 191 186));

  /* listings */
  --listing-block-size: 2.75em;
  --listing-count: var(--yauction-category-picker-max-listing-count, 10);
  --listings-block-size: calc((var(--listing-count) - .4) * var(--listing-block-size));

  /* mask */
  --mask-horizontal-size: 1em;
  --mask-horizontal: linear-gradient(to right,transparent 0%,black calc(0% + var(--mask-horizontal-size)),black calc(100% - var(--mask-horizontal-size)),transparent 100%);
  --mask-vertical-size: 1em;
  --mask-vertical: linear-gradient(to bottom,transparent 0%,black calc(0% + var(--mask-vertical-size)),black calc(100% - var(--mask-vertical-size)),transparent 100%);
  --mask-arrow: path('M9.4 18 8 16.6l4.6-4.6L8 7.4 9.4 6l6 6Z');

  /* layer */
  --layer: 1;

  /* loading */
  --loading-color: var(--yauction-category-picker-loading-color, rgba(255 255 255));
  --loading-bgc: var(--yauction-category-picker-loading-bgc, rgba(0 0 0/.25));
  --loading-opacity-normal: 0;
  --loading-opacity-active: 1;
  --loading-opacity: var(--loading-opacity-normal);

  /* a11y */
  --a11y-block-link-overlay-color: 29 34 40;
  --a11y-block-link-opacity-active: .065;

  --line-clamp: 1;
}

.main[inert] {
  --loading-opacity: var(--loading-opacity-active);
}

.main .buttons[data-type='primary']:not(:disabled) {
  --color: var(--confirm-text-color);
  --default-background-color: var(--confirm-bgc);
}

.category__titles {
  --color-normal: var(--title-color);
  --color-active: var(--theme-color);
  --color: var(--color-normal);

  --indicator-opacity-normal: 0;
  --indicator-opacity-active: 1;
  --indicator-opacity: var(--indicator-opacity-normal);

  --duration: 150ms;

  --a11y-block-link-border-radius: 2px;
}

.category__listings {
  --shift-amount: calc((var(--layer) - 1) * 100% * -1);
}

.main .buttons[data-type] {
  --overlay-color: var(--inkwell);
}

.dialog-content{inline-size:37.5em;}
.category__mask--horizontal{mask-image:var(--mask-horizontal);-webkit-mask-image:var(--mask-horizontal);}
.category__mask--vertical{mask-image:var(--mask-vertical);-webkit-mask-image:var(--mask-vertical);}

.main{position:relative;background-color:rgba(var(--white));}
.main__title{font-size:1.125em;text-align:start;padding-block-end:.89em;border-block-end:1px solid var(--divide-line-color);}
.category__titles{position:relative;block-size:3em;display:flex;}
.category__titles__a{position:relative;flex:0 0 auto;color:var(--color);line-height:3em;outline:0 none;transition:color var(--duration) var(--transition-timing-function);will-change:color;}
.category__titles__a::before{position:absolute;inset-inline-start:0;inset-block-end:0;inline-size:100%;block-size:2px;border-radius:2px;content:'';background-color:var(--theme-color);transition:opacity var(--duration) var(--transition-timing-function);will-change:opacity;opacity:var(--indicator-opacity);}
.category__titles__a:focus-visible {
  --color: var(--color-active);
  --indicator-opacity: var(--indicator-opacity-active);
}
.category__titles__a:not(:empty){padding-inline:1em;}

.category__listings{background-color:var(--listing-bgc);border-block-start:1px solid var(--line-color);border-radius:0 0 .75em .75em;}
.category__listings{position:relative;inline-size:100%;block-size:var(--listings-block-size);overflow:hidden;}
.category__listings__queue{position:relative;inline-size:100%;block-size:100%;display:flex;transition:transform 200ms var(--transition-timing-function);will-change:transform;transform:translateX(var(--shift-amount));}
.category__listings__layer{flex:0 0 100%;inline-size:100%;block-size:100%;}
.category__listing{position:relative;inline-size:100%;block-size:var(--listing-block-size);padding-inline:.75em;display:block;box-sizing:border-box;}
.category__listing__span{position:relative;display:flex;gap:.5em;align-items:center;}
.category__listing__span::after{inline-size:1.5em;block-size:1.5em;content:'';clip-path:var(--mask-arrow);background-color:var(--arrow-color);display:block;}
.category__listing__span__em{flex:0 1 100%;inline-size:100%;color:var(--listing-color);line-height:var(--listing-block-size);}
.category__listing--leaf .category__listing__span{display:block;}
.category__listing--leaf .category__listing__span::after{display:none;}
.category__listing:nth-of-type(n+2) .category__listing__span::before{position:absolute;inset-inline-start:0;inset-block-start:-.5px;content:'';inline-size:100%;block-size:1px;background-color:var(--line-color);}
.category__listing[data-picked='true'] {
  --listing-color: var(--theme-color);
  --opacity: var(--opacity-active);
}

.submits{display:flex;gap:.5em;justify-content:flex-end;margin-block-start:1em;padding-block-start:1em;border-block-start:1px solid var(--divide-line-color);}
.submits .buttons:disabled{cursor:not-allowed;}

@media screen and (max-width: 414px) {
  .submits .buttons{flex-grow:1;}
}

/* loading: https://loading.io/css/ */
.loading-sign{position:absolute;inset-inline-end:2px;inset-block-end:2px;inline-size:80px;block-size:80px;border-radius:80px;background-color:var(--loading-bgc);transform:scale(.5);transform-origin:100% 100%;pointer-events:none;z-index:3;transition:opacity 200ms ease;will-change:opacity;opacity:var(--loading-opacity);}
.lds-ripple{display:inline-block;position:relative;inline-size:80px;block-size:80px;}
.lds-ripple div{position:absolute;border:4px solid var(--loading-color);opacity:1;border-radius:50%;animation:lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;}
.lds-ripple div:nth-child(2){animation-delay:-0.5s;}

@keyframes lds-ripple {
  0% { top:36px;left:36px;width:0;height:0;opacity:0; }
  4.9% { top:36px;left:36px;width:0;height:0;opacity:0; }
  5% { top:36px;left:36px;width:0;height:0;opacity:1; }
  100% { top:0px;left:0px;width:72px;height:72px;opacity:0; }
}

/* layer setting */
.main[data-layer='1']{--layer:1;}
.main[data-layer='1'] .category__titles__a:nth-of-type(1) {
  --color: var(--color-active);
  --indicator-opacity: var(--indicator-opacity-active);
}

@media (hover: hover) {
  .category__titles__a:hover {
    --color: var(--color-active);
    --indicator-opacity: var(--indicator-opacity-active);
  }
}

@media screen and (max-width: 767px) {
  .submits .buttons{flex-grow:1;}

  /* rewrite dialog when in mobile view */
  .fuji-alerts {
    --padding: 1.25em;
    --margin: 1.25em;
    --close-size: 36px;
    --content-max-inline-size: 100%;

    border-end-start-radius: 0;
    border-end-end-radius: 0;
    padding-inline: max(var(--safe-area-left), var(--padding)) max(var(--safe-area-right), var(--padding));;
    padding-bottom: max(var(--safe-area-bottom), var(--padding));
  }

  .fuji-alerts[open],.fuji-alerts[close]{animation:revert;}
  .fuji-alerts[open]:modal{animation:fuji-alerts-open-dock 400ms cubic-bezier(.4,0,.2,1) normal;}
  .fuji-alerts[close]:modal{animation:fuji-alerts-close-dock 400ms cubic-bezier(0,0,.2,1) normal;}

  .fuji-alerts:modal {
    inline-size: 100%;
    max-inline-size: 100%;
    box-sizing: border-box;
    inset-block:auto 0;
  }

  @keyframes fuji-alerts-open-dock {
    from {transform:translateY(100%);opacity:0;}
    to {transform:translateY(0%);opacity:1;}
  }

  @keyframes fuji-alerts-close-dock {
    from {transform:translateY(0%);opacity:1;}
    to {transform:translateY(100%);opacity:0;}
  }
}

/* force disable hori-scrollbar */
.overscrolling-x::-webkit-scrollbar{display:none;}
.overscrolling-x{scrollbar-width:none;}
</style>

<dialog class="fuji-alerts">
  <form method="dialog" class="fuji-alerts__form dialog-content">
    <button class="fuji-alerts__close" value="cancel">
      cancel
    </button>

    <div class="main" data-layer="1">
      <p class="main__title line-clampin">${defaults.l10n.title}</p>
      <div class="category__titles category__mask--horizontal overscrolling-x">
        <a class="category__titles__a a11y-block-link esc-dark-mode" href="#category" data-order="1" data-category=""></a>
      </div>

      <div class="category__listings">
        <div class="category__listings__queue">
          <div inert class="category__listings__layer category__mask--vertical overscrolling"></div>
        </div>
      </div>

      <div class="submits">
        <button
          class="buttons submits__confirm"
          data-type="primary"
          data-size="large"
          value="confirm"
          disabled
        >
          ${defaults.l10n.confirm}
        </button>
      </div>

      <div class="loading-sign">
        <div class="lds-ripple">
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  </form>
</dialog>
`;

const templateListing = document.createElement('template');
templateListing.innerHTML = `
{{#listings}}
  <a href="#{{id}}" class="category__listing {{#leaf}}category__listing--leaf{{/leaf}} a11y-block-link esc-dark-mode" data-id="{{id}}">
    <span class="category__listing__span">
      <em class="category__listing__span__em line-clampin">{{name}}</em>
    </span>
  </a>
{{/listings}}
`;

const templateLabel = document.createElement('template');
templateLabel.innerHTML = `
<a class="category__titles__a a11y-block-link esc-dark-mode" href="#category" data-order="{{order}}" data-category=""></a>
`;

const templateLayer = document.createElement('template');
templateLayer.innerHTML = `
<div inert class="category__listings__layer category__mask--vertical overscrolling"></div>
`;


// Houdini Props and Vals
if (CSS?.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--yauction-category-picker-label-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-theme-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(15 105 255)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-line-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(198 198 200)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-listing-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-listing-bgc',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(246 248 250)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-arrow-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(151 158 168)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-section-line-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(224 228 233)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-confirm-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-confirm-bgc',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(58 191 186)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-loading-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--yauction-category-picker-loading-bgc',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0/.25)'
    });
  } catch(err) {
    console.warn(`yauction-category-picker: ${err.message}`);
  }
}

const categoryData = {}; // store category data
const defaultPicked = {
  id: '',
  name: ''
};

export class YauctionCategoryPicker extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: '',
      categories: [],
      path: [],
      picked: {
        ...defaultPicked
      }
    };

    // nodes
    this.#nodes = {
      styleSheet: this.shadowRoot.querySelector('style'),
      dialog: this.shadowRoot.querySelector('dialog'),
      main: this.shadowRoot.querySelector('.main'),
      form: this.shadowRoot.querySelector('form'),
      categoriesWrap: this.shadowRoot.querySelector('.category__titles'),
      layersWrap: this.shadowRoot.querySelector('.category__listings__queue'),
      categories: Array.from(this.shadowRoot.querySelectorAll('.category__titles__a')),
      layers: Array.from(this.shadowRoot.querySelectorAll('.category__listings__layer')),
      subject: this.shadowRoot.querySelector('.main__title'),
      btnConfirm: this.shadowRoot.querySelector('.submits__confirm'),
      focusdCategory: '',
      focusdListing: ''
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new YauctionCategoryPicker(config)
    };

    // evts
    this._onCancel = this._onCancel.bind(this);
    this._onCategoriesClick = this._onCategoriesClick.bind(this);
    this._onListingsClick = this._onListingsClick.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
  }

  async connectedCallback() {
  const { dialog, main, btnConfirm } = this.#nodes;
   const { config, error } = await _wcl.getWCConfig(this);

    if (error) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${error}`);
      this.remove();
      return;
    } else {
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    // upgradeProperty
    Object.keys(defaults).forEach((key) => this.#upgradeProperty(key));

    // evts
    this.#data.controller = new AbortController();
    const signal = this.#data.controller.signal;
    dialog.addEventListener('cancel', this._onCancel, { signal });
    dialog.querySelector('.fuji-alerts__close').addEventListener('click', this._onCancel, { signal });
    main.querySelector('.category__titles').addEventListener('click', this._onCategoriesClick, { signal });
    main.querySelector('.category__listings').addEventListener('click', this._onListingsClick, { signal });
    btnConfirm.addEventListener('click', this._onSubmit, { signal });
  }

  disconnectedCallback() {
    if (this.#data?.controller) {
      this.#data.controller.abort();
    }
  }

  #format(attrName, oldValue, newValue) {
    const hasValue = newValue !== null;

    if (!hasValue) {
      if (booleanAttrs.includes(attrName)) {
        this.#config[attrName] = false;
      } else {
        this.#config[attrName] = defaults[attrName];
      }
    } else {
      switch (attrName) {
        case 'params':
        case 'l10n':
        case 'webservice': {
          let values;
          try {
            values = JSON.parse(newValue);
          } catch(err) {
            console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
            values = { ...defaults[attrName] };
          }
          this.#config[attrName] = values;
          break;
        }
      }
    }
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!YauctionCategoryPicker.observedAttributes.includes(attrName)) {
      return;
    }

    this.#format(attrName, oldValue, newValue);

    switch (attrName) {
      case 'l10n': {
        const { subject, btnConfirm } = this.#nodes;

        const { title, confirm } = {
          ...defaults.l10n,
          ...this.l10n
        };

        subject.textContent = title;
        btnConfirm.textContent = confirm;
        break;
      }
    }
  }

  static get observedAttributes() {
    return Object.keys(defaults); // YauctionCategoryPicker.observedAttributes
  }

  #upgradeProperty(prop) {
    let value;

    if (YauctionCategoryPicker.observedAttributes.includes(prop)) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        value = this[prop];
        delete this[prop];
      } else {
        if (booleanAttrs.includes(prop)) {
          value = (this.hasAttribute(prop) || this.#config[prop]) ? true : false;
        } else if (objectAttrs.includes(prop)) {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : JSON.stringify(this.#config[prop]);
        } else {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : this.#config[prop];
        }
      }

      this[prop] = value;
    }
  }

  set params(value) {
    if (value) {
      const newValue = {
        ...defaults.params,
        ...this.params,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('params', JSON.stringify(newValue));
    } else {
      this.removeAttribute('params');
    }
  }

  get params() {
    return this.#config.params;
  }

  set l10n(value) {
    if (value) {
      const newValue = {
        ...defaults.l10n,
        ...this.l10n,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('l10n', JSON.stringify(newValue));
    } else {
      this.removeAttribute('l10n');
    }
  }

  get l10n() {
    return this.#config.l10n;
  }

  set webservice(value) {
    if (value) {
      const newValue = {
        ...defaults.webservice,
        ...this.webservice,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('webservice', JSON.stringify(newValue));
    } else {
      this.removeAttribute('webservice');
    }
  }

  get webservice() {
    return this.#config.webservice;
  }

  get open() {
    return this.#nodes.dialog.open;
  }

  get pickedInfo() {
    const picked = this.#data.picked;
    let info = {};

    if (picked.id) {
      info = {
        picked: {
          ...picked
        },
        path: this.#nodes.categories
          .filter((C) => C.dataset.category)
          .reduce(
            (acc, cur) => {
              return acc.concat({
                id: cur.dataset.category,
                name: cur.textContent.trim()
              });
            }
          , [])
      };
    }

    return info;
  }

  #fireEvent(evtName, detail) {
    this.dispatchEvent(new CustomEvent(evtName,
      {
        bubbles: true,
        composed: true,
        ...(detail && { detail })
      }
    ));
  }

  #prepareClose(type) {
    const { dialog } = this.#nodes;

    if (!this.open) {
      return;
    }
    
    dialog.addEventListener('animationend',
      () => {
        dialog.returnValue = type;
        dialog.removeAttribute('close');
        dialog.close();

        if (type === 'cancel') {
          this.#fireEvent(custumEvents.cancel);
        }
      }
    , { once:true });

    dialog.toggleAttribute('close', true);
  }

  async #fetchPath(id) {
    const { path } = this.webservice;
    let pathData = [];

    try {
      const signal = _wcl.prepareFetch();
      const apiUrl = path.replace(/{{categoryId}}/g, id);
      const base = !/^http(s)?:\/\/.*/.test(apiUrl) ? window.location.origin : undefined;

      const fetchUrl = new URL(apiUrl, base);
      const params = {
        ...this.params,
        id
      };
      Object.keys(params).forEach((key) => fetchUrl.searchParams.set(key, params[key]));
      
      const response = await fetch(
        fetchUrl.toString(),
        {
          headers: {
            'content-type': 'application/json'
          },
          method: 'GET',
          mode: 'cors',
          signal
        }
      )
        .then(
          async (response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK.', {
                cause: await response.json()
              });
            }

            return response.json();
          }
        );

      const { response_data = [] } = response;
      pathData = response_data.reduce(
        (acc, cur) => {
          const { cat_id:id, parent_cat_id:parentId, name } = cur;

          if (id === '0') {
            return acc;
          } else {
            return acc.concat({
              id,
              parentId,
              name
            });
          }
        }
      , []).reverse();

      const { id:pickedId, name:pickedName } = pathData.pop();

      this.#data.picked = {
        id: pickedId,
        name: pickedName
      };
      this.#data.path = pathData;
    } catch(err) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
      const cause = (typeof err.cause !== 'undefined') ? err.cause : undefined;

      this.#fireEvent(custumEvents.error, {
        message:err.message,
        ...(cause && { cause })
      });
    }

    return pathData;
  }

  async #fetchNode(id) {
    const { node } = this.webservice;
    let leaf = false;

    try {
      const signal = _wcl.prepareFetch();
      const apiUrl = node.replace(/{{categoryId}}/g, id);
      const base = !/^http(s)?:\/\/.*/.test(apiUrl) ? window.location.origin : undefined;

      const fetchUrl = new URL(apiUrl, base);
      const params = {
        ...this.params,
        id
      };
      Object.keys(params).forEach((key) => fetchUrl.searchParams.set(key, params[key]));
      
      const response = await fetch(
        fetchUrl.toString(),
        {
          headers: {
            'content-type': 'application/json'
          },
          method: 'GET',
          mode: 'cors',
          signal
        }
      )
        .then(
          async (response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK.', {
                cause: await response.json()
              });
            }

            return response.json();
          }
        );

      const { response_data = {} } = response;
      leaf = response_data?.type === '2';
    } catch(err) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
      const cause = (typeof err.cause !== 'undefined') ? err.cause : undefined;

      this.#fireEvent(custumEvents.error, {
        message:err.message,
        ...(cause && { cause })
      });
    }

    return leaf;
  }

  async #fetchCategory(id) {
    if (!categoryData[id]) {
      // fetch
      const { children } = this.webservice;
      
      try {
        const signal = _wcl.prepareFetch();
        const apiUrl = children.replace(/{{categoryId}}/g, id);
        const base = !/^http(s)?:\/\/.*/.test(apiUrl) ? window.location.origin : undefined;

        const fetchUrl = new URL(apiUrl, base);
        const params = {
          ...this.params,
          id
        };
        Object.keys(params).forEach((key) => fetchUrl.searchParams.set(key, params[key]));
        
        const response = await fetch(
          fetchUrl.toString(),
          {
            headers: {
              'content-type': 'application/json'
            },
            method: 'GET',
            mode: 'cors',
            signal
          }
        )
          .then(
            async (response) => {
              if (!response.ok) {
                throw new Error('Network response was not OK.', {
                  cause: await response.json()
                });
              }

              return response.json();
            }
          );

        const { response_data = [] } = response;
        const aliasCategories = [];
        const data = response_data.reduce(
          (acc, cur) => {
            // type: 1(normal) / 2(leaf) / 3(alias), 
            const {
              cat_id:id = '',
              name = '',
              type = '1',
              alias_cat_id = '',
              cust_data = {}
            } = cur;

            if (cust_data?.['BlockSubmit']) {
              // drop when BlockSubmit occured
              return acc;
            } else {
              // alias
              if (type === '3') {
                aliasCategories.push(alias_cat_id);
              }

              return acc.concat({
                id: type === '3' ? alias_cat_id : id,
                name: `${name}${type === '3' ? '@' : ''}`,
                type,
                leaf: type === '2'
              });
            }
          }
        , []);

        const aliasCategoriesData = await Promise.all(
          aliasCategories.map(
            (id) => {
              return this.#fetchNode(id);
            }
          )
        );

        const leafData = aliasCategoriesData.reduce(
          (acc, cur, idx) => {
            acc[aliasCategories[idx]] = cur;
            return acc;
          }
        , {});

        categoryData[id] = data.map(
          (unit) => {
            const { id } = unit;

            return {
              ...unit,
              ...(leafData[id] && { leaf:leafData[id] })
            };
          }
        );
      } catch(err) {
        console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
        const cause = (typeof err.cause !== 'undefined') ? err.cause : undefined;

        this.#fireEvent(custumEvents.error, {
          message:err.message,
          ...(cause && { cause })
        });
      }
    }

    return categoryData[id];
  }

  #clearListings() {
    const { categories, layers } = this.#nodes;

    categories.forEach(
      (category) => {
        category.replaceChildren();
        category.dataset.category = '';
      }
    );
    layers.forEach(
      (layer) => {
        layer.replaceChildren();
        layer.inert = true;
      }
    );
  }

  #updateStorage() {
    let storage = this.querySelector('input[type=hidden]');

    if (!storage) {
      storage = document.createElement('input');
      storage.type = 'hidden';
      storage.name = _wcl.classToTagName(this.constructor.name);
      this.appendChild(storage);
    }

    storage.value = JSON.stringify(this.pickedInfo);
  }

  #generateNodes() {
    const {
      main,
      categoriesWrap,
      layersWrap,
      categories,
      styleSheet
    } = this.#nodes;

    const order = categories.length + 1;
    const categoryString = Mustache.render(templateLabel.innerHTML, { order });
    const layerString = templateLayer.innerHTML;

    // DOM
    categoriesWrap.insertAdjacentHTML('beforeend', categoryString);
    layersWrap.insertAdjacentHTML('beforeend', layerString);

    // CSS
    _wcl.addStylesheetRules(
      `.main[data-layer='${order}']`,
      {
        '--layer': order
      }
    , styleSheet);

    _wcl.addStylesheetRules(
      `.main[data-layer='${order}'] .category__titles__a:nth-of-type(${order})`,
      {
        '--color': 'var(--color-active)',
        '--indicator-opacity': 'var(--indicator-opacity-active)'
      }
    , styleSheet);

    // update
    this.#nodes.categories = Array.from(main.querySelectorAll('.category__titles__a'));
    this.#nodes.layers = Array.from(main.querySelectorAll('.category__listings__layer'));
  }

  async #render() {
    const categoryData = await Promise.all(
      this.#data.categories.map(
        (id) => {
          return this.#fetchCategory(id);
        }
      )
    );

    // nodes
    const missing = categoryData.length - this.#nodes.categories.length;
    if (missing > 0) {
      Array(missing)
        .fill()
        .forEach(() => this.#generateNodes());
    }

    const { categories, layers, main, btnConfirm } = this.#nodes;

    this.#data.categories.forEach(
      (categoryId, idx) => {
        const layer = layers[idx];

        layer.replaceChildren();
        const templateString = Mustache.render(templateListing.innerHTML, { listings:categoryData[idx] });
        layer.insertAdjacentHTML('afterbegin', templateString);
        layer.inert = true;
      }
    );

    if (!this.#data.path.length) {
      // strat from root
      categories[0].textContent = this.l10n.emptyLabel;
      this.#nodes.focusdCategory = categories[0];
      this.#nodes.focusdListing = layers[0].querySelector('a');

      main.dataset.layer = 1;
      layers[0].inert = false;
      btnConfirm.disabled = true;
      this.#data.picked = {
        ...defaultPicked
      };
    } else {
      this.#data.path.forEach(
        ({ name, id }, idx) => {
          categories[idx].textContent = name;
          categories[idx].dataset.category = id;
        }
      );

      const currentCategory = categories[this.#data.path.length];
      const currentLayer = layers[this.#data.path.length];
      const listing = currentLayer.querySelector(`[data-id='${this.#data.picked.id}']`);

      currentCategory.textContent = this.#data.picked.name;
      currentCategory.dataset.category = this.#data.picked.id;
      this.#nodes.focusdCategory = currentCategory;

      main.dataset.layer = this.#data.path.length + 1;
      currentLayer.inert = false;
      btnConfirm.disabled = false;

      if (listing) {
        listing.dataset.picked = true;
        this.#nodes.focusdListing = listing;
      }
    }
  }

  _onCancel(evt) {
    evt.preventDefault();
    this.#prepareClose('cancel');
  }

  async _onListingsClick(evt) {
    const { main, categories, layers, btnConfirm } = this.#nodes;
    const listing = evt.target.closest('a');

    if (!listing) {
      return;
    }

    evt.preventDefault();

    const layerId = +main.dataset.layer;
    const currentLayer = layers[layerId - 1];
    const currentCategory = categories[layerId - 1];
    const categoryId = listing.dataset.id;
    const name = listing.textContent.trim();

    main.inert = true;

    // update pick status
    Array.from(currentLayer.querySelectorAll('[data-picked="true"]'))
      .forEach((A) => A.dataset.picked = false);
    listing.dataset.picked = true;

    // current catagory
    currentCategory.textContent = name;
    currentCategory.dataset.category = categoryId;

    if (listing.classList.contains('category__listing--leaf')) {
      // leaf
      btnConfirm.disabled = false;
      this.#data.picked = {
        id: categoryId,
        name
      };
      this.#nodes.focusdCategory = currentCategory;
    } else {
      // node
      if (!categories?.[layerId]) {
        this.#generateNodes();
      }
      
      const categoryData = await this.#fetchCategory(categoryId);

      btnConfirm.disabled = true;
      this.#data.picked = {
        ...defaultPicked
      };

      // category
      this.#nodes.categories[layerId].textContent = this.l10n.emptyLabel;
      this.#nodes.focusdCategory = this.#nodes.categories[layerId];

      // layer
      const layer = this.#nodes.layers[layerId];
      layer.replaceChildren();
      const templateString = Mustache.render(templateListing.innerHTML, { listings:categoryData });
      layer.insertAdjacentHTML('afterbegin', templateString);
      
      layer.inert = false;
      main.dataset.layer = layerId + 1;
    }

    main.inert = false;
    this.#nodes.focusdCategory.scrollIntoView();
  }

  _onCategoriesClick(evt) {
    const category = evt.target.closest('a');

    if (!category) {
      return;
    }

    evt.preventDefault();

    const { main, categories, layers, btnConfirm } = this.#nodes;
    const order = +category.dataset.order;

    this.#data.picked = {
      ...defaultPicked
    };

    main.dataset.layer = order;
    category.textContent = this.l10n.emptyLabel;
    category.dataset.category = '';
    Array.from(layers[order - 1].querySelectorAll('[data-picked="true"]'))
      .forEach((A) => A.dataset.picked = false);

    categories.forEach(
      (category, idx) => {
        if (idx >= order) {
          category.replaceChildren();
          category.dataset.category = '';
        }
      }
    );
    layers.forEach(
      (layer, idx) => {
        layer.inert = true;
        if (idx >= order) {
          layer.replaceChildren();
        }
      }
    );
    btnConfirm.disabled = true;
    layers[order - 1].inert = false;
  }

  _onSubmit(evt) {
    const picked = this.#data.picked;

    evt.preventDefault();

    if (!picked.id) {
      return;
    }

    this.#updateStorage();
    this.#fireEvent(custumEvents.pick, { ...this.pickedInfo });
    this.#prepareClose('submit');
  }

  async show(categoryId = '0') {
    const { dialog, main } = this.#nodes;

    // reset
    this.#nodes.focusdCategory = '';
    this.#nodes.focusdListing = '';
    this.#data.categories = [];
    this.#data.path = [];
    this.#data.picked = {
      ...defaultPicked
    };
    
    this.#clearListings();
    main.inert = true;

    if (categoryId === '0') {
      this.#data.categories = [0];
    } else {
      const pathData = await this.#fetchPath(categoryId);
      this.#data.categories = [0].concat(pathData.map(({ id }) => id));
    }

    await this.#render();
    main.inert = false;

    if (!this.open) {
      dialog.showModal();
    } 

    this.#nodes.focusdCategory?.scrollIntoView?.();
    this.#nodes.focusdListing?.scrollIntoView?.();
  }

  dismiss() {
    if (this.open) {
      this.#prepareClose('cancel');
    }
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName('YauctionCategoryPicker');
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(_wcl.classToTagName('YauctionCategoryPicker'), YauctionCategoryPicker);
}