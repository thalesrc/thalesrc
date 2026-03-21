import './gather';
import { gather } from '../gather';

describe('Array Gather Proto Function', () => {
  it('should work as same', () => {
    const users = [
      { role: 'admin', name: 'Alice' },
      { role: 'user', name: 'Bob' },
      { role: 'admin', name: 'Charlie' },
    ];

    expect(users.gather('role')).toEqual(gather(users, 'role'));
  });
});
