export function addConsole(Pointerly) {

    Pointerly.prototype.createConsole = function () {

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
    };
}