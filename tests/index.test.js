import jStorage, { sStorage, lStorage, cStorage } from '../lib/index.js';

test('default export is the jStorage class', () => {
    expect(typeof jStorage).toBe('function');
    expect(jStorage.prototype.set).toBeInstanceOf(Function);
    expect(jStorage.prototype.get).toBeInstanceOf(Function);
    expect(jStorage.prototype.clear).toBeInstanceOf(Function);
});

test('named exports are jStorage instances', () => {
    expect(sStorage).toBeInstanceOf(jStorage);
    expect(lStorage).toBeInstanceOf(jStorage);
    expect(cStorage).toBeInstanceOf(jStorage);
});

test('singletons expose a string storageType field', () => {
    expect(typeof sStorage.storageType).toBe('string');
    expect(typeof lStorage.storageType).toBe('string');
    expect(typeof cStorage.storageType).toBe('string');
});
