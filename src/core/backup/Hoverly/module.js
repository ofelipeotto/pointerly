//------------------------------------------------------
// Nutty Cursor

(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(); // CommonJS e Node.js
    } else if (typeof define === "function" && define.amd) {
        define([], factory); // AMD
    } else {
        global.Hoverly = factory(); // CDN e global
    }
}(typeof window !== "undefined" ? window : this, function () {

    /* 
    Esse código permite que o Hoverly seja utilizado como um módulo NPM, importado via ES6 (import Hoverly from 'hoverly'), ou carregado diretamente via CDN (<script src="https://cdn.example.com/hoverly.min.js"></script>), atribuindo a classe ao window.Hoverly.

    import Hoverly from "hoverly";
    const cursor = new Hoverly("#myCursor", {});

    */

    class Hoverly {

        constructor() {

            //------------------------------------------------------
            // Infos

            this.valid = false;

            this.consolePrefix = `[Hoverly]`;

            this.debug = false;

            this.console = this.createConsole();

            this.webGLSupported = this.helpers.hasWebGLSupport();

            if (!this.webGLSupported) {
                this.console.error('WebGL not supported.');
            }

            this.inWrapper = false;

            this.loaded = false;

            this.cursor = {

                type: null,

                flag: {
                    pos: {
                        x: 0,
                        y: 0,
                    }
                },

                pos: {
                    x: 0,
                    y: 0,
                },

                elementUnder: null,
            };

            this._viewport = {};

            this.selector = 'data-cursor';

            this.flagSelector = 'data-cursor-flag';

            this.systemCursors = false;

            this.lastCursorType = null;

            this.lastCursorFlag = null;

            this.lastEvent = null;

            this.fullscreenActive = false;

            this.fullscreenActiveMsg = false;

            this.isMobileDevice = false;

            this.isMobileDeviceMsg = false;

            this.eventClassTimeout = {
                move: null,
                click: null,
                dblclick: null,
                mousedown: null,
                mouseup: null
            };

            this.checkFlagSizeTimeout = {};

            //------------------------------------------------------
            // Triggers

            this.triggers = {
                init: [],

                enter: [],
                move: [],
                click: [],
                dblclick: [],
                mousedown: [],
                mouseup: [],
                leave: [],

                refresh: [],
                complete: [],
                updateCursor: []
            };

            this.addEventTrigger = {};

            //------------------------------------------------------
            // Hydration

            // Wrapper 
            this.wrapper = document.body;

            // Elements
            this.domElements = new WeakMap();

            // Types
            this.cursorTypes = [];

            // Flags
            this.cursorFlags = [];

            // Custom Render
            this.customRenderList = {};

            // Configs
            this.cursorTypeConfig = {};

            this.cursorFlagConfig = {};

            // Cursor Element
            this.cursorEl = null;

            this.wrapperCursorTypesEl = null;

            this.wrapperCursorFlagsEl = null;

            this.cursorTypeEl = {};

            this.cursorFlagEl = {};

            //------------------------------------------------------
            // Init

            this.init();

            //------------------------------------------------------
            // Complete

            this.valid = this.complete();

            return;
        }

        //------------------------------------------------------
        // AddEventTrigger
        on(stage, callback, priority = 1000) {

            if (typeof callback === 'function' && this.triggers[stage]) {

                this.triggers[stage].push({ callback, priority });

            } else {

                console.error('Callback deve ser uma função e o estágio deve ser válido (initial, leave, enter).');
            }
        }

        //------------------------------------------------------
        // Run Triggers
        async runTriggers(stage, data = null) {

            if (!this.triggers[stage]) {

                console.error(`Estágio inválido: ${stage}`);
                return;
            }

            // Ordena por prioridade antes de executar
            this.triggers[stage].sort((a, b) => a.priority - b.priority);

            if (this.debug) {
                //console.log(`Funções no estágio "${stage}":`);
                this.triggers[stage].forEach((trigger, index) => {
                    //console.log(`Função ${index + 1}:`, trigger.callback.name || "Função anônima");
                    //console.log(`Prioridade: ${trigger.priority}`);
                    //console.log(`Conteúdo da função: ${trigger.callback.toString()}`);
                    //console.log("");
                });
            }

            for (const { callback, priority } of this.triggers[stage]) {

                try {
                    await callback(data);

                } catch (error) {

                    if (this.debug) {
                        console.error(`Erro ao executar trigger no estágio "${stage}"`);
                        console.error(`Função:`, callback.name || "Função anônima");
                        console.error(`Prioridade: ${priority}`);
                        console.error(`Conteúdo da função: ${callback.toString()}`);
                        console.error(`Erro:`, error);
                        //console.log("");
                    }
                }
            }
        }

        prepareCursorMode(mode, data) {

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

                        if (value.effect && ['chase'].includes(value.effect) && !this.utils.isSafariBrowser()) {

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
        }

        //------------------------------------------------------
        // Init

        init(data = {}) {

            this.console.info('Init cursor...');

            if (data.debug) this.debug = data.debug;

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
                this.wrapper = this.utils.asArray(data.wrapper)[0];
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
            this.wrapper.classList.add('hoverly-wrapper');

            // Create cursor
            this.cursorEl = this.utils.createElement('div', {

                class: 'hoverly',

                insertPrepend: this.wrapper
            });

            // Wrapper Types
            this.wrapperCursorTypesEl = this.utils.createElement('div', {

                class: ['hoverly-wrapper-cursor-types'],

                insert: this.cursorEl
            });

            // Types
            this.cursorTypes.forEach(type => {

                const cursorTypeEl = this.utils.createElement('div', {

                    class: ['hoverly-type'],
                    attrs: {
                        'data-type': type,
                    },
                    insert: this.wrapperCursorTypesEl
                });

                this.cursorTypeEl[type] = cursorTypeEl;

                this.helpers.customRendering(`types-${type}`, cursorTypeEl);
            });

            // Flags

            if (this.cursorFlags.length) {

                // Wrapper Types
                this.wrapperCursorFlagsEl = this.utils.createElement('div', {

                    class: 'hoverly-wrapper-cursor-flags',

                    insert: this.cursorEl
                });

                this.cursorFlags.forEach(flag => {

                    const cursorFlagsClass = ['hoverly-flag'];

                    if (this.cursorFlagConfig[flag].effect) {
                        cursorFlagsClass.push(`hoverly-flag-effect-${this.cursorFlagConfig[flag].effect}`);
                    }

                    if (this.cursorFlagConfig[flag].pos !== 'default') {
                        cursorFlagsClass.push(`hoverly-flag-pos-${this.cursorFlagConfig[flag].pos}`);
                    }

                    const cursorFlagEl = this.utils.createElement('div', {

                        class: cursorFlagsClass,
                        attrs: {
                            'data-flag': flag,
                        },
                        insert: this.wrapperCursorFlagsEl
                    });

                    this.cursorFlagEl[flag] = cursorFlagEl;

                    this.helpers.customRendering(`flags-${flag}`, cursorFlagEl);

                });
            }

            // System Cursors
            this.wrapper.setAttribute('data-hoverly-system-cursors', this.systemCursors);

            // Loaded 
            this.wrapper.setAttribute('data-hoverly-loaded', 'true');
            this.loaded = true;

            // Prepare elements
            this.___prepareAllElements___();

            // Check size viewport
            window.addEventListener('resize', () => {
                this.checkSizeViewPort();
            });

            this.checkSizeViewPort();



            //------------------------------------------------------
            // Events

            this.startEvents();

            // Trigger Init
            this.runTriggers('init');

            return true;
        }

        checkSizeViewPort() {

            this._viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }

        refresh() {

            this.console.info('Refresh cursor...');

            // Prepare elements
            this.___prepareAllElements___();

            // Trigger Init
            this.runTriggers('refresh');

            // Check size viewport 
            this.checkSizeViewPort();
        }

        ___prepareElement___(element) {

            if (!element) return;

            if (!this.domElements.has(element)) {

                // Set
                const guessCursorType = this.helpers.guessCursorType(element);
                const isValid = this.cursorTypes.includes(guessCursorType) && guessCursorType !== 'none';

                const guessCursorFlag = this.helpers.guessCursorFlag(element);

                this.domElements.set(element, {
                    type: guessCursorType ?? 'default',
                    flag: guessCursorFlag ?? null,
                    valid: isValid,
                });

                /*element.addEventListener('mouseleave', () => {
    
                    this.cursor.elementUnder = null;
                    this.updateCursor();
    
                });*/
            }

            return this.domElements.get(element);
        }

        ___prepareAllElements___() {

            this.utils.asArray('[data-cursor]').forEach(element => {

                this.___prepareElement___(element);
                //console.log(element);

                element.addEventListener('pointerenter', () => {

                    this.cursor.elementUnder = element;
                    this.updateCursor();

                });

            });
        }

        //------------------------------------------------------
        // Start Events

        startEvents() {

            // Move
            //this.wrapper.addEventListener('mousemove', (e) => {
            this.wrapper.addEventListener('pointermove', (e) => {

                if (!this.loaded) return;

                // Enter
                this.enter(e);

                // Move
                this.move(e);

            });

            /*this.wrapper.addEventListener('pointerhover', (e) => {

                if (!this.loaded) return;

                // Enter
                this.enter(e);

            });*/

            // Click
            this.wrapper.addEventListener('click', (e) => {

                if (!this.loaded) return;

                this.click(e);

            });

            // Double Click
            this.wrapper.addEventListener('dblclick', (e) => {

                if (!this.loaded) return;

                this.doubleClick(e);

            });

            // Mouse Down
            this.wrapper.addEventListener('mousedown', (e) => {

                if (!this.loaded) return;

                this.mouseDown(e);

            });

            // Mouse Up
            this.wrapper.addEventListener('mouseup', (e) => {

                if (!this.loaded) return;

                this.mouseUp(e);

            });

            // Leave
            this.wrapper.addEventListener('mouseleave', () => {

                if (!this.loaded) return;

                this.leave();

            });
        }

        //------------------------------------------------------
        // Enter

        enter(e) {

            if (!this.inWrapper) {

                this.console.info(`Enter`);

                this.inWrapper = true;
                this.cursorEl.classList.add('active');

                this.runTriggers('enter');
            }
        }

        //------------------------------------------------------
        // Move

        move(e) {

            const eventData = this.helpers.getEventData(e);

            this.runTriggers('move', eventData);

            // Event
            this.helpers.setLastEvent('move');

            // Config cursor
            this.cursor.pos.x = eventData.pos.x;
            this.cursor.pos.y = eventData.pos.y;

            this.cursor.elementUnder = eventData.elementUnder;

            // Move Cursor
            this.moveCursor();

            // Prepara o element under
            this.___prepareElement___(this.cursor.elementUnder);

            this.updateCursor();
        }

        moveCursor() {

            const { x, y } = this.cursor.pos;

            const cursorFlagCurrent = this.cursor.flag?.current;
            const config = this.cursorFlagConfig[cursorFlagCurrent] ?? {};

            let effect;
            let lerp;

            if (config && config.effect) {

                effect = config.effect;
                if (effect == 'chase') lerp = 0.1;
            }

            const updatePos = () => {

                if (this.cursorFlags.length) {

                    // Types
                    this.wrapperCursorTypesEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;

                    // Flag
                    this.wrapperCursorFlagsEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;

                    /*if (Object.entries(config).length) {

                        if (config.viewportSafe === false) {

                            this.wrapperCursorFlagsEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;

                        } else {

                            if (config.size.width) {

                                const padding = 20; // ajuste se quiser margem

                                const clampedX = Math.min(Math.max(padding, x), this._viewport.width - config.size.width - padding);
                                const clampedY = Math.min(Math.max(padding, y), this._viewport.height - config.size.height - padding);

                                this.wrapperCursorFlagsEl.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;

                            }
                            else {
                                // fallback
                                this.wrapperCursorFlagsEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                            }

                        }*/

                        /*if (this.lastCursorFlag && effect) {
        
                            // Chase não está tendo efeito com lerp -> Corrigir
                            if (effect === 'chase') { 
                                
                                // Flag usa lerp para seguir o mouse com atraso
                                this.cursor.flag.pos.x += (x - this.cursor.flag.pos.x) * lerp;
                                this.cursor.flag.pos.y += (y - this.cursor.flag.pos.y) * lerp; 
        
                                this.wrapperCursorFlagsEl.style.transform = `translate3d(${this.cursor.flag.pos.x}px, ${this.cursor.flag.pos.y}px, 0)`;
                            }
        
                        } else {
        
                            this.wrapperCursorFlagsEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                        }*/

                    //}

                }
                else {

                    this.cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;

                }



                const distance = Math.sqrt(x * x + y * y);

                if (distance > 0.5) {
                    requestAnimationFrame(updatePos);
                }
            };

            updatePos();
        }

        updateCursor() {

            // Check Fullscreen
            this.checkFullscreen();

            // Gambiarra
            if (this.fullscreenActive) {
                this.lastCursorFlag = null;
                this.lastCursorType = null;
            }

            this.checkIsMobileDevice();

            if (!this.cursor.elementUnder) return;

            const currentElementUnder = this.domElements.get(this.cursor.elementUnder);

            // Update Flag
            if (this.lastCursorFlag !== currentElementUnder.flag) {

                this.updateCursorFlag(currentElementUnder.flag);
            }

            // Update Type
            if (this.lastCursorType !== currentElementUnder.type) {

                this.updateCursorType(currentElementUnder.type, currentElementUnder.valid);
            }

            this.runTriggers('updateCursor', this.cursor);
        }

        //------------------------------------------------------
        // Update

        updateCursorType(cursorType, validCursor) {

            this.lastCursorType = cursorType;

            this.cursor.type = cursorType;

            Object.values(this.cursorTypeEl).forEach(cursor => {

                if (cursor instanceof Element) {
                    cursor.classList.remove('current');
                }
            });

            if (validCursor
                && this.fullscreenActive === false
                && this.isMobileDevice === false
                && (this.cursorTypeEl[cursorType] instanceof Element)) {

                //console.log('valido! fullscreenActive:', this.fullscreenActive);

                this.wrapper.setAttribute('data-hoverly-custom', cursorType);
                this.wrapper.setAttribute('data-hoverly-system', '');
                this.wrapper.setAttribute('data-hoverly-valid', 'true');

                this.cursorTypeEl[cursorType].classList.add('current');
                this.cursorEl.setAttribute('data-cursor-current', cursorType);


            } else {

                this.wrapper.setAttribute('data-hoverly-custom', '');
                this.wrapper.setAttribute('data-hoverly-system', cursorType);
                this.wrapper.setAttribute('data-hoverly-valid', 'false');

                this.cursorEl.setAttribute('data-cursor-current', '');
            }
        }

        updateCursorFlag(cursorFlag) {

            this.lastCursorFlag = cursorFlag;

            this.cursor.flag.current = cursorFlag;

            Object.values(this.cursorFlagEl).forEach(flag => {

                if (flag instanceof Element) {
                    flag.classList.remove('current');
                }
            });

            if (this.fullscreenActive === false
                && this.isMobileDevice === false
                && (this.cursorFlagEl[cursorFlag] instanceof Element)) {

                this.cursorFlagEl[cursorFlag].classList.add('current');

                const updateSize = () => {

                    /*const rect = this.cursorFlagEl[cursorFlag].getBoundingClientRect();

                    this.cursorFlagConfig[cursorFlag].size = {
                        width: rect.width,
                        height: rect.height
                    };*/

                    const flagEl = this.cursorFlagEl[cursorFlag];
                    const rect = flagEl.getBoundingClientRect();

                    // Captura o `transform` computado
                    const computedStyle = window.getComputedStyle(flagEl);
                    const transform = computedStyle.transform;

                    let offsetX = 0;
                    let offsetY = 0;

                    if (transform && transform !== 'none') {

                        const match = transform.match(/matrix\(([^)]+)\)/);

                        if (match) {

                            const values = match[1].split(',').map(parseFloat);

                            if (values.length === 6) {
                                // matrix(a, b, c, d, tx, ty)
                                offsetX = values[4];
                                offsetY = values[5];
                            }
                        }
                    }

                    this.cursorFlagConfig[cursorFlag].size = {
                        width: rect.width + offsetX,
                        height: rect.height + offsetY
                    };

                    this.console.log('[Size Updated]', this.cursorFlagConfig[cursorFlag]);
                };

                if (this.cursorFlagConfig[cursorFlag].smartSize === true) {

                    updateSize();

                } else if (!this.checkFlagSizeTimeout[cursorFlag]) {

                    // Apenas uma vez, se ainda não foi feito
                    this.checkFlagSizeTimeout[cursorFlag] = setTimeout(() => {
                        updateSize();
                    }, 500);
                }
            }
        }

        //------------------------------------------------------
        // Leave

        leave() {

            this.console.info(`Leave`);

            this.inWrapper = false;
            this.cursorEl.classList.remove('active');

            this.runTriggers('leave');
        }

        //------------------------------------------------------
        // Click

        click(e) {

            const eventData = this.helpers.getEventData(e);

            this.console.info(`Click`);

            // Event
            this.helpers.setLastEvent('click');

            this.runTriggers('click', eventData);
        }

        //------------------------------------------------------
        // Double Click

        doubleClick(e) {

            const eventData = this.helpers.getEventData(e);

            this.console.info(`Double click`);

            // Event
            this.helpers.setLastEvent('dblclick');

            this.runTriggers('dblclick', eventData);
        }

        //------------------------------------------------------
        // Mouse Down

        mouseDown(e) {

            const eventData = this.helpers.getEventData(e);

            this.console.info(`Mouse down`);

            // Event
            this.helpers.setLastEvent('mousedown');

            this.runTriggers('mousedown', eventData);
        }

        //------------------------------------------------------
        // Mouse Up

        mouseUp(e) {

            const eventData = this.helpers.getEventData(e);

            this.console.info(`Mouse up`);

            // Event
            this.helpers.setLastEvent('mouseup');

            this.runTriggers('mouseup', eventData);
        }

        //------------------------------------------------------
        // Complete

        complete() {
            this.console.info(`Complete`);

            this.runTriggers('complete');
        }

        //------------------------------------------------------
        // Console

        createConsole() {

            if (!this.debug) {

                return {
                    log: () => { },
                    info: () => { },
                    warn: () => { },
                    error: () => { },
                    table: () => { },
                };
            }

            const prefix = this.consolePrefix;

            return {
                log: (...args) => console.log(prefix, ...args),
                info: (...args) => console.info(prefix, ...args),
                warn: (...args) => console.warn(prefix, ...args),
                error: (...args) => console.error(prefix, ...args),
                table: (...args) => {
                    const data = args.pop();
                    console.log(prefix, ...args);
                    console.table(data);
                },
            };
        }

        //------------------------------------------------------
        // Destroy

        destroy() {

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
        }

        //------------------------------------------------------
        // Helpers

        helpers = {

            getEventData: (event) => {

                // Coordinates
                const x = event.clientX;
                const y = event.clientY;

                // Element
                const elementUnder = document.elementFromPoint(event.clientX, event.clientY);

                let eventData = {
                    event: event,
                    pos: {
                        x: x,
                        y: y,
                    },
                    elementUnder: elementUnder,
                }

                return eventData;
            },

            //------------------------------------------------------
            // Set class event

            setLastEvent: (event) => {

                let className;

                if (event == 'move') className = 'moving';
                else if (event == 'click') className = 'clicked';
                else if (event == 'dblclick') className = 'doubleclick';
                else if (event == 'mousedown') className = 'mousedown';
                else if (event == 'mouseup') className = 'mouseup';

                if (this.lastEvent != event) {
                    this.wrapper.setAttribute('data-hoverly-last-event', event);
                    this.lastEvent = event;
                }

                this.cursorEl.classList.add(className);

                // Limpa timeout anterior, se existir
                if (this.eventClassTimeout[event]) {
                    clearTimeout(this.eventClassTimeout[event]);
                }

                // Cria novo timeout
                this.eventClassTimeout[event] = setTimeout(() => {
                    this.cursorEl.classList.remove(className);
                    this.eventClassTimeout[event] = null;
                }, 100);
            },

            validateCustomRendering: (value, key) => {

                if (
                    typeof value === 'function' ||
                    typeof value === 'string' ||
                    value instanceof Node
                ) {
                    this.customRenderList[key] = value;
                    return true;
                }

                return false;
            },

            customRendering: (key, insertIn, data = {}) => {

                if (!key || !insertIn) return null;

                if (!this.customRenderList[key] || typeof key !== 'string') return null;

                const rawRender = this.customRenderList[key];
                const customRender = this.helpers.resolveRenderOutput(rawRender, this, data);

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
            },

            resolveRenderOutput: (renderItem, context = {}, data = {}) => {

                // Se for função, executa passando o contexto e os dados
                if (typeof renderItem === 'function') {

                    const result = renderItem.call(context, data);
                    return this.helpers.resolveRenderOutput(result, context, data);
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
            },

            guessCursorFlag: (el) => {

                if (!el) return;

                const dataSetCursorFlag = el.getAttribute(this.flagSelector) ?? null;

                return dataSetCursorFlag;

            },

            guessCursorType: (el) => {

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
            },

            hasWebGLSupport: () => {

                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && (
                        canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
                    );
                } catch (e) {
                    return false;
                }
            }
        }

        checkFullscreen() {

            this.fullscreenActive = this.utils.isFullscreenActive();

            //console.log(this.fullscreenActive);

            if (this.fullscreenActive === true) {
                //&& this.fullscreenActiveMsg === false) {

                this.console.log('Fullscreen active');
                this.fullscreenActiveMsg = true;
            }
            else {
                this.fullscreenActiveMsg = false;
            }

        }

        checkIsMobileDevice() {

            this.isMobileDevice = this.utils.isMobileDevice();

            if (this.isMobileDevice && !this.isMobileDeviceMsg) {
                this.console.log('Sorry, not compatible with mobile devices');
                this.isMobileDeviceMsg = true;
            }
            else {
                this.isMobileDeviceMsg = false;
            }
        }

        //------------------------------------------------------
        // Utils

        utils = {

            isFullscreenActive: () => {
                return !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||  // Safari
                    document.webkitEnterFullscreen ||
                    document.mozFullScreenElement ||     // Firefox
                    document.msFullscreenElement         // IE/Edge antigo
                );
            },

            delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

            isSafariBrowser: () => {
                return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            },

            // Função auxiliar para criar elementos
            createElement: (tag, options = {}) => {

                const element = document.createElement(tag);

                // Adiciona classes, atributos e texto, se fornecidos
                if (options.class) {
                    const classList = Array.isArray(options.class)
                        ? options.class
                        : options.class.trim().split(/\s+/);
                    element.classList.add(...classList);
                }

                if (options.attrs) {

                    Object.entries(options.attrs).forEach(([key, value]) => element.setAttribute(key, value));
                }

                if (options.text) element.textContent = options.text;

                if (options.html) element.innerHTML = options.html;

                if (options.insert) {
                    options.insert.appendChild(element);
                }

                if (options.insertPrepend) {
                    options.insertPrepend.prepend(element);
                }

                return element;
            },

            isMobileDevice: () => {
                return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Kindle|Silk|Mobile/i.test(navigator.userAgent);
            },

            asArray: (value, scope = document, leaveStrings = false) => {

                if (value instanceof HTMLElement) return [value];

                // Helpers internos
                const isString = val => typeof val === 'string';
                const isArray = Array.isArray;
                const isArrayLike = val =>

                    val && typeof val.length === 'number' && typeof val !== 'function';

                const flatten = (arr, keepStrings = false) => {

                    arr.reduce((acc, val) => {

                        if (isArray(val)) {

                            acc.push(...flatten(val, keepStrings));

                        } else if (!keepStrings && isString(val)) {

                            acc.push(...toArray(val, scope, keepStrings));

                        } else {

                            acc.push(val);
                        }
                        return acc;

                    }, []);
                };

                // Lógica principal

                if (isString(value) && !leaveStrings) {

                    try {
                        return Array.from(scope.querySelectorAll(value));

                    } catch (e) {

                        return [];
                    }
                }

                if (isArray(value)) {

                    return flatten(value, leaveStrings);
                }

                if (isArrayLike(value)) {

                    return Array.from(value);
                }

                return value ? [value] : [];
            },
        };
    }

    // Instância única
    const _instance = new Hoverly();

    // Exposição pública
    const HoverlyGlobal = {
        version: '1.0.0',
        init: (...args) => _instance.init(...args),
        refresh: (...args) => _instance.refresh(...args),
        _instance
    };

    // Para uso interno de métodos estáticos que precisam acessar a instância
    Hoverly._instance = _instance;

    return HoverlyGlobal;

}));