import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, Link, useLoaderData } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const styles = "/assets/globals-D_hDyDIe.css";
const links = () => [
  { rel: "stylesheet", href: styles }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
var REACT_LAZY_TYPE = Symbol.for("react.lazy");
var use = React[" use ".trim().toString()];
function isPromiseLike(value) {
  return typeof value === "object" && value !== null && "then" in value;
}
function isLazyComponent(element) {
  return element != null && typeof element === "object" && "$$typeof" in element && element.$$typeof === REACT_LAZY_TYPE && "_payload" in element && isPromiseLike(element._payload);
}
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    let { children, ...slotProps } = props;
    if (isLazyComponent(children) && typeof use === "function") {
      children = use(children._payload);
    }
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
var Slot = /* @__PURE__ */ createSlot("Slot");
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    let { children, ...slotProps } = props;
    if (isLazyComponent(children) && typeof use === "function") {
      children = use(children._payload);
    }
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  var _a, _b;
  let getter = (_a = Object.getOwnPropertyDescriptor(element.props, "ref")) == null ? void 0 : _a.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = (_b = Object.getOwnPropertyDescriptor(element, "ref")) == null ? void 0 : _b.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
const falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config) => (props) => {
  var _config_compoundVariants;
  if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
  const { variants, defaultVariants } = config;
  const getVariantClassNames = Object.keys(variants).map((variant) => {
    const variantProp = props === null || props === void 0 ? void 0 : props[variant];
    const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
    if (variantProp === null) return null;
    const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
    return variants[variant][variantKey];
  });
  const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
    let [key, value] = param;
    if (value === void 0) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
    let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
    return Object.entries(compoundVariantOptions).every((param2) => {
      let [key, value] = param2;
      return Array.isArray(value) ? value.includes({
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key]) : {
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key] === value;
    }) ? [
      ...acc,
      cvClass,
      cvClassName
    ] : acc;
  }, []);
  return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
function MainLayout({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsxs("header", { className: "border-b bg-background px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "font-bold text-xl", children: "App Shell" }),
      /* @__PURE__ */ jsxs("nav", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "text-foreground/80 hover:text-foreground", children: "Home" }),
        /* @__PURE__ */ jsx(Link, { to: "/app-a", className: "text-foreground/80 hover:text-foreground", children: "App A" }),
        /* @__PURE__ */ jsx(Link, { to: "/app-b", className: "text-foreground/80 hover:text-foreground", children: "App B" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Log In" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", children: "Sign Up" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 container mx-auto py-6", children: children || /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t py-4 text-center text-sm text-muted-foreground", children: "Micro-Frontend Architecture Base" })
  ] });
}
const meta$2 = () => {
  return [
    { title: "App Shell" },
    { name: "description", content: "Micro-Frontend Shell" }
  ];
};
function Index() {
  return /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold tracking-tight mb-4", children: "Welcome to the App Shell" }),
    /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-[600px] mb-8", children: "This is the server-rendered container that orchestrates micro-apps. Navigate to App A or App B to see client-side islands in action." }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(Button, { size: "lg", children: "Get Started" }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "lg", children: "Documentation" })
    ] })
  ] }) });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
