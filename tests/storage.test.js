import jStorage from '../lib/js/storage.js';
import {
    makeWebStorage,
    makeCookies,
    resetGlobals,
    installSession,
    installLocal,
    installCookies,
} from './helpers.js';

beforeEach(() => {
    resetGlobals();
});

afterEach(() => {
    resetGlobals();
});

describe('constructor — type detection', () => {
    test("'session' selects session when sessionStorage is available", () => {
        installSession(makeWebStorage());
        expect(new jStorage('session').storageType).toBe('session');
    });

    test("'session' falls back to local when sessionStorage missing", () => {
        installLocal(makeWebStorage());
        expect(new jStorage('session').storageType).toBe('local');
    });

    test("'local' selects local when localStorage is available", () => {
        installLocal(makeWebStorage());
        expect(new jStorage('local').storageType).toBe('local');
    });

    test("'cookie' selects cookie when Cookies global is defined", () => {
        installCookies(makeCookies());
        expect(new jStorage('cookie').storageType).toBe('cookie');
    });

    test("'cookie' falls back to local when no Cookies but local available", () => {
        installLocal(makeWebStorage());
        expect(new jStorage('cookie').storageType).toBe('local');
    });

    test("'cookie' falls back to '' when neither cookies nor local available", () => {
        expect(new jStorage('cookie').storageType).toBe('');
    });

    test('empty type falls back to local when available', () => {
        installLocal(makeWebStorage());
        expect(new jStorage().storageType).toBe('local');
    });

    test('empty type falls back to cookie when no local but Cookies present', () => {
        installCookies(makeCookies());
        expect(new jStorage().storageType).toBe('cookie');
    });

    test('storageType is empty string when nothing is available', () => {
        expect(new jStorage().storageType).toBe('');
        expect(new jStorage('session').storageType).toBe('');
        expect(new jStorage('local').storageType).toBe('');
    });

    test("'session' prefers session over an available local", () => {
        installSession(makeWebStorage());
        installLocal(makeWebStorage());
        expect(new jStorage('session').storageType).toBe('session');
    });
});

describe('localStorage backend — set / get / clear', () => {
    let local, store;

    beforeEach(() => {
        local = makeWebStorage();
        installLocal(local);
        store = new jStorage('local');
    });

    test('round-trips a plain string', () => {
        store.set('k', 'hello');
        expect(local.setItem).toHaveBeenCalledWith('k', 'hello');
        expect(store.get('k')).toBe('hello');
    });

    test('round-trips a number', () => {
        store.set('k', 42);
        expect(store.get('k')).toBe(42);
    });

    test('round-trips a boolean', () => {
        store.set('k', true);
        expect(store.get('k')).toBe(true);
        store.set('k', false);
        expect(store.get('k')).toBe(false);
    });

    test('round-trips an object', () => {
        const obj = { name: 'Alice', age: 30, nested: { x: [1, 2, 3] } };
        store.set('k', obj);
        expect(store.get('k')).toEqual(obj);
    });

    test('round-trips an array', () => {
        store.set('k', [1, 'two', { three: 3 }]);
        expect(store.get('k')).toEqual([1, 'two', { three: 3 }]);
    });

    test('undefined is stored as empty string and returns empty string', () => {
        store.set('k', undefined);
        expect(local.setItem).toHaveBeenCalledWith('k', '');
        expect(store.get('k')).toBe('');
    });

    test('null is stored as JSON null; get falls through to default', () => {
        store.set('k', null);
        expect(local.setItem).toHaveBeenCalledWith('k', 'null');
        expect(store.get('k', 'fallback')).toBe('fallback');
    });

    test('missing key returns the supplied default', () => {
        expect(store.get('missing', 'def')).toBe('def');
    });

    test('missing key returns null when no default is supplied', () => {
        expect(store.get('missing')).toBeNull();
    });

    test('clear removes the key from storage', () => {
        store.set('k', 'v');
        store.clear('k');
        expect(local.removeItem).toHaveBeenCalledWith('k');
        expect(store.get('k', 'def')).toBe('def');
    });

    test('strings that look like JSON literals are parsed back (lossy round-trip)', () => {
        store.set('a', 'true');
        expect(store.get('a')).toBe(true);
        store.set('b', '42');
        expect(store.get('b')).toBe(42);
        store.set('c', '[1,2]');
        expect(store.get('c')).toEqual([1, 2]);
    });

    test('non-JSON strings stay as strings', () => {
        store.set('k', 'hello world');
        expect(store.get('k')).toBe('hello world');
    });
});

