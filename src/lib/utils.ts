import { alreadyInjected } from "./constants";

export const copyToClipboard = async (text: string) => {
  const type = "text/plain";
  const blob = new Blob([text], { type });
  const data = [new ClipboardItem({ [type]: blob })];
  await navigator.clipboard.write(data);
  return;
}

export const downloadFile = (content: string, filename: string, mimeType = 'text/plain') => {
  const a = document.createElement('a')
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob) // Create an object URL from blob
  a.setAttribute('href', url) // Set "a" element link
  a.setAttribute('download', filename) // Set download filename
  a.click() // Start downloading
}

export const assetUrl = (asset: string) => chrome.runtime.getURL(`src/assets/${asset}`)

export const trim = (str: string, ch: string = ' ', side: 'both' | 'left' | 'right' = 'both') => {
  const chars = ch.split('');
  let start = 0,
    end = str.length;
  if (side === 'both' || side === 'left') {
    while (start < end && chars.includes(str[start])) ++start;
  }
  if (side === 'both' || side === 'right') {
    while (end > start && chars.includes(str[end - 1])) --end;
  }
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

export const ltrim = (str: string, ch: string = ' ') => trim(str, ch, 'left');
export const rtrim = (str: string, ch: string = ' ') => trim(str, ch, 'right');

export const debounce = (func: Function, wait: number) => {
  let timeout: number | undefined;
  return (...args: any[]) => {
    const later = () => {
      timeout = undefined;
      func.apply(null, args);
    };
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

export const htmlDecode = (input: string): string => {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

/**
 * Deep merge two or more objects or arrays.
 * @param   {...any} objs  The arrays or objects to merge
 * @returns {any}          The merged arrays or objects
 */
export const deepMerge = (...objs: any[]): any => {
  /**
   * Get the object type
   * @param  {*}       obj The object
   * @return {string}      The object type
   */
  const getType = (obj: any): string => {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  }

  /**
   * Deep merge two objects
   * @return {Object}
   */
  const mergeObj = (clone: any, obj: any): void => {
    for (let [key, value] of Object.entries(obj)) {
      let type = getType(value);
      if (clone[key] !== undefined && getType(clone[key]) === type && ['array', 'object'].includes(type)) {
        clone[key] = deepMerge(clone[key], value);
      } else {
        clone[key] = structuredClone(value);
      }
    }
  }

  // Create a clone of the first item in the objs array
  let clone = structuredClone(objs.shift());

  // Loop through each item
  for (let obj of objs) {
    // Get the object type
    let type = getType(obj);

    // If the current item isn't the same type as the clone, replace it
    if (getType(clone) !== type) {
      clone = structuredClone(obj);
      continue;
    }

    // Otherwise, merge
    if (type === 'array') {
      clone = [...clone, ...structuredClone(obj)];
    } else if (type === 'object') {
      mergeObj(clone, obj);
    } else {
      clone = obj;
    }
  }

  return clone;
}

export const onlyClick = (callback: Function) => (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  callback(e);
}

export const notInjected = (selector: string) => `${selector}:not(.${alreadyInjected})`;