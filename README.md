[![LENIS](https://assets.darkroom.engineering/hoverly/banner.gif)](https://github.com/ofelipeotto/hoverly)

[![npm](https://img.shields.io/npm/v/hoverly?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/hoverly)
[![downloads](https://img.shields.io/npm/dm/hoverly?colorA=E30613&colorB=000000
)](https://www.npmjs.com/package/hoverly)
[![size](https://img.shields.io/bundlephobia/minzip/hoverly?label=size&colorA=E30613&colorB=000000)](https://bundlephobia.com/package/hoverly)

## Introduction

Hoverly is a lightweight and highly customizable library for creating interactive cursors in web interfaces. It allows you to replace the system’s default cursors with fully custom visual elements, adapting them to different contexts such as click states, text selection, or specific user interactions.

With a simple API, you can define custom cursors using HTML and SVG, as well as apply dynamic effects like text flags and chase animations. Hoverly provides flexibility to integrate unique cursors into any project, whether to highlight interactions or enhance the user’s visual experience.

- [Packages](#packages)
- [Installation](#installation)
- [Setup](#setup)
- [Events](#events)
- [Hoverly in Use](#hoverly-in-use)
- [License](#license)

## Packages

- [hoverly](https://github.com/ofelipeotto/hoverly/blob/main/README.md)
- [hoverly/react](https://github.com/ofelipeotto/hoverly/blob/main/packages/react/README.md)
- [hoverly/vue](https://github.com/ofelipeotto/hoverly/tree/main/packages/vue/README.md)
- [hoverly/framer](https://hoverly.framer.website/)
- [hoverly/snap](https://github.com/ofelipeotto/hoverly/tree/main/packages/snap/README.md)

<br>

## Installation

Using a package manager:

```bash
npm i hoverly
```
```js
import Hoverly from 'hoverly';
import 'hoverly/css';

```

<br/>

Using scripts:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/hoverly@1.0.0/hoverly.min.css">
<script src="https://cdn.jsdelivr.net/npm/hoverly@1.0.0/hoverly.min.js"></script>
```


<br>

## Setup

### Basic:

```js
var myCursor = Hoverly.init({

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
var myCursor = Hoverly.init({

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

## Hoverly in use

- [Romulo in Motion](https://romuloinmotion.felipeotto.com) by [Felipe Otto](https://www.felipeotto.com/)

<br/>

## License

MIT © [ofelipeotto](https://github.com/ofelipeotto)
