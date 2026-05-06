import { jest } from '@jest/globals';

export function makeWebStorage() {
    const data = new Map();
    return {
        setItem: jest.fn((k, v) => data.set(String(k), String(v))),
        getItem: jest.fn(k => (data.has(String(k)) ? data.get(String(k)) : null)),
        removeItem: jest.fn(k => { data.delete(String(k)); }),
        clear: jest.fn(() => { data.clear(); }),
        get length() { return data.size; },
        key: i => Array.from(data.keys())[i] || null,
        _data: data,
    };
}

export function makeCookies() {
    const jar = new Map();
    return {
        set: jest.fn((k, v, params) => { jar.set(String(k), { value: String(v), params }); }),
        get: jest.fn(k => (jar.has(String(k)) ? jar.get(String(k)).value : undefined)),
        remove: jest.fn(k => { jar.delete(String(k)); }),
        _jar: jar,
    };
}

export function resetGlobals() {
    globalThis.window = {};
    globalThis.sessionStorage = undefined;
    globalThis.localStorage = undefined;
    globalThis.Cookies = undefined;
}

export function installSession(s) {
    globalThis.sessionStorage = s;
    globalThis.window.sessionStorage = s;
}

export function installLocal(s) {
    globalThis.localStorage = s;
    globalThis.window.localStorage = s;
}

export function installCookies(c) {
    globalThis.Cookies = c;
}
