import 'dotenv/config';
import fs from 'fs';
import { resolve } from 'path';
import { execSync, spawnSync } from 'child_process';
import { encrypt, decrypt } from 'crypt-aes';

export const HOME = process.env.HOME;
export const ROOT = new URL('.', import.meta.url).pathname;
export const KEY = resolve(ROOT, 'key.pem');
export const DIST = resolve(ROOT, 'dist');
export const UPDATE_URL = process.env.UPDATE_URL;
export const DOWNLOAD_URL = process.env.DOWNLOAD_URL;

const supportedBrowsers = ['google-chrome', 'brave'];

const browsers = {
  'google-chrome': {
    app: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    lib: `${HOME}/Library/Application Support/Google/Chrome`,
  },
  brave: {
    app: `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`,
    lib: `${HOME}/Library/Application Support/BraveSoftware/Brave-Browser`,
  },
};

export const getAvailabeBrowsers = () => supportedBrowsers.filter((name) => fs.existsSync(browsers[name].app));
const chrome = browsers[getAvailabeBrowsers()?.[0]]?.app;
if (!chrome) {
  throw new Error('Unable to find browser');
}

export const SECRET = process.env.CONFIG_SECRET;

if (!SECRET)
  throw new Error(
    `Unable to find "CONFIG_SECRET" to decrypt private key. Please check your environment or .env file`
  );

export const decryptPem = () => {
  if (!fs.existsSync(KEY) && fs.existsSync(`${KEY}.caes`)) {
    decrypt({
      srcPath: `${KEY}.caes`,
      pswrd: SECRET,
      keepSrc: true,
      destPath: null,
    });
    if (!fs.existsSync(KEY)) {
      throw new Error(`Unable to decrypt ${KEY}`);
    }
  }
  if (!fs.existsSync(KEY)) {
    generatePem();
  }
  if (!fs.existsSync(`${KEY}.caes`)) {
    encryptPem();
  }
};

export const encryptPem = () => {
  if (fs.existsSync(KEY)) {
    encrypt({
      srcPath: `${KEY}`,
      pswrd: SECRET,
      keepSrc: true,
      destPath: null,
    });
  } else {
    throw new Error(`Unable to find ${KEY}`);
  }
};

export const generatePem = () => {
  execSync(`2>/dev/null openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out ${KEY}`);
  encryptPem();
};

export const extensionKey = () => {
  decryptPem();
  return execSync(
    `2>/dev/null openssl rsa -in ${KEY} -pubout -outform DER | openssl base64 -A`
  ).toString();
};

export const extensionId = () => {
  decryptPem();
  return execSync(
    `2>/dev/null openssl rsa -in ${KEY} -pubout -outform DER |  shasum -a 256 | head -c32 | tr 0-9a-f a-p`
  ).toString();
};


export const getManifest = () => JSON.parse(fs.readFileSync(resolve(DIST, 'manifest.json')));

export const getExtensionName = () => `${extensionId()}.crx`;

export const buildExtension = () => {
  console.log('Extension not found, building...');
  log = spawnSync('npm', ['run', 'build:vite'], { shell: true });
};

export const packExtension = () => {
  let log;
  if (!fs.existsSync(resolve(DIST, 'manifest.json'))) {
    console.log('Extension not found, building...');
    buildExtension();
  }
  const crx = `${DIST}.crx`;
  if (fs.existsSync(chrome)) {
    const cmd = `"${chrome}" --pack-extension="${DIST}" --pack-extension-key="${KEY}" --no-message-box`;
    console.log(cmd);
    log = execSync(cmd).toString();
    console.log(log);
    if (fs.existsSync(crx)) {
      const newName = getExtensionName();
      console.log(`rename to ${newName}`);
      fs.renameSync(crx, resolve(ROOT, newName));
      fs.writeFileSync(resolve(ROOT, 'update.xml'), updateManifest());
    }
  }
};

export const updateManifest = () => `<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${extensionId()}'>
    <updatecheck codebase='${DOWNLOAD_URL}' version='${getManifest().version}' />
  </app>
</gupdate>
`

export const installLocal = () => {
  const crx = resolve(ROOT, getExtensionName());
  if (!fs.existsSync(crx)) {
    console.log('Extension not found, packing...');
    packExtension();
  }

  const json = {
    external_crx: crx,
    external_version: getManifest().version,
  };

  getAvailabeBrowsers()?.map((name) => {
    const extPath = resolve(browsers[name].lib, `External Extensions`);
    if (!fs.existsSync(extPath)) {
      try {
        fs.mkdirSync(extPath);
      } catch (e) {
        throw new Error(
          `Unable to create a folder, please create it manually: \nsudo mkdir -p "${extPath}"\n\n\n`
        );
      }
    }
    const extJsonPath = resolve(extPath, `${extensionId()}.json`);
    fs.writeFileSync(extJsonPath, JSON.stringify(json, null, 2));
  });
  console.log('Please refresh extensions page');
};
