import{o as m,p as x,q as S,t as f,r as i,_ as w,v as a,n as e,O as j,M as g,L as k,S as M}from"./components-E1YimiJs.js";/**
 * @remix-run/react v2.17.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let l="positions";function L({getKey:t,...c}){let{isSpaMode:u}=m(),o=x(),d=S();f({getKey:t,storageKey:l});let h=i.useMemo(()=>{if(!t)return null;let s=t(o,d);return s!==o.key?s:null},[]);if(u)return null;let p=((s,y)=>{if(!window.history.state||!window.history.state.key){let r=Math.random().toString(32).slice(2);window.history.replaceState({key:r},"")}try{let n=JSON.parse(sessionStorage.getItem(s)||"{}")[y||window.history.state.key];typeof n=="number"&&window.scrollTo(0,n)}catch(r){console.error(r),sessionStorage.removeItem(s)}}).toString();return i.createElement("script",w({},c,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${p})(${a(JSON.stringify(l))}, ${a(JSON.stringify(h))})`}}))}const O="/assets/globals-D_hDyDIe.css",v=()=>[{rel:"stylesheet",href:O}];function I({children:t}){return e.jsxs("html",{lang:"en",children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx(g,{}),e.jsx(k,{})]}),e.jsxs("body",{children:[t,e.jsx(L,{}),e.jsx(M,{})]})]})}function R(){return e.jsx(j,{})}export{I as Layout,R as default,v as links};
