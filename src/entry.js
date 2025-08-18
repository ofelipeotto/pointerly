import "./styles/global.css";

import Hoverly from "./core/core.js";
import { addEventTrigger } from "./core/events.js";
import { addExtras } from "./core/extras.js";

// Extensions
addExtras(Hoverly);
addEventTrigger(Hoverly);


const _instance = new Hoverly();

const HoverlyGlobal = {
    //version: '1.0.0',
    init: (...args) => _instance.init(...args),
    refresh: (...args) => _instance.refresh(...args),
    _instance
};

// Para uso interno de métodos estáticos que precisam acessar a instância
Hoverly._instance = _instance;

if (typeof window !== 'undefined') {
    window.Hoverly = HoverlyGlobal;
}

export default HoverlyGlobal;