/// <reference types="vite/client" />

/** Product identity from RELEASE_LABEL (or package.json) injected at build time. */
declare const __APP_VERSION__: string;

/** Short git SHA (or SKILLFORGE_BUILD override) injected at build time. */
declare const __APP_BUILD__: string;