function MicroFrontendHost({ name, host }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorDetails, setErrorDetails] = useState("");
  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      setStatus("checking");
      try {
        const res = await fetch(`${host}/health.json`);
        if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
        const health = await res.json();
        if (health.status === "maintenance") {
          if (mounted) setStatus("maintenance");
          return;
        }
        if (health.status !== "available") {
          if (mounted) {
            setStatus("error");
            setErrorDetails("Service Unavailable");
          }
          return;
        }
        loadManifest();
      } catch (err) {
        if (mounted) {
          setStatus("error");
          setErrorDetails(err.message);
        }
      }
    };
    const loadManifest = async () => {
      var _a, _b;
      if (!mounted) return;
      setStatus("loading");
      try {
        const res = await fetch(`${host}/manifest.json`);
        if (!res.ok) throw new Error("Manifest not found (Dev: build may be missing)");
        const manifest = await res.json();
        const entryFile = (_a = manifest["index.html"]) == null ? void 0 : _a.file;
        const cssFiles = ((_b = manifest["index.html"]) == null ? void 0 : _b.css) || [];
        if (!entryFile) throw new Error("Entry file not found in manifest");
        cssFiles.forEach((css) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = `${host}/${css}`;
          document.head.appendChild(link);
        });
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `${host}/${entryFile}`;
          script.type = "module";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load script bundle: ${entryFile}`));
          const timeoutId = setTimeout(() => {
            reject(new Error("Script loading timed out"));
          }, 1e4);
          script.addEventListener("load", () => clearTimeout(timeoutId));
          script.addEventListener("error", () => clearTimeout(timeoutId));
          document.body.appendChild(script);
        });
        if (mounted) mountMicroApp();
      } catch (err) {
        console.error(`[MFE] Error loading ${name}:`, err);
        if (mounted) {
          setStatus("error");
          setErrorDetails(err.message || "Unknown error during initialization");
        }
      }
    };
    const mountMicroApp = () => {
      var _a;
      if (!containerRef.current) return;
      const microApp = (_a = window.MFE) == null ? void 0 : _a[name];
      if (!microApp) {
        setStatus("error");
        setErrorDetails(`MicroApp "${name}" not found in window.MFE`);
        return;
      }
      microApp.mount(containerRef.current, {
        theme: "light"
        // TODO: Get from context
      });
      setStatus("mounted");
    };
    fetchHealth();
    return () => {
      var _a, _b;
      mounted = false;
      if (containerRef.current) {
        (_b = (_a = window.MFE) == null ? void 0 : _a[name]) == null ? void 0 : _b.unmount(containerRef.current);
      }
    };
  }, [name, host]);
  if (status === "checking" || status === "loading") {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center animate-pulse", children: [
      "Loading ",
      name,
      "..."
    ] });
  }
  if (status === "maintenance") {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center border-2 border-yellow-200 bg-yellow-50 rounded-lg", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-yellow-800", children: "Under Maintenance" }),
      /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "This application is currently undergoing scheduled maintenance." })
    ] });
  }
  if (status === "error") {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center border-2 border-red-200 bg-red-50 rounded-lg", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-red-800", children: "Unavailable" }),
      /* @__PURE__ */ jsx("p", { className: "text-red-700", children: "We could not load this application." }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-2", children: errorDetails })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { ref: containerRef, id: `mfe-${name}`, className: "min-h-[400px]" });
}
function getAppConfig() {
  return {
    apps: {
      "app-a": process.env.MFE_APP_A_URL || "http://localhost:5001",
      "app-b": process.env.MFE_APP_B_URL || "http://localhost:5002"
    }
  };
}
const meta$1 = () => {
  return [
    { title: "App A | App Shell" }
  ];
};
async function loader$1({ request }) {
  const config = getAppConfig();
  return json({ appHost: config.apps["app-a"] });
}
function AppARoute() {
  const { appHost } = useLoaderData();
  return /* @__PURE__ */ jsxs(MainLayout, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Application A" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
        "Loaded from ",
        appHost
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border rounded-xl p-4 shadow-sm bg-card", children: /* @__PURE__ */ jsx(MicroFrontendHost, { name: "app-a", host: appHost }) })
  ] });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AppARoute,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [
    { title: "App B | App Shell" }
  ];
};
async function loader({ request }) {
  const config = getAppConfig();
  return json({ appHost: config.apps["app-b"] });
}
function AppBRoute() {
  const { appHost } = useLoaderData();
  return /* @__PURE__ */ jsxs(MainLayout, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Application B (Hybrid Next.js)" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
        "Loaded from ",
        appHost
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border rounded-xl p-4 shadow-sm bg-card", children: /* @__PURE__ */ jsx(MicroFrontendHost, { name: "app-b", host: appHost }) })
  ] });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AppBRoute,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CkAcA9rm.js", "imports": ["/assets/components-E1YimiJs.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-B8NTJV7j.js", "imports": ["/assets/components-E1YimiJs.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-BoNTweK3.js", "imports": ["/assets/components-E1YimiJs.js", "/assets/Layout-C3ymXIf5.js"], "css": [] }, "routes/app-a": { "id": "routes/app-a", "parentId": "root", "path": "app-a", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app-a-DEf-Z2b2.js", "imports": ["/assets/components-E1YimiJs.js", "/assets/Layout-C3ymXIf5.js", "/assets/MicroFrontendHost-yg3Y25GN.js"], "css": [] }, "routes/app-b": { "id": "routes/app-b", "parentId": "root", "path": "app-b", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app-b-Dy9iZcxS.js", "imports": ["/assets/components-E1YimiJs.js", "/assets/Layout-C3ymXIf5.js", "/assets/MicroFrontendHost-yg3Y25GN.js"], "css": [] } }, "url": "/assets/manifest-9f2ac735.js", "version": "9f2ac735" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/app-a": {
    id: "routes/app-a",
    parentId: "root",
    path: "app-a",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/app-b": {
    id: "routes/app-b",
    parentId: "root",
    path: "app-b",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
