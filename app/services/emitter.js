import { EventEmitter } from "events";

let emitter;

if (process.env.NODE_ENV === "production") {
    emitter = new EventEmitter();
} else {
    if (!globalThis.__emitter) {
        globalThis.__emitter = new EventEmitter();
    }
    emitter = globalThis.__emitter;
}

export { emitter };