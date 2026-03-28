import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'values', standalone: true })
export class ValuesPipe implements PipeTransform {
  transform<K, V>(value: Map<K, V>): V[];
  transform<T>(value: Set<T>): T[];
  transform<K extends string, V>(value: Record<K, V>): V[];
  transform(value: null | undefined): never[];
  transform(value: Map<unknown, unknown> | Set<unknown> | Record<string, unknown> | null | undefined): unknown[] {
    if (value == null) {
      return [];
    }

    if (value instanceof Map || value instanceof Set) {
      return [...value.values()];
    }

    if (typeof value === 'object') {
      return Object.values(value);
    }

    return [];
  }
}
