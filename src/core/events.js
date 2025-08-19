export function addEvents(Pointerly) {

    Pointerly.prototype.startEvents = function () {

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
    };

    Pointerly.prototype.enter = function (e) {

        if (!this.inWrapper) {

            this.console.info(`Enter`);

            this.inWrapper = true;
            this.cursorEl.classList.add('active');

            this.runTriggers('enter');
        }
    };

    Pointerly.prototype.move = function (e) {

        const eventData = this.getEventData(e);

        this.runTriggers('move', eventData);

        // Event
        this.setLastEvent('move');

        // Config cursor
        this.cursor.pos.x = eventData.pos.x;
        this.cursor.pos.y = eventData.pos.y;

        this.cursor.elementUnder = eventData.elementUnder;

        // Move Cursor
        this.moveCursor();

        // Prepara o element under
        this.___prepareElement___(this.cursor.elementUnder);

        this.updateCursor();
    };

    Pointerly.prototype.leave = function () {

        this.console.info(`Leave`);

        this.inWrapper = false;
        this.cursorEl.classList.remove('active');

        this.runTriggers('leave');
    };

    Pointerly.prototype.mouseUp = function (e) {

        const eventData = this.getEventData(e);

        this.console.info(`Mouse up`);

        // Event
        this.setLastEvent('mouseup');

        this.runTriggers('mouseup', eventData);
    };
    
    Pointerly.prototype.mouseDown = function (e) {

        const eventData = this.getEventData(e);

        this.console.info(`Mouse down`);

        // Event
        this.setLastEvent('mousedown');

        this.runTriggers('mousedown', eventData);
    };

    Pointerly.prototype.doubleClick = function (e) {

        const eventData = this.getEventData(e);

        this.console.info(`Double click`);

        // Event
        this.setLastEvent('dblclick');

        this.runTriggers('dblclick', eventData);
    };

    Pointerly.prototype.click = function (e) {

        const eventData = this.getEventData(e);

        this.console.info(`Click`);

        // Event
        this.setLastEvent('click');

        this.runTriggers('click', eventData);
    };

    Pointerly.prototype.getEventData = function (event) {

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
    };

    Pointerly.prototype.setLastEvent = function (event) {

        let className;

        if (event == 'move') className = 'moving';
        else if (event == 'click') className = 'clicked';
        else if (event == 'dblclick') className = 'doubleclick';
        else if (event == 'mousedown') className = 'mousedown';
        else if (event == 'mouseup') className = 'mouseup';

        if (this.lastEvent != event) {
            this.wrapper.setAttribute('data-pointerly-last-event', event);
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
    };
}