# yauction-category-picker

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/yauction-category-picker) [![DeepScan grade](https://deepscan.io/api/teams/16372/projects/23931/branches/731293/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16372&pid=23931&bid=731293)

&lt;yauction-category-picker /> is a category picker for [TW Yahoo! Auction](https://tw.bid.yahoo.com/). Users could go through the whole category tree to pick a suitable category for their merchandise. &lt;yauction-category-picker /> will show up with categoryId which developers set. That means user can start from category 「`root`」 or 「`leaf`」.

![<yauction-category-picker />](https://blog.lalacube.com/mei/img/preview/yauction-category-picker.png)

## Vision
- &lt;yauction-category-picker /> rised.
![<yauction-category-picker /> rised.](https://blog.lalacube.com/mei/img/wc_visions/yauction-category-picker_a.png)

- &lt;yauction-category-picker /> rised (search mode).
![<yauction-category-picker /> rised (search mode).](https://blog.lalacube.com/mei/img/wc_visions/yauction-category-picker_b.png)

## Basic Usage

&lt;yauction-category-picker /> is a web component. All we need to do is put the required script into your HTML document. Then follow &lt;yauction-category-picker />'s html structure and everything will be all set.

## Required Script

```html
<script
  type="module"
  src="https://your-domain/wc-yauction-category-picker.js">        
</script>
```

## Structure

Put &lt;yauction-category-picker /> into HTML document. It will have different functions and looks with attribute mutation.

```html
<yauction-category-picker>
  <script type="application/json">
    {
      "l10n": {
        "title": "Category Picker",
        "confirm": "CONFIRM",
        "emptyLabel": "Select",
        "placeholder": "Search category"
      },
      "params": {
        "id": "mei",
        ...
      },
      "webservice": {
        "path": "https://your-domain/getCategoryPath",
        "children": "https://your-domain/getCategoryChildren",
        "node": "https://your-domain/getCategoryNode",
        "tree": "https://your-domain/getCategoryTree"
      } 
    }
  </script>
</yauction-category-picker>
```

Otherwise, developers could also choose remoteconfig to fetch config for &lt;yauction-category-picker />.

<yauction-category-picker
  remoteconfig="https://your-domain/api-path"
>
</yauction-category-picker>

## JavaScript Instantiation

&lt;yauction-category-picker /> could also use JavaScript to create DOM element. Here comes some examples.

```html
<script type="module">
import { YauctionCategoryPicker } from 'https://your-domain/wc-yauction-category-picker.js';

// use DOM api
const nodeA = document.createElement('yauction-category-picker');
document.body.appendChild(nodeA);
nodeA.params = {
  id: 'mei',
  sex: 'M'
};
nodeA.show();

// new instance with Class
const nodeB = new YauctionCategoryPicker();
document.body.appendChild(nodeB);
nodeB.params = {
  id: 'mei',
  sex: 'M'
};
nodeB.show('23288');

// new instance with Class & default config
const config = {
  l10n: {
    title: 'Category Picker',
    confirm: 'CONFIRM',
    emptyLabel: 'Select'
  },
  params: {
    id: 'mei',
    sex: 'M'
  },
  webservice: {
    path: 'https://your-domain/getCategoryPath',
    children: 'https://your-domain/getCategoryChildren',
    node: 'https://your-domain/getCategoryNode',
    tree: 'https://your-domain/getCategoryTree'
  } 
};
const nodeC = new YauctionCategoryPicker(config);
document.body.appendChild(nodeC);
</script>
```

## Style Customization

Developers could apply styles to decorate &lt;yauction-category-picker />'s looking.

```html
<style>
yauction-category-picker {
  /* common */
  --yauction-category-picker-label-color: rgba(35 42 49);
  --yauction-category-picker-theme-color: rgba(15 105 255);
  --yauction-category-picker-section-line-color: rgba(224 228 233);

  /* listing */
  --yauction-category-picker-listing-color: rgba(35 42 49);
  --yauction-category-picker-listing-bgc: rgba(246 248 250);
  --yauction-category-picker-arrow-color: rgba(151 158 168);
  --yauction-category-picker-line-color: rgba(198 198 200);
  --yauction-category-picker-max-listing-count: 10;
  --yauction-category-picker-no-result-color: rgba(35 42 49);

  /* action button */
  --yauction-category-picker-confirm-text-color: rgba(255 255 255);
  --yauction-category-picker-confirm-bgc: rgba(58 191 186);

  /* loading sign */
  --yauction-category-picker-loading-color: rgba(255 255 255);
  --yauction-category-picker-loading-bgc: rgba(0 0 0/.25);
}
</style>
```

## Attributes

&lt;yauction-category-picker /> supports some attributes to let it become more convenience & useful.

- **params**

Set parameters for &lt;yauction-category-picker />. It should be JSON string. Each fetching will attached these parameters to api. Default is `{}` (not set).

```html
<yauction-category-picker
  params='{"id":"mei","sex":"M"}'
>
  ...
</yauction-category-picker>
```

- **l10n**

Set localization for &lt;yauction-category-picker />. It will replace some message & button text to anything you like. It should be JSON string. Developers could set `title`、`confirm`、`emptyLabel` and `placeholder`.

- `title`：category title text. Default is `Category Picker`.
- `confirm`：button「confirm」text. Default is `CONFIRM`.
- `emptyLabel`：empty label text. Default is `Select`.
- `placeholder`：search field placeholder content. Default is `Search category`.

```html
<yauction-category-picker
  l10n='{"title":"Category Picker","confirm":"CONFIRM","emptyLabel":"Select","placeholder":"Search category"}'
>
  ...
</yauction-category-picker>
```

- **webservice**

Set web service information for &lt;yauction-category-picker />. It should be JSON string. Developers could set `path`、`node`、`children` and `tree` api address here..

PS. Developers could apply `{{categoryId}}` as replace key for category id in api address. Such as "`https://your-domain/getCategoryChildren/{{categoryId}}`".

- `path`：api address for category path information fetching (leaf to root).
- `children`：api address for category children fetching.
- `node`：api address for category node information fetching.
- `tree`：api address for category tree information fetching.

```html
<yauction-category-picker
  webservice='{"path":"https://your-domain/getCategoryPath","children":"https://your-domain/getCategoryChildren","node":"https://your-domain/getCategoryNode","tree":"https://your-domain/getCategoryTree"}'
>
  ...
</yauction-category-picker>
```

## Properties

| Property Name | Type | Description |
| ----------- | ----------- | ----------- |
| params | Object | Getter / Setter for params. Each fetching will attached these parameters to api. Default is `{}`. |
| l10n | Object | Getter / Setter for l10n. It will replace some UI text to anything you like. Developers could set `title`、`confirm`、`emptyLabel` and `placeholder`. |
| webservice | Object | Getter / Setter for webservice. Developers could set `path`、`children`、`node` and `tree` api address here. |
| open | Boolean | Getter for &lt;yauction-category-picker />'s open status. |
| pickedInfo | Object | Getter for current &lt;yauction-category-picker />'s category information. Developers could get `{ picked, path }`. |


## Method

| Method Signature | Description |
| ----------- | ----------- |
| show(categoryId) | Fetch & popup &lt;yauction-category-picker />. Developers could call this method with argument > categero id to popup <yauction-category-picker />. Such as：`element.show('23288')`. Default is `0` (not set). |
| dismiss | Dismiss &lt;yauction-category-picker />.

## Event

| Event Signature | Description |
| ----------- | ----------- |
| yauction-category-picker-pick | Fired when user finish picked category. Developers could gather picked data > `{ picked,path }` through event.detail. |
| yauction-category-picker-cancel | Fired when &lt;yauction-category-picker /> canceled.（user closed &lt;yauction-category-picker />） |
| yauction-category-picker-error | Fired when &lt;yauction-category-picker /> fetching error. Develpoers could gather information through `event.detail`.（&lt;yauction-category-picker /> will put server response to event.detail.`cause`） |

## Reference
- [&lt;yauction-category-picker /> DEMO](https://blog.lalacube.com/mei/webComponent_yauction-category-picker.html)
- [WEBCOMPONENTS.ORG](https://www.webcomponents.org/element/yauction-category-picker)
- [YouTube](https://www.youtube.com/shorts/PF15f_DRSgY)
- [TW Yahoo! Auction](https://tw.bid.yahoo.com/)
