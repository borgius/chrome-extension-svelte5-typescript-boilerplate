import { writable, get, type Writable } from "svelte/store"
import * as WebCrypto from 'easy-web-crypto';
import { deepMerge } from "./utils";

export type ExtStorage = {
  _storeVersion?: number;
  isReady?: boolean;
};

type AreaName = keyof Pick<typeof chrome.storage, "sync" | "local" | "managed" | "session">;

type WaitForReturn<T> = {
  value: T,
  store: ExtStore<T>,
  [key: string]: any,
};

type Fn = <T extends string>(path: T) => { [K in T]: any };

type ExtStore<T extends ExtStorage> = Writable<T> & {
  waitFor: (path?: string, timeout?: number) => Promise<WaitForReturn<T>>
  whenReady: () => Promise<WaitForReturn<T>>
  get: (path?: string) => T
  value: T
};

export const isEqual = (a: any, b: any): boolean => JSON.stringify(a) === JSON.stringify(b)

/**
 * Creates an extended storage object with encryption and synchronization capabilities.
 * 
 * @template T - The type of the storage object.
 * @param initialValue - The default storage object.
 * @param passPhrase - The passphrase used for encryption.
 * @param keyPrefix - The prefix used for storage keys.
 * @param storageArea - The storage area to use (default: 'local').
 * @returns A writable object representing the extended storage.
 */
export function extStorage<T extends ExtStorage>(initialValue: T, passPhrase: string, keyPrefix: string, storageArea: AreaName = 'local'): ExtStore<T> {
  initialValue._storeVersion = initialValue._storeVersion | 0;
  const storageKey = `${keyPrefix}-store`;
  let cryptoKey: CryptoKey;
  let value = initialValue;

  const store = writable<T>(initialValue);

  const getChromeStorage = (key: string) => new Promise((resolve, reject) => {
    chrome.storage[storageArea].get([key], (result) => {
      if (result?.[key]) resolve(result[key]);
      else reject(`No ${key} in chrome.storage.${storageArea}`);
    })
  });

  const getDecryptedStorage = () => getChromeStorage(storageKey)
    .then((encrypted: WebCrypto.CipherData) => WebCrypto.decrypt(cryptoKey, encrypted))
    .catch(() => value) // if no storage, use current value

  const encryptAndStore = (data: T) => WebCrypto.encrypt(cryptoKey, data)
    .then((encrypted) => {
      chrome.storage[storageArea].set({ [storageKey]: encrypted });
    })

  const getCryptoKey = () => cryptoKey ? Promise.resolve(cryptoKey) : getChromeStorage(`${keyPrefix}-master-key`)
    .catch((err) => {
      return WebCrypto.genEncryptedMasterKey(passPhrase)
        .then((encMasterKey) => {
          chrome.storage[storageArea].set({ [`${keyPrefix}-master-key`]: encMasterKey });
          return encMasterKey;
        })
    })
    .then((protectedMasterKey: WebCrypto.ProtectedMasterKey) => WebCrypto.decryptMasterKey(passPhrase, protectedMasterKey))
    .then((key) => {
      cryptoKey = key;
    })

  // check for existing storage and update if needed
  getCryptoKey()
    .then(() => getDecryptedStorage())
    .then((data: T) => {
      const merged = deepMerge(value, data);
      store.set(({ isReady: true, ...merged }))
    });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== storageArea) return;
    if (changes[storageKey]) {
      WebCrypto.decrypt(cryptoKey, changes[storageKey].newValue as WebCrypto.CipherData)
        .then((data: T) => {
          const merged = deepMerge(value, data);
          store.set(merged);
        })
        .catch((err) => {
          console.error('onChanged catch', err);
        })
    }
  })

  const set = (data: T) => {
    // console.trace('store.set data', storageArea, data)
    store.set(data);
    if (cryptoKey) encryptAndStore(data);
    else getCryptoKey()
      .then(() => encryptAndStore(value));
  }

  store.subscribe((data) => {
    // console.trace('store.subscribe set value', storageArea, data)
    value = data;
  })

  const extStore: ExtStore<T> = {
    set,
    get: (path = '') => path ? path.split('.').reduce((val, p) => val = val?.[p], value) : value,
    update: (fn: (prevStore: T) => T) => {
      set(fn(value))
    },
    subscribe: store.subscribe,
    waitFor: (path = 'isReady', timeout = 5000) => new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(`Timeout waiting for ${path}`)
      }, timeout);
      const unsubscribe = store.subscribe((value) => {
        const key = path.split('.').pop();
        const waitForValue = path.split('.').reduce((val, p) => val = val?.[p], value);
        if (!waitForValue) return;
        clearTimeout(timeoutId);
        try {
          // console.log('unsubscribe.length', unsubscribe?.length);
          setTimeout(() => unsubscribe(), 1);
        } catch (err) {
          // console.log({ unsubscribe },);
          // console.error('unsubscribe', err);
        }
        resolve({ value, store: extStore, [key]: waitForValue });
      })
    }),
    whenReady: () => extStore.waitFor(),
    get value() { return value; }
  };

  return extStore;
}
