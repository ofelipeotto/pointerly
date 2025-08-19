[![npm](https://img.shields.io/npm/v/pointerly?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/pointerly)

[![npm-downloads](https://img.shields.io/npm/dm/pointerly?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/pointerly)

[![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/pointerly?label=jsDelivr%20downloads&colorA=E30613&colorB=000000
)](https://www.jsdelivr.com/package/npm/swiper)

[![size](https://img.shields.io/bundlephobia/minzip/pointerly?label=size&colorA=E30613&colorB=000000
)](https://bundlephobia.com/package/pointerly)


## Introduction

Pointerly is a lightweight and highly customizable library for creating interactive cursors in web interfaces. It allows you to replace the system’s default cursors with fully custom visual elements, adapting them to different contexts such as click states, text selection, or specific user interactions.

With a simple API, you can define custom cursors using HTML and SVG, as well as apply dynamic effects like text flags and chase animations. Pointerly provides flexibility to integrate unique cursors into any project, whether to highlight interactions or enhance the user’s visual experience.

- [Packages](#packages)
- [Installation](#installation)
- [Setup](#setup)
- [Events](#events)
- [Pointerly in Use](#pointerly-in-use)
- [License](#license)

## Packages

- [pointerly](https://github.com/ofelipeotto/pointerly/blob/main/README.md)
- [pointerly/react](https://github.com/ofelipeotto/pointerly/blob/main/packages/react/README.md)
- [pointerly/vue](https://github.com/ofelipeotto/pointerly/tree/main/packages/vue/README.md)
- [pointerly/framer](https://pointerly.framer.website/)
- [pointerly/snap](https://github.com/ofelipeotto/pointerly/tree/main/packages/snap/README.md)

<br>

## Installation

Using a package manager:

```bash
npm i pointerly
```

```js
import Pointerly from 'pointerly';
import 'pointerly/css';

```

<br/>

Using scripts:
<br/>
CSS (in the <head>)
<br/>
Include the Pointerly styles inside the <head> tag:

```html

<!-- unpkg -->
<script src="https://unpkg.com/pointerly@1.0.0/pointerly.min.css"></script>

<!-- jsdelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pointerly@1.0.0/pointerly.min.css">

```

JS (before the closing <body>)
<br/>
Include the Pointerly JavaScript before the closing </body> tag:
<br/>
```html

<!-- unpkg -->
<script src="https://unpkg.com/pointerly@1.0.0/pointerly.min.js"></script>

<!-- jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/pointerly@1.0.0/pointerly.min.js"></script>

```

<br>

## Setup

### Basic:

```js
var myCursor = Pointerly.init({

    cursors: {

        default: '<div class="cursor-default">👆</div>',
        grab: '<div class="cursor-default">🤚</div>',
        view: '<div class="cursor-default">👀</div>',
    },

    flags: {

        text: {
            effect: 'chase',
            render:
                `<div class="custom-cursor-flag">👽</div>`,
        }

    },
});
```

### Custom:

```js
var myCursor = Pointerly.init({

    cursors: {

        default:
            `<div class="custom-cursor-default">
                
                <img class="lazyload" src="assets/media/cursors/default.svg" width="" height="" />
                
            </div>`,

        pointer:
            `<div class="custom-cursor-pointer">
                
                <img class="lazyload" src="assets/media/cursors/pointer.svg" width="" height="" />
                
            </div>`,

        grab:
            `<div class="custom-cursor-grab">
                
                <img class="lazyload" src="assets/media/cursors/grab.svg" width="" height="" />
                
            </div>`,

        text:
            `<div class="custom-cursor-text">
                
                <img class="lazyload" src="assets/media/cursors/text.svg" width="" height="" />
                
            </div>`,
    },

    flags: {

        text: {
            effect: 'chase',
            render:
                `<div class="custom-cursor-flag">

                    <div class="wrapper text-color-primary">

                        <span class="text"></span>

                        <span class="text duplicate"></span>

                    </div>
                        
                </div>`,
        }

    },

    on: {

        updateCursor: (cursor) => {

            const text = cursor.elementUnder?.getAttribute('data-cursor-flag-text');

            const cursorFlagTexts = document.querySelectorAll('.custom-cursor-flag .text');

            if (text && cursorFlagTexts) {

                cursorFlagTexts.forEach(textFlag => {

                    textFlag.textContent = text;

                });
            }
        },
    },

    debug: true,
});
```

## Pointerly in use

- [Romulo in Motion](https://romuloinmotion.felipeotto.com) by [Felipe Otto](https://www.felipeotto.com/)

<br/>

## License

MIT © [ofelipeotto](https://github.com/ofelipeotto)
