export function addHelpers(Pointerly) {
    
    Pointerly.prototype.helper_guessCursorFlag = function (el) {

        if (!el) return;

        const dataSetCursorFlag = el.getAttribute(this.flagSelector) ?? null;

        return dataSetCursorFlag;

    };

    Pointerly.prototype.helper_guessCursorType = function (el) {

        if (!el) return;

        const dataSetCursorType = el.getAttribute(this.selector) ?? null;

        if (dataSetCursorType) {

            if (dataSetCursorType === 'auto' || dataSetCursorType === 'initial') return 'default';

            return dataSetCursorType;
        }

        /*const computedCursor = window.getComputedStyle(el).cursor;
 
        // Se o cursor estiver definido explicitamente e não for 'auto' ou 'default', respeite-o
        if (computedCursor && !['auto', 'default'].includes(computedCursor)) {
            return computedCursor;
        }*/

        const tag = el.tagName.toLowerCase();
        const type = el.getAttribute('type');

        if (tag === 'input') {
            if (['text', 'email', 'search', 'url', 'tel', 'password'].includes(type)) return 'text';
            if (['submit', 'button', 'checkbox', 'radio', 'range', 'file', 'range'].includes(type)) return 'pointer';
        }

        if (tag === 'textarea') return 'text';
        if (tag === 'button' || el.onclick) return 'pointer';
        if (tag === 'a' && el.hasAttribute('href')) return 'pointer';

        // Elementos de texto
        const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'strong', 'em', 'b', 'i', 'u', 'small', 'mark', 'label'];
        if (textTags.includes(tag)) return 'text';

        if (el.isContentEditable) return 'text';

        return 'default';
    };

    Pointerly.prototype.helper_customRendering = function (key, insertIn, data = {}) {

        if (!key || !insertIn) return null;

        if (!this.customRenderList[key] || typeof key !== 'string') return null;

        const rawRender = this.customRenderList[key];
        const customRender = this.helper_resolveRenderOutput(rawRender, this, data);

        if (!customRender) return;

        let inserted;

        if (customRender instanceof DocumentFragment) {

            inserted = Array.from(customRender.childNodes);
            insertIn.appendChild(customRender);

        } else if (Array.isArray(customRender)) {

            inserted = customRender;
            insertIn.append(...customRender);

        } else if (customRender instanceof Node) {

            inserted = [customRender];
            insertIn.appendChild(customRender);
        }

        return inserted?.[0] || null;
    };

    Pointerly.prototype.helper_resolveRenderOutput = function (renderItem, context = {}, data = {}) {

        // Se for função, executa passando o contexto e os dados
        if (typeof renderItem === 'function') {

            const result = renderItem.call(context, data);
            return this.helper_resolveRenderOutput(result, context, data);
        }

        // Se for um Node (elemento DOM), retorna direto
        if (renderItem instanceof Node) {

            return renderItem;
        }

        // Se for string
        if (typeof renderItem === 'string') {
            const trimmed = renderItem.trim();

            // Detecta se é HTML com uma tag no início
            const isHTML = /^<.+?>/.test(trimmed);

            if (isHTML) {

                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = trimmed;

                const fragment = document.createDocumentFragment();

                while (tempContainer.firstChild) {
                    fragment.appendChild(tempContainer.firstChild);
                }

                return fragment;

            } else {

                // Texto puro
                return document.createTextNode(trimmed);
            }
        }

        // Fallback
        return null;
    };
}