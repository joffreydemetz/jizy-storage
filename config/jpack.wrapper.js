/*! jStorage v@VERSION | @DATE | [@BUNDLE] */
(function (global) {
    "use strict";

    if (typeof global !== "object" || !global) {
        throw new Error("jStorage requires a window");
    }

    if (typeof global.jStorage !== "undefined") {
        throw new Error("jStorage is already defined");
    }

    // @CODE 

    global.jStorage = jStorage;

})(typeof window !== "undefined" ? window : this);