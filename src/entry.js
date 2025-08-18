import "./styles/global.css";

import Pointerly from "./core/core.js";
import { addEventTrigger } from "./core/events.js";
import { addExtras } from "./core/extras.js";

// Extensions
addExtras(Pointerly);
addEventTrigger(Pointerly);


const _instance = new Pointerly();

const PointerlyGlobal = {
    //version: '1.0.0',
    init: (...args) => _instance.init(...args),
    refresh: (...args) => _instance.refresh(...args),
    _instance
};

// Para uso interno de métodos estáticos que precisam acessar a instância
Pointerly._instance = _instance;

if (typeof window !== 'undefined') {
    window.Pointerly = PointerlyGlobal;
}

export default PointerlyGlobal;