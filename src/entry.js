import "./styles/global.css";

import Pointerly from "./core/core.js";

import { addStates } from "./core/states.js";
import { addCursor } from "./core/cursor.js";
import { addFlag } from "./core/flag.js";
import { addEvents } from "./core/events.js";
import { addEventTrigger } from "./core/eventsTrigger.js";
import { addConsole } from "./core/console.js";
import { addUtils } from "./core/utils.js";
import { addHelpers } from "./core/helpers.js";

// Extensions
addStates(Pointerly);
addCursor(Pointerly);
addFlag(Pointerly);
addEvents(Pointerly);
addEventTrigger(Pointerly);
addConsole(Pointerly);
addUtils(Pointerly);
addHelpers(Pointerly);

/*let _instance = null;

const PointerlyGlobal = {
    name: 'Pointerly',
    version: null,
    init: (...args) => {
        if (!_instance) _instance = new Pointerly();
        _instance.init(...args);
        PointerlyGlobal.version = _instance.version;
        return _instance;
    },
    refresh: (...args) => _instance?.refresh(...args)
};*/

const _instance = new Pointerly();

const PointerlyGlobal = {
    name: 'Pointerly',
    version: _instance.version,
    init: (...args) => _instance.init(...args),
    refresh: (...args) => _instance.refresh(...args),
    _instance
};

Pointerly._instance = _instance;

if (typeof window !== 'undefined') {
    window.Pointerly = PointerlyGlobal;
}

export default PointerlyGlobal;