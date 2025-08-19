import jStorage from './js/storage.js';

const sStorage = new jStorage('session');
const lStorage = new jStorage('local');
const cStorage = new jStorage('cookie');

export { sStorage, lStorage, cStorage };
export default jStorage;