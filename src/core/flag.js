export function addFlag(Pointerly) {

    Pointerly.prototype.updateCursorFlag = function (cursorFlag) {

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
    };
}