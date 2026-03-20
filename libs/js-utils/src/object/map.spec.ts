import { map } from './map';

describe('Map Function', () => {
  it('should map object values', () => {
    const obj = { a: 1, b: 2, c: 3 };

    expect(map(obj, value => value * 2)).toEqual({ a: 2, b: 4, c: 6 });
  });

  it('should pass the key to the callback', () => {
    const obj = { x: 1, y: 2 };

    expect(map(obj, (value, key) => `${key}_${value}`)).toEqual({ x: 'x_1', y: 'y_2' });
  });

  it('should pass the object to the callback', () => {
    const obj = { a: 10 };

    map(obj, (_value, _key, receivedObj) => {
      expect(receivedObj).toBe(obj);
      return null;
    });
  });

  it('should return an empty object when given an empty object', () => {
    expect(map({}, value => value)).toEqual({});
  });

  it('should only map own enumerable properties', () => {
    const parent = { inherited: true };
    const child = Object.create(parent);
    child.own = 1;

    const result = map(child, value => value);

    expect(result).toEqual({ own: 1 });
    expect(result).not.toHaveProperty('inherited');
  });
});
