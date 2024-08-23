import { type ExtStorage } from "@lib/extStorage";
export type Storage = ExtStorage & {
  feature: {
    content: boolean;
  },
  localRepoPath?: string;
  secret: string
  credentials: Record<string, Record<string, string>>;
};

export type Cookie = chrome.cookies.Cookie;

export type SessionStorage = ExtStorage & {
  cookies?: string;
  names: Record<string, string>;
  [key: string]: any;
};

export type GetCookieMessage = {
  domain: string;
};
