import type { Reducer } from "linki";

export type SetToChange<T> = [op: "to", value: T];
export const setToChanger = <T>(): Reducer<T, SetToChange<T>> => (
  state,
  op
) => {
  switch (op[0]) {
    case "to": {
      return op[1];
    }
  }
};

export type BooleanChange = SetToChange<boolean> | [op: "tgl"];
export const booleanChanger = (): Reducer<boolean, BooleanChange> => (
  state,
  op
) => {
  switch (op[0]) {
    case "to": {
      return op[1];
    }
    case "tgl": {
      return !state;
    }
  }
};

export type MapChange<K, V, C = unknown> =
  | SetToChange<Map<K, V>>
  | [op: "set", key: K, value: V]
  | [op: "del", key: K]
  | [op: "chg", key: K, ...changes: C[]]
  | [op: "all", ...changes: C[]];

export const mapChanger = <K, V, C>(
  applyChanges: (item: V, change: C) => V
): Reducer<Map<K, V>, MapChange<K, V, C>> => (state, op) => {
  switch (op[0]) {
    case "to": {
      return op[1];
    }
    case "set": {
      const [, key, value] = op;
      state.set(key, value);
      return state;
    }
    case "del": {
      const key = op[1];
      if (state.has(key)) {
        state.delete(key);
      }
      return state;
    }
    case "chg": {
      const [, key, ...changes] = op;
      const value = state.get(key);
      if (value != null) {
        state.set(key, changes.reduce(applyChanges, value));
      }
      return state;
    }
    case "all": {
      const [, ...changes] = op;
      return new Map(
        Array.from(state.entries()).map(([key, value]) => [
          key,
          changes.reduce(applyChanges, value),
        ])
      );
    }
    default: {
      return state;
    }
  }
};

export type ObjectChange<T, C = unknown> =
  | SetToChange<T>
  | [op: "set", key: keyof T, value: T[keyof T]]
  | [op: "del", key: keyof T]
  | [op: "chg", key: keyof T, ...changes: C[]]
  | [op: "all", ...changes: C[]];

export const objectChanger = <T extends Record<string, unknown>, C>(
  applyChanges: (prop: T[keyof T], change: C) => T[keyof T]
): Reducer<T, ObjectChange<T, C>> => (state, op) => {
  switch (op[0]) {
    case "to": {
      return op[1];
    }
    case "set": {
      const [, key, value] = op;
      state[key] = value;
      return state;
    }
    case "del": {
      const key = op[1];
      if (state[key] != null) {
        delete state[key];
      }
      return state;
    }
    case "chg": {
      const [, key, ...changes] = op;
      const value = state[key];
      if (value != null) {
        state[key] = changes.reduce(applyChanges, value);
      }
      return state;
    }
    case "all": {
      const [, ...changes] = op;
      Object.keys(state).forEach((key) => {
        state[key as keyof T] = changes.reduce(
          applyChanges,
          state[key] as T[keyof T]
        );
      });
      return state;
    }
    default: {
      return state;
    }
  }
};

export type EntityListChange<I, ID, C = unknown> =
  | SetToChange<I[]>
  | [op: "set", item: I]
  | [op: "del", id: ID]
  | [op: "chg", id: ID, ...changes: C[]]
  | [op: "all", ...changes: C[]];

export const entityListChanger = <I, ID, C = unknown>(
  getId: (item: I) => ID,
  applyChanges: (item: I, change: C) => I
): Reducer<I[], EntityListChange<I, ID, C>> => (state, op) => {
  const findIndex = (id: ID) => state.findIndex((it) => getId(it) === id);
  switch (op[0]) {
    case "to": {
      return op[1];
    }
    case "set": {
      const [, item] = op;
      const i = findIndex(getId(item));
      if (i >= 0) {
        state[i] = item;
      } else {
        state.push(item);
      }
      return state;
    }
    case "del": {
      const id = op[1];
      const i = findIndex(id);
      if (i >= 0) {
        state.splice(i, 1);
      }
      return state;
    }
    case "chg": {
      const [, id, ...changes] = op;
      const i = findIndex(id);
      if (i >= 0) {
        state[i] = changes.reduce(applyChanges, state[i]);
      }
      return state;
    }
    case "all": {
      const [, ...changes] = op;
      for (let i = 0; i < state.length; i++) {
        state[i] = changes.reduce(applyChanges, state[i]);
      }
      return state;
    }
    default: {
      return state;
    }
  }
};
