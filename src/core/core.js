export default class Pointerly {

    constructor() {

        //------------------------------------------------------
        // Infos

        this.version = __VERSION__;

        this.valid = false;

        this.consolePrefix = `[Pointerly]`;

        this.debug = false;

        this.console = this.createConsole();

        this.webGLSupported = this.utils_hasWebGLSupport();

        this.handleUtils_sizeViewPort = this.utils_sizeViewPort().bind(this);

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

        //this.init();

        //------------------------------------------------------
        // Complete

        //this.valid = this.complete();

        return;
    }
}