describe('sessionStorage backend', () => {
    let session, store;

    beforeEach(() => {
        session = makeWebStorage();
        installSession(session);
        store = new jStorage('session');
    });

    test('set writes to sessionStorage', () => {
        store.set('k', { a: 1 });
        expect(session.setItem).toHaveBeenCalledWith('k', '{"a":1}');
    });

    test('get reads from sessionStorage', () => {
        store.set('k', 'v');
        expect(store.get('k')).toBe('v');
        expect(session.getItem).toHaveBeenCalledWith('k');
    });

    test('clear removes from sessionStorage', () => {
        store.set('k', 'v');
        store.clear('k');
        expect(session.removeItem).toHaveBeenCalledWith('k');
    });
});

describe('cookie backend', () => {
    let cookies, store;

    beforeEach(() => {
        cookies = makeCookies();
        installCookies(cookies);
        store = new jStorage('cookie');
    });

    test('set writes through Cookies.set with default params', () => {
        store.set('theme', 'dark');
        expect(cookies.set).toHaveBeenCalledWith('theme', 'dark', {
            secure: true,
            sameSite: 'strict',
            expires: 365,
        });
    });

    test('set merges custom params over defaults', () => {
        store.set('k', 'v', { expires: 7, secure: false });
        expect(cookies.set).toHaveBeenCalledWith('k', 'v', {
            secure: false,
            sameSite: 'strict',
            expires: 7,
        });
    });

    test('set tolerates a null params argument', () => {
        store.set('k', 'v', null);
        expect(cookies.set).toHaveBeenCalledWith('k', 'v', {
            secure: true,
            sameSite: 'strict',
            expires: 365,
        });
    });

    test('get reads through Cookies.get', () => {
        store.set('k', { a: 1 });
        expect(store.get('k')).toEqual({ a: 1 });
        expect(cookies.get).toHaveBeenCalledWith('k');
    });

    test('clear calls Cookies.remove', () => {
        store.set('k', 'v');
        store.clear('k');
        expect(cookies.remove).toHaveBeenCalledWith('k');
    });

    test('get on a missing key returns the supplied default', () => {
        expect(store.get('missing', 'def')).toBe('def');
    });

    test('get on a missing key returns null when no default is supplied', () => {
        expect(store.get('missing')).toBeNull();
    });
});

describe('serialization of special types', () => {
    let local, store;

    beforeEach(() => {
        local = makeWebStorage();
        installLocal(local);
        store = new jStorage('local');
    });

    test('Set is serialized as an array', () => {
        store.set('k', new Set([1, 2, 3]));
        expect(local.setItem).toHaveBeenCalledWith('k', '[1,2,3]');
        expect(store.get('k')).toEqual([1, 2, 3]);
    });

    test('Map is serialized as an entries array', () => {
        store.set('k', new Map([['a', 1], ['b', 2]]));
        expect(local.setItem).toHaveBeenCalledWith('k', '[["a",1],["b",2]]');
        expect(store.get('k')).toEqual([['a', 1], ['b', 2]]);
    });

    test('Symbol is stored as its toString form', () => {
        store.set('k', Symbol('foo'));
        expect(local.setItem).toHaveBeenCalledWith('k', '"Symbol(foo)"');
        expect(store.get('k')).toBe('Symbol(foo)');
    });

    test('functions are stored as the literal "func" placeholder', () => {
        store.set('k', function hello() { return 1; });
        expect(local.setItem).toHaveBeenCalledWith('k', '"func"');
        expect(store.get('k')).toBe('func');
    });

    test('nested Set inside an object is converted to an array', () => {
        store.set('k', { tags: new Set(['a', 'b']) });
        expect(store.get('k')).toEqual({ tags: ['a', 'b'] });
    });
});

describe('no storage available', () => {
    test('set is a no-op and get returns the default', () => {
        const store = new jStorage();
        expect(store.storageType).toBe('');
        expect(() => store.set('k', 'v')).not.toThrow();
        expect(store.get('k', 'def')).toBe('def');
        expect(() => store.clear('k')).not.toThrow();
    });
});
