// Decrypt with:
// echo "U2FsdGVkX19qQIRedr5nh5AZVM00gEqFGgGpykFXH8E=" | openssl aes-256-cbc -d -salt -pbkdf2 -iter 10000 -pass pass:"password" -base64 -A
export const encrypt = async (str: string, password: string, pbkdf2iterations = 10000) => {
  const encoder = new TextEncoder();
  const plaintextbytes = encoder.encode(str);

  const passphrasebytes = encoder.encode(password);
  const pbkdf2salt = globalThis.crypto.getRandomValues(new Uint8Array(8));

  const passphrasekey = await globalThis.crypto.subtle.importKey('raw', passphrasebytes, { name: 'PBKDF2' }, false, ['deriveBits'])

  const deriveBits = await globalThis.crypto.subtle.deriveBits({ "name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256' }, passphrasekey, 384)
  const pbkdf2bytes = new Uint8Array(deriveBits);

  const keybytes = pbkdf2bytes.slice(0, 32);
  const ivbytes = pbkdf2bytes.slice(32);

  const key = await globalThis.crypto.subtle.importKey('raw', keybytes, { name: 'AES-CBC', length: 256 }, false, ['encrypt'])
  let encryptedBytes = await globalThis.crypto.subtle.encrypt({ name: "AES-CBC", iv: ivbytes }, key, plaintextbytes)

  if (!encryptedBytes) {
    console.log('Error encrypting file.');
    return;
  }

  const cipherbytes = new Uint8Array(encryptedBytes);
  const resultbytes = new Uint8Array(cipherbytes.length + 16)
  resultbytes.set(encoder.encode('Salted__'));
  resultbytes.set(pbkdf2salt, 8);
  resultbytes.set(cipherbytes, 16);
  return btoa(String.fromCharCode.apply(null, resultbytes));;
}


// Encrypt with:
// echo "test test test" | openssl aes-256-cbc -e -salt -pbkdf2 -iter 10000 -pass pass:"password" -base64 -A
export const decrypt = async (base64: string, password: string, pbkdf2iterations = 10000) => {
  const encoder = new TextEncoder();
  const cipherbytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  const passphrasebytes = encoder.encode(password);
  const pbkdf2salt = cipherbytes.slice(8, 16);
  const passphrasekey = await globalThis.crypto.subtle.importKey('raw', passphrasebytes, { name: 'PBKDF2' }, false, ['deriveBits'])
  const deriveBits = await globalThis.crypto.subtle.deriveBits({ "name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256' }, passphrasekey, 384)
  const pbkdf2bytes = new Uint8Array(deriveBits);

  const keybytes = pbkdf2bytes.slice(0, 32);
  const ivbytes = pbkdf2bytes.slice(32);

  const key = await globalThis.crypto.subtle.importKey('raw', keybytes, { name: 'AES-CBC', length: 256 }, false, ['decrypt'])
  const plaintextbytes = await globalThis.crypto.subtle.decrypt({ name: "AES-CBC", iv: ivbytes }, key, cipherbytes.slice(16))

  if (!plaintextbytes) {
    console.log('Error decrypting file.  See console log.');
    return;
  }
  return new TextDecoder().decode(new Uint8Array(plaintextbytes));
}
