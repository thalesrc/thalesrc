import { gather } from './gather';

describe('Gather Function', () => {
  let users: { role: string; name: string }[];

  beforeEach(() => {
    users = [
      { role: 'admin', name: 'Alice' },
      { role: 'user', name: 'Bob' },
      { role: 'admin', name: 'Charlie' },
      { role: 'user', name: 'Diana' },
    ];
  });

  it('should group items by the specified key', () => {
    const result = gather(users, 'role');

    expect(result.get('admin')).toEqual([
      { role: 'admin', name: 'Alice' },
      { role: 'admin', name: 'Charlie' },
    ]);
    expect(result.get('user')).toEqual([
      { role: 'user', name: 'Bob' },
      { role: 'user', name: 'Diana' },
    ]);
  });

  it('should return a Map', () => {
    const result = gather(users, 'role');

    expect(result).toBeInstanceOf(Map);
  });

  it('should have correct number of groups', () => {
    const result = gather(users, 'role');

    expect(result.size).toBe(2);
  });

  it('should handle an empty array', () => {
    const result = gather([], 'role');

    expect(result.size).toBe(0);
  });

  it('should handle array where all items share the same key', () => {
    const items = [
      { type: 'a', value: 1 },
      { type: 'a', value: 2 },
      { type: 'a', value: 3 },
    ];
    const result = gather(items, 'type');

    expect(result.size).toBe(1);
    expect(result.get('a')).toEqual(items);
  });

  it('should handle array where every item has a unique key', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ];
    const result = gather(items, 'id');

    expect(result.size).toBe(3);
    expect(result.get(1)).toEqual([{ id: 1, name: 'a' }]);
    expect(result.get(2)).toEqual([{ id: 2, name: 'b' }]);
    expect(result.get(3)).toEqual([{ id: 3, name: 'c' }]);
  });

  it('should group by numeric key values', () => {
    const items = [
      { score: 10, name: 'a' },
      { score: 20, name: 'b' },
      { score: 10, name: 'c' },
    ];
    const result = gather(items, 'score');

    expect(result.size).toBe(2);
    expect(result.get(10)).toEqual([
      { score: 10, name: 'a' },
      { score: 10, name: 'c' },
    ]);
    expect(result.get(20)).toEqual([{ score: 20, name: 'b' }]);
  });
});
