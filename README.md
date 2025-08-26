# jStorage 

`jStorage` is a JavaScript utility class that provides a unified interface for working with `localStorage`, `sessionStorage`, and cookies. It automatically serializes and deserializes values, and falls back to cookies if Web Storage is not available.

## Features
- Set, get, and clear values in `localStorage`, `sessionStorage`, or cookies
- Automatic serialization/deserialization of objects, arrays, and primitives
- Fallback to cookies if storage is unavailable
- Handles special types (Set, Map, functions, symbols)

## Usage

```js
import jStorage from './lib/js/storage.js';

// Use localStorage
const store = new jStorage('local');
store.set('user', { name: 'Alice', age: 30 });
const user = store.get('user'); // { name: 'Alice', age: 30 }

// Use sessionStorage
const session = new jStorage('session');
session.set('token', 'abc123');
const token = session.get('token'); // 'abc123'

// Use cookies (requires js-cookie library)
const cookieStore = new jStorage('cookie');
cookieStore.set('theme', 'dark');
const theme = cookieStore.get('theme'); // 'dark'

// Clear a value
store.clear('user');
```

## API

### Constructor
`new jStorage(type)`
- `type`: `'local'`, `'session'`, or `'cookie'` (default: `'local'` if available)

### Methods
- `set(key, value, params)`: Store a value. `params` is for cookie options.
- `get(key, def)`: Retrieve a value, or `def` if not found.
- `clear(key)`: Remove a value.

## Notes
- For cookie support, include the [js-cookie](https://github.com/js-cookie/js-cookie) library as `Cookies` global.
- Values are automatically stringified and parsed.

---
See `lib/js/storage.js` for full implementation details.
