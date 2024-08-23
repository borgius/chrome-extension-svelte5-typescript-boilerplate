import { ProtocolWithReturn } from "webext-bridge";
import { GetCookieMessage, GetCookieReturn } from "./types";

declare global {
  export type Cookie = chrome.cookies.Cookie;
}

declare module "webext-bridge" {
  export interface ProtocolMap {
    "get-cookie": ProtocolWithReturn<GetCookieMessage, string>;
  }
}
