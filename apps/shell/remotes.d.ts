declare module "app_svelte/Mfe";
declare module "app_vue/Mfe";
declare module "app_react/Mfe";
declare module "app_nextjs/Mfe";
declare module "app_solidjs/Mfe";

declare module "virtual:mfe-loaders" {
  export const mfeLoaders: Record<string, () => Promise<any>>;
}
