import type { SessionStorage, Storage } from "types";
import { IGNORED_WARNINGS } from "./constants";
import { extStorage, type ExtStorage } from "@lib/extStorage";

const defaultStorage: Storage = {
  feature: {
    content: true,
  },
  localRepoPath: '',
  secret: '',
  credentials: {},
};

const defaultSessionStorage: SessionStorage = {
  names: {},
};

export const passphrase = `${IGNORED_WARNINGS[1].slice(0, 8)}${chrome.runtime.id}`.slice(0, 32);
export const getStore = () => extStorage<Storage>(defaultStorage, passphrase, 'extension');
export const getSessionStore = () => extStorage<SessionStorage>(defaultSessionStorage, passphrase, 'extension', 'session');
export const store = getStore();
export const session = getSessionStore();
