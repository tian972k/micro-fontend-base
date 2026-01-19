import { importShared } from './__federation_fn_import.js';
import { r as reactDomExports } from './index2.js';
import { j as jsxRuntimeExports } from './jsx-runtime.js';

var client = {};

var m = reactDomExports;
{
  client.createRoot = m.createRoot;
  client.hydrateRoot = m.hydrateRoot;
}

const APP_IDS = {
  SHELL: "shell",
  REACT: "app-react",
  NEXTJS: "app-nextjs",
  VUE: "app-vue",
  SVELTE: "app-svelte",
  SOLIDJS: "app-solidjs"
};

const __vite_import_meta_env__ = {"BASE_URL": "http://localhost:8002", "DEV": false, "MODE": "production", "PROD": true, "SSR": false};
var define_process_env_default = {};
const getPort = (envVar, defaultPort) => {
  if (typeof process !== "undefined" && define_process_env_default[envVar]) {
    return parseInt(define_process_env_default[envVar], 10);
  }
  if (typeof import.meta !== "undefined" && __vite_import_meta_env__) {
    const metaEnv = __vite_import_meta_env__;
    const viteVar = `VITE_${envVar}`;
    if (metaEnv[viteVar]) {
      return parseInt(metaEnv[viteVar], 10);
    }
    if (metaEnv[envVar]) {
      return parseInt(metaEnv[envVar], 10);
    }
  }
  return defaultPort;
};
({
  [APP_IDS.SHELL]: getPort("SHELL_PORT", 8e3),
  [APP_IDS.REACT]: getPort("APP_REACT_PORT", 8001),
  [APP_IDS.NEXTJS]: getPort("APP_NEXTJS_PORT", 8002),
  [APP_IDS.VUE]: getPort("APP_VUE_PORT", 8003),
  [APP_IDS.SVELTE]: getPort("APP_SVELTE_PORT", 8004),
  [APP_IDS.SOLIDJS]: getPort("APP_SOLIDJS_PORT", 8005)
});

const EVENT_KEYS = {
  APP_COUNTER: "APP_COUNTER"
  // Add more global event keys here
};

const {Button} = await importShared('@repo/ui');

const {syncStore} = await importShared('@repo/core');
const {useEffect,useState} = await importShared('react');

function CounterWidget() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const signup = syncStore(
      {
        getState: () => ({ count }),
        setState: (state) => {
          setCount(state.count);
        },
        subscribe: () => {
          return () => {
          };
        }
      },
      { key: EVENT_KEYS.APP_COUNTER }
    );
    return () => {
      signup();
    };
  }, [count]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card text-card-foreground shadow-sm p-6 border-primary/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold tracking-tight text-primary", children: "App B: Next.js Module" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Framework: React 18 / Next.js" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 21h10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 3v18" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-8 bg-background/50 rounded-lg border border-border/50 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2", children: "Shared Counter Value" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-6xl font-black text-primary tabular-nums", children: count })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "w-full h-12 text-lg hover:bg-primary/5",
          onClick: () => setCount((c) => c - 1),
          children: "Decrement"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "w-full h-12 text-lg shadow-md",
          onClick: () => setCount((c) => c + 1),
          children: "Increment"
        }
      )
    ] })
  ] }) });
}

function MfeComponent(_props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CounterWidget, {});
}

const React = await importShared('react');
const {AppRegistry,createReactMfeEntry} = await importShared('@repo/core');
const { mount, unmount, default: microApp } = createReactMfeEntry({
  AppComponent: MfeComponent,
  appId: APP_IDS.NEXTJS,
  registry: AppRegistry,
  StrictMode: React.StrictMode,
  createRoot: client.createRoot
});
const rootElement = document.getElementById("root");
if (rootElement) {
  mount(rootElement, { name: "app-nextjs" });
}

export { microApp as default, mount, unmount };
