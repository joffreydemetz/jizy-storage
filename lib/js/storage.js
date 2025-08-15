/**
 * jStorage plugin
 * - proxy for localStorage & sessionStorage & Cookies (if available)
 */

function stringify(obj, config = {}) {
    if (typeof obj === 'string') {
        return obj;
    }

    const replacer = (key, val) => {
        if (typeof val === 'symbol') {
            return val.toString();
        }
        if (val instanceof Set) {
            return Array.from(val);
        }
        if (val instanceof Map) {
            return Array.from(val.entries());
        }
        if (typeof val === 'function') {
            return config.ignoreFunctions ? 'func' : val.toString();
        }
        return val;
    };

    return JSON.stringify(obj, replacer, config.spaces || 0);
}

/**
 * Clean the value before saving it
 * 
 * @param  {mixed}   value  The source value
 * @return {string}  The clean string value
 */
function cleanSetValue(value) {
    if (typeof value === 'undefined') {
        value = '';
    }
    return stringify(value, { ignoreFunctions: true });
}

/**
 * Parse the value before returning it
 * 
 * @param  {string}  value  The clean string value
 * @return {mixed}   The parsed value
 */
function cleanGetValue(value) {
    try {
        value = JSON.parse(value);
    } catch (e) { }
    if (typeof value === 'undefined') {
        value = '';
    }
    return value;
}

/**
 * Check the storage type availability
 * 
 * @param  {string} t jStorage type (sessionStorage|localStorage)
 * @return {bool}     True if available and accessible
 */
function check(type) {
    try {
        const s = window[type], x = '__storage_test__';
        s.setItem(x, x);
        s.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        ) && s.length !== 0;
    }
}

sessionStorage = window.sessionStorage || {};
localStorage = window.localStorage || {};
Cookies = window.Cookies || {};

export default class jStorage {
    /**
     * @param  {string}  type  The type of storage (session|local|cookie)
     */
    constructor(type = '') {
        this.storageType = '';
        if (type === 'session' && check('sessionStorage')) {
            this.storageType = 'session';
        } else if (type === 'local' && check('localStorage')) {
            this.storageType = 'local';
        } else if (type === 'cookie' && typeof Cookies !== 'undefined') {
            this.storageType = 'cookie';
        } else if (check('localStorage')) {
            this.storageType = 'local';
        } else if (typeof Cookies !== 'undefined') {
            this.storageType = 'cookie';
        }
    }

    /**
         * Set a variable
         *
         * @param  {string}  key
         * @param  {mixed}   value
         * @param  {object}  params (for cookies)
         * @return {void}
         */
    set(key, value, params = null) {
        value = cleanSetValue(value);

        if ('session' === this.storageType) {
            sessionStorage.setItem(key, value);
        }
        else if ('local' === this.storageType) {
            localStorage.setItem(key, value);
        }
        else if ('cookie' === this.storageType) {
            params = Object.assign({
                secure: true,
                sameSite: 'strict',
                expires: 365
            }, params || {});

            Cookies.set(key, value, params);
        }
    }

    /**
         * Get a variable
         *
         * @param  {string}  key  The property key
         * @param  {mixed}   def  The default value
         * @return {mixed}   The property value
         */
    get(key, def) {
        var value = null;
        if (typeof def === 'undefined') {
            def = null;
        }

        if (this.storageType === 'session') {
            value = sessionStorage.getItem(key);
        }
        else if (this.storageType === 'local') {
            value = localStorage.getItem(key);
        }
        else if (this.storageType === 'cookie') {
            value = Cookies.get(key);
        }

        value = cleanGetValue(value);

        if (null === value) {
            value = def;
        }

        return value;
    }

    /**
         * Clear a variable
         *
         * @param  {string}  key  The property key
         * @return {mixed}   The property value
         */
    clear(key) {
        if (this.storageType === 'session') {
            sessionStorage.removeItem(key);
        }
        else if (this.storageType === 'local') {
            localStorage.removeItem(key);
        }
        else if (this.storageType === 'cookie') {
            Cookies.remove(key);
        }
    }
}
