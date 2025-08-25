export function addStates(Pointerly) {

    Pointerly.prototype.init = function (data = {}) {

        if (data.debug) this.debug = data.debug;

        this.console.info('Init cursor...');

        if (data.systemCursors) this.systemCursors = data.systemCursors;

        if (data.on) {

            this.addEventTrigger = data.on;

            if (this.addEventTrigger) {

                Object.entries(this.addEventTrigger).forEach(([stage, event]) => {

                    if (typeof event === 'function') {

                        // Se for apenas uma função, assume prioridade padrão
                        this.on(stage, event);

                    } else if (typeof event === 'object' && typeof event.callback === 'function') {

                        // Se for um objeto, usa a prioridade informada ou 1000 como padrão
                        this.on(stage, event.callback, event.priority ?? 1000);
                    }
                });
            }
        }

        // Wrapper 
        if (data.wrapper) {
            this.wrapper = this.utils_asArray(data.wrapper)[0];
        }

        if (!this.wrapper) {
            this.console.error('Wrapper not found');
            return;
        }

        const dataCursors = {
            types: data.types ?? data.cursors ?? {},
            flags: data.flags ?? {},
        };

        Object.entries(dataCursors).forEach(([mode, data]) => {

            this.prepareCursorMode(mode, data);

        });

        if (this.cursorTypes.length === 0) {
            this.console.error('No defined cursor types');
            return;
        }

        // Add class in Wrapper Main
        this.wrapper.classList.add('pointerly-wrapper');

        // Create cursor
        this.cursorEl = this.createElement('div', {

            class: 'pointerly',

            insertPrepend: this.wrapper
        });

        // Wrapper Types
        this.wrapperCursorTypesEl = this.createElement('div', {

            class: ['pointerly-wrapper-cursor-types'],

            insert: this.cursorEl
        });

        // Types
        this.cursorTypes.forEach(type => {

            const cursorTypeEl = this.createElement('div', {

                class: ['pointerly-type'],
                attrs: {
                    'data-type': type,
                },
                insert: this.wrapperCursorTypesEl
            });

            this.cursorTypeEl[type] = cursorTypeEl;

            this.helper_customRendering(`types-${type}`, cursorTypeEl);
        });


        // Flags
        if (this.cursorFlags.length) {

            // Wrapper Types
            this.wrapperCursorFlagsEl = this.createElement('div', {

                class: 'pointerly-wrapper-cursor-flags',

                insert: this.cursorEl
            });

            this.cursorFlags.forEach(flag => {

                const cursorFlagsClass = ['pointerly-flag'];

                if (this.cursorFlagConfig[flag].effect) {
                    cursorFlagsClass.push(`pointerly-flag-effect-${this.cursorFlagConfig[flag].effect}`);
                }

                if (this.cursorFlagConfig[flag].pos !== 'default') {
                    cursorFlagsClass.push(`pointerly-flag-pos-${this.cursorFlagConfig[flag].pos}`);
                }

                const cursorFlagEl = this.createElement('div', {

                    class: cursorFlagsClass,
                    attrs: {
                        'data-flag': flag,
                    },
                    insert: this.wrapperCursorFlagsEl
                });

                this.cursorFlagEl[flag] = cursorFlagEl;

                this.helper_customRendering(`flags-${flag}`, cursorFlagEl);

            });
        }

        // System Cursors
        this.wrapper.setAttribute('data-pointerly-system-cursors', this.systemCursors);

        // Loaded 
        this.wrapper.setAttribute('data-pointerly-loaded', 'true');
        this.loaded = true;


        // Prepare elements
        this.___prepareAllElements___();

        // Check size viewport
        window.addEventListener('resize', this.handleUtils_sizeViewPort);

        this.utils_sizeViewPort(); 

        //------------------------------------------------------
        // Events

        this.startEvents();

        // Trigger Init
        this.runTriggers('init');

        return this;
    };

    Pointerly.prototype.prepareCursorMode = function (mode, data) {

        Object.entries(data).forEach(([variant, value]) => {

            if (mode == 'types') {

                this.cursorTypes.push(variant);

            } else if (mode == 'flags') {

                this.cursorFlags.push(variant);
            }

            if (
                typeof value === 'function' ||
                typeof value === 'string' ||
                value instanceof Node
            ) {

                this.customRenderList[`${mode}-${variant}`] = value;

            } else if (typeof value === 'object') {

                if (value.render) {

                    this.customRenderList[`${mode}-${variant}`] = value.render;
                }

                if (mode == 'flags') {

                    this.cursorFlagConfig[variant] = {
                        effect: null,
                        pos: 'default',
                        smartSize: false,
                        viewportSafe: false,
                        size: {
                            width: null,
                            height: null
                        }
                    };

                    if (value.pos && ['default', 'left', 'right', 'top', 'bottom'].includes(value.pos)) {

                        this.cursorFlagConfig[variant].pos = value.pos;
                    }

                    if (value.effect && ['chase'].includes(value.effect) && !this.utils_isSafariBrowser()) {

                        this.cursorFlagConfig[variant].effect = value.effect;
                    }

                    if (value.smartSize && typeof value.smartSize === 'boolean') {
                        this.cursorFlagConfig[variant].smartSize = value.smartSize;
                    }

                    if (value.viewportSafe && typeof value.viewportSafe === 'boolean') {
                        this.cursorFlagConfig[variant].viewportSafe = value.viewportSafe;
                    }
                }
            }
        });
    };

    Pointerly.prototype.refresh = function () {

        this.console.info('Refresh cursor...');

        // Prepare elements
        this.___prepareAllElements___();

        // Trigger Init
        this.runTriggers('refresh');

        // Check size viewport 
        this.utils_sizeViewPort();
    };

    Pointerly.prototype.___prepareElement___ = function (element) {

        if (!element) return;

        if (!this.domElements.has(element)) {

            // Set
            const helper_guessCursorType = this.helper_guessCursorType(element);
            const isValid = this.cursorTypes.includes(helper_guessCursorType) && helper_guessCursorType !== 'none';

            const helper_guessCursorFlag = this.helper_guessCursorFlag(element);

            this.domElements.set(element, {
                type: helper_guessCursorType ?? 'default',
                flag: helper_guessCursorFlag ?? null,
                valid: isValid,
            });

            /*element.addEventListener('mouseleave', () => {
 
                this.cursor.elementUnder = null;
                this.updateCursor();
 
            });*/
        }

        return this.domElements.get(element);
    };

    Pointerly.prototype.___prepareAllElements___ = function () {

        this.utils_asArray('[data-cursor]').forEach(element => {

            this.___prepareElement___(element);
            //console.log(element);

            element.addEventListener('pointerenter', () => {

                this.cursor.elementUnder = element;
                this.updateCursor();

            });

        });
    };
  
    Pointerly.prototype.destroy = function () {

        this.debug = false;
        this.container = null;
        this.wrapperFields = null;
        this.submitResponse = null;
        this.submitButton = null;
        this.id = null;
        this.action = '';
        this.redirect = false;
        this.lang = 'en';
        this.messages = {};
        this.fieldsSet = {};
        this.errors = null;
        this.inputCaptcha = null;
        this.valid = false;

        window.removeEventListener('resize', this.handleUtils_sizeViewPort);
    };

    Pointerly.prototype.complete = function () {

        this.console.info(`Complete`);
        this.runTriggers('complete');
    };
}