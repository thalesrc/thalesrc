import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys', standalone: true })
export class KeysPipe implements PipeTransform {
  transform<K, V>(value: Map<K, V>): K[];
  transform<T>(value: Set<T>): T[];
  transform<K extends string, V>(value: Record<K, V>): K[];
  transform(value: null | undefined): never[];
  transform(value: Map<unknown, unknown> | Set<unknown> | Record<string, unknown> | null | undefined): unknown[] {
    if (value == null) {
      return [];
    }

    if (value instanceof Map || value instanceof Set) {
      return [...value.keys()];
    }

    if (typeof value === 'object') {
      return Reflect.ownKeys(value);
    }

    return [];
  }
}
