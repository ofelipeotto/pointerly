export function addUtils(Pointerly) {

    Pointerly.prototype.utils_hasWebGLSupport = function () {

        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (
                canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    };

    Pointerly.prototype.utils_checkFullscreen = function () {

        this.fullscreenActive = this.utils_isFullscreenActive();

        //console.log(this.fullscreenActive);

        if (this.fullscreenActive === true) {
            //&& this.fullscreenActiveMsg === false) {

            this.console.log('Fullscreen active');
            this.fullscreenActiveMsg = true;
        }
        else {
            this.fullscreenActiveMsg = false;
        }

    };

    Pointerly.prototype.utils_checkIsMobileDevice = function () {

        this.isMobileDevice = this.utils_isMobileDevice();

        if (this.isMobileDevice && !this.isMobileDeviceMsg) {
            this.console.log('Sorry, not compatible with mobile devices');
            this.isMobileDeviceMsg = true;
        }
        else {
            this.isMobileDeviceMsg = false;
        }
    };

    Pointerly.prototype.utils_isFullscreenActive = function () {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||  // Safari
            document.webkitEnterFullscreen ||
            document.mozFullScreenElement ||     // Firefox
            document.msFullscreenElement         // IE/Edge antigo
        );
    };

    Pointerly.prototype.utils_isSafariBrowser = function () {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    Pointerly.prototype.utils_sizeViewPort = function () {

        this._viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    };

    // Função auxiliar para criar elementos
    Pointerly.prototype.createElement = function (tag, options = {}) {

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
    };

    Pointerly.prototype.utils_isMobileDevice = function () {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Kindle|Silk|Mobile/i.test(navigator.userAgent);
    };

    Pointerly.prototype.utils_asArray = function (value, scope = document, leaveStrings = false) {

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
    };

}