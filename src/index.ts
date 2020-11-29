import { isRef, Ref, computed, unref, watch, shallowRef, onBeforeUnmount, getCurrentInstance } from 'vue';
import { hashString, isPlainObject } from './helpers';

type StateFactoryType<T = unknown> = (args: any, hooks: { onTrigger: (cb:() => void) => void, onCleanup: (cb:() => void) => void }) => T
type Store<T = Record<string, unknown>> = {
  state: T;
  effect: () => void;
  cleanupEffect: () => void;
  subscribers: Set<symbol>,
};
type CreateScopedCompositionReturn<T extends Record<string, unknown>> = {
  useScopedState: <A extends Record<string, unknown>>(...args: null|A|Ref<A>) => T;
  triggerSubscribers: () => void;
};

const scopedStateMap: WeakMap<StateFactoryType, Map<string, Store>> = new WeakMap();

export default function createScopedComposition<T extends Record<string, unknown>> (stateFactory: StateFactoryType<T>): CreateScopedCompositionReturn<T> {
  const newStore: Map<string, Store<T>> = new Map();
  scopedStateMap.set(stateFactory, newStore);
  const triggerSubscribers = () => {
    const storeMap = newStore;
    const effects = [...storeMap.values()].map(({ effect }) => effect);
    for (const effect of effects) {
      effect();
    }
  };
  return {
    useScopedState: (...args) => track(stateFactory, ...args),
    triggerSubscribers,
  };
}

type TrackBy<A> = (uniquePayload: A) => string;
function track<T extends Record<string, unknown>, A extends Record<string, unknown>> (stateFactory: StateFactoryType<T>, args: null|A|Ref<A>, trackBy?: TrackBy<A>): T {
  const storeMap = scopedStateMap.get(stateFactory) as Map<string, Store<T>>;
  if (!storeMap) throw new Error('no store: use createState before track'); // TODO better error
  const uniqueSubscriptionSymbol = Symbol('uniqueSubscriptionSymbol');

  const wrappedTrackBy = trackBy ? (...args) => getUniqueString(trackBy(...args)) : getUniqueString;
  const getUniqueId = (uniquePayload: null|Ref<A>|A) => wrappedTrackBy(unref(uniquePayload) as A);

  const getStore = (uid:string) => {
    const currentStore = storeMap.get(uid);
    if (!currentStore) throw new Error('no store available');
    return currentStore;
  };

  const teardownSubscription = (uid: string) => {
    const store = getStore(uid);
    const { subscribers, cleanupEffect } = store;
    subscribers.delete(uniqueSubscriptionSymbol);
    if (subscribers.size === 0) {
      storeMap.delete(uid);
      cleanupEffect();
    }
  };

  onBeforeUnmount(() => teardownSubscription(getUniqueId(args)));

  function retrieveStore (uid: string) {
    let store;
    try {
      store = getStore(uid);
    } catch {}
    if (store) {
      const { subscribers } = store;
      subscribers.add(uniqueSubscriptionSymbol);
      return store;
    } else {
      const subscribers = new Set([uniqueSubscriptionSymbol]);
      let effect = () => {};
      let cleanupEffect = () => {};
      const wrappedEffect = () => {
        effect();
      };
      const onTrigger = (cb) => {
        effect = () => {
          cb();
        };
      };
      const onCleanup = (cb) => {
        cleanupEffect = cb;
      };
      const newStore = { state: stateFactory(unref(args), { onTrigger, onCleanup }), subscribers, effect: wrappedEffect, cleanupEffect };
      storeMap!.set(uid, newStore);
      wrappedEffect(); // fire initial callback for newly created store
      return newStore;
    }
  }

  if (isRef(args)) {
    const currentStore = shallowRef<T>();
    const toComputedRefs = (obj: Record<string, unknown | Ref<unknown>>): T => {
      function convertToComputed ():T {
        const transformed = {};
        for (const key in obj) {
          const value = obj[key];
          if (isRef(value)) {
            transformed[key] = computed({
              get () {
                return ((currentStore.value!)[key] as Ref<unknown>).value;
              },
              set (val) {
                ((currentStore.value!)[key] as Ref<unknown>).value = val;
              },
            });
            continue;
          }
          transformed[key] = value;
        }
        return transformed as T;
      }
      return convertToComputed();
    };
    watch(args, (val, oldVal) => {
      const newId = getUniqueId(val);
      if (!oldVal) {
        currentStore.value = retrieveStore(newId).state;
        return;
      }
      const oldId = getUniqueId(oldVal);
      if (newId !== oldId) {
        teardownSubscription(oldId);
        currentStore.value = retrieveStore(newId).state;
      }
    }, { immediate: true });
    return toComputedRefs(currentStore.value!);
  } else {
    const uid = getUniqueId(args);
    const store = retrieveStore(uid);
    return store.state;
  }
}

// auto track-by

function getUniqueString (payload) {
  if (payload === undefined || payload === null) return '';
  return getRecursiveUniqueString(payload);
}
function getRecursiveUniqueString (payload) {
  if (Array.isArray(payload) || payload instanceof Set) {
    return [...payload].map(getRecursiveUniqueString).join('');
  } else if (isPlainObject(payload)) {
    return Object.values(payload).map(getRecursiveUniqueString).join('');
  } else {
    return hashString(String(payload));
  }
}
