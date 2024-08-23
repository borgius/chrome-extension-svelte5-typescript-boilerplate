import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";
import { extensionKey } from "../crx";

const { version, name, description } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: `Extension${env.mode === "development" ? " (dev)" : ""}`,
  description: description,
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  icons: {
    "48": "src/assets/icons/favicon.png",
  },
  host_permissions: [
    "<all_urls>"
  ],
  web_accessible_resources: [
    {
      resources: ["src/assets/icons/*"],
      matches: ["<all_urls>"]
    }
  ],
  content_scripts: [
    {
      matches: [
        "<all_urls>",
      ],
      js: ["src/content/index.ts"],
    },
  ],
  background: {
    service_worker: "src/background/index.ts",
  },
  options_ui: {
    page: "src/options/options.html",
    open_in_tab: false,
  },
  side_panel: {
    default_path: "src/sidepanel/sidepanel.html",
  },
  action: {
    default_popup: "src/popup/popup.html",
    default_icon: {
      "48": "src/assets/icons/favicon.png",
    },
  },
  permissions: ["storage", "sidePanel", "cookies", "scripting"] as chrome.runtime.ManifestPermissions[],
  key: extensionKey(),
  update_url: process.env.NODE_ENV === "production" ? process.env.UPDATE_URL : undefined,
}));
