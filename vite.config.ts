import { crx } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, loadEnv } from "vite";
import sveltePreprocess from 'svelte-preprocess';
import manifest from "./src/manifest.config";
import UnoCSS from '@unocss/svelte-scoped/vite'
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";
import tsconfigPaths from 'vite-tsconfig-paths';
import autoprefixer from 'autoprefixer';
import { IGNORED_WARNINGS } from "./src/constants.js";


// https://vitejs.dev/config/
export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return defineConfig({
        plugins: [
            tsconfigPaths(),
            UnoCSS({ }),
            svelte({
                emitCss: mode === "production",
                preprocess: sveltePreprocess(),
                onwarn(warning, handler) {
                    if (!IGNORED_WARNINGS.includes(warning.code))
                        handler(warning)
                },
            }),
            crx({ manifest }),
            mode === "production" && obfuscatorPlugin({
                include: ["src/**/*.ts", "src/**/*.js"],
                apply: "build",
                // debugger: false,
                options: {
                    // optionsPreset: "high-obfuscation",
                    // debugProtection: false,
                }
            })],
        publicDir: "./src/public",
        server: {
            port: 5173,
            strictPort: true,
            hmr: {
                clientPort: 5173,
            },
        },
        css: {
            postcss: {
                plugins: [
                    autoprefixer(),
                ],
            },
        },
    })
}

// https://vitejs.dev/config/
