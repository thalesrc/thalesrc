import { Pipe, PipeTransform } from '@angular/core';

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

function entryMapper<K, V>([key, value]: [K, V]): KeyValue<K, V> {
  return { key, value };
}

@Pipe({ name: 'entries', standalone: true })
export class EntriesPipe implements PipeTransform {
  transform<K, V>(value: Map<K, V>): KeyValue<K, V>[];
  transform<T>(value: Set<T>): KeyValue<T, T>[];
  transform<K extends string | number | symbol, V>(value: Record<K, V>): KeyValue<K, V>[];
  transform(value: null | undefined): never[];
  transform(value: Map<unknown, unknown> | Set<unknown> | Record<string, unknown> | null | undefined): KeyValue<unknown, unknown>[] {
    if (value == null) {
      return [];
    }

    if (value instanceof Map || value instanceof Set) {
      return [...value.entries()].map(entryMapper);
    }

    if (typeof value === 'object') {
      return Object.entries(value).map(entryMapper);
    }

    return [];
  }
}
