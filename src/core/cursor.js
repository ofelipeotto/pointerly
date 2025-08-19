export function addCursor(Pointerly) {

    Pointerly.prototype.moveCursor = function () {

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
    };

    Pointerly.prototype.updateCursor = function () {

        // Check Fullscreen
        this.utils_checkFullscreen();

        // Gambiarra
        if (this.fullscreenActive) {
            this.lastCursorFlag = null;
            this.lastCursorType = null;
        }

        this.utils_checkIsMobileDevice();

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

        this.cursor.container = this.cursorEl;

        this.runTriggers('updateCursor', this.cursor);
    };
    Pointerly.prototype.updateCursorType = function (cursorType, validCursor) {

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

            this.wrapper.setAttribute('data-pointerly-custom', cursorType);
            this.wrapper.setAttribute('data-pointerly-system', '');
            this.wrapper.setAttribute('data-pointerly-valid', 'true');

            this.cursorTypeEl[cursorType].classList.add('current');
            this.cursorEl.setAttribute('data-cursor-current', cursorType);


        } else {

            this.wrapper.setAttribute('data-pointerly-custom', '');
            this.wrapper.setAttribute('data-pointerly-system', cursorType);
            this.wrapper.setAttribute('data-pointerly-valid', 'false');

            this.cursorEl.setAttribute('data-cursor-current', '');
        }
    };
}