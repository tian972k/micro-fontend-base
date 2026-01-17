import{j as s}from"./bundle-mjs-BnpRZrpY.js";import{r as t}from"./iframe-Bkb8o0xo.js";import{u as B,c as M,a as $,P as v,b as q,d as L}from"./index-CNGDm2rl.js";import{u as k}from"./index-W-iqCezE.js";import{u as F}from"./index-88SpO9eA.js";import{B as V}from"./button-ByN8YjpI.js";import"./index-IFhxvYCp.js";import"./index-CeQyeD2E.js";import"./index-ScUhNWld.js";var C="Collapsible",[z]=M(C),[G,N]=z(C),E=t.forwardRef((e,a)=>{const{__scopeCollapsible:l,open:r,defaultOpen:n,disabled:d,onOpenChange:i,...b}=e,[c,p]=B({prop:r,defaultProp:n??!1,onChange:i,caller:C});return s.jsx(G,{scope:l,disabled:d,contentId:$(),open:c,onOpenToggle:t.useCallback(()=>p(x=>!x),[p]),children:s.jsx(v.div,{"data-state":R(c),"data-disabled":d?"":void 0,...b,ref:a})})});E.displayName=C;var S="CollapsibleTrigger",A=t.forwardRef((e,a)=>{const{__scopeCollapsible:l,...r}=e,n=N(S,l);return s.jsx(v.button,{type:"button","aria-controls":n.contentId,"aria-expanded":n.open||!1,"data-state":R(n.open),"data-disabled":n.disabled?"":void 0,disabled:n.disabled,...r,ref:a,onClick:q(e.onClick,n.onOpenToggle)})});A.displayName=S;var _="CollapsibleContent",D=t.forwardRef((e,a)=>{const{forceMount:l,...r}=e,n=N(_,e.__scopeCollapsible);return s.jsx(L,{present:l||n.open,children:({present:d})=>s.jsx(H,{...r,ref:a,present:d})})});D.displayName=_;var H=t.forwardRef((e,a)=>{const{__scopeCollapsible:l,present:r,children:n,...d}=e,i=N(_,l),[b,c]=t.useState(r),p=t.useRef(null),x=F(a,p),j=t.useRef(0),O=j.current,T=t.useRef(0),w=T.current,h=i.open||b,I=t.useRef(h),m=t.useRef(void 0);return t.useEffect(()=>{const o=requestAnimationFrame(()=>I.current=!1);return()=>cancelAnimationFrame(o)},[]),k(()=>{const o=p.current;if(o){m.current=m.current||{transitionDuration:o.style.transitionDuration,animationName:o.style.animationName},o.style.transitionDuration="0s",o.style.animationName="none";const P=o.getBoundingClientRect();j.current=P.height,T.current=P.width,I.current||(o.style.transitionDuration=m.current.transitionDuration,o.style.animationName=m.current.animationName),c(r)}},[i.open,r]),s.jsx(v.div,{"data-state":R(i.open),"data-disabled":i.disabled?"":void 0,id:i.contentId,hidden:!h,...d,ref:x,style:{"--radix-collapsible-content-height":O?`${O}px`:void 0,"--radix-collapsible-content-width":w?`${w}px`:void 0,...e.style},children:h&&n})});function R(e){return e?"open":"closed"}var J=E,K=A,Q=D;const f=J,g=K,y=Q;try{f.displayName="Collapsible",f.__docgenInfo={description:"",displayName:"Collapsible",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}try{g.displayName="CollapsibleTrigger",g.__docgenInfo={description:"",displayName:"CollapsibleTrigger",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}try{y.displayName="CollapsibleContent",y.__docgenInfo={description:"",displayName:"CollapsibleContent",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}const oe={title:"React/Collapsible",component:f,tags:["autodocs","react"]},u={render:()=>{const[e,a]=t.useState(!1);return s.jsxs(f,{open:e,onOpenChange:a,className:"w-[350px] space-y-2",children:[s.jsxs("div",{className:"flex items-center justify-between space-x-4 px-4",children:[s.jsx("h4",{className:"text-sm font-semibold",children:"@peduarte starred 3 repositories"}),s.jsx(g,{asChild:!0,children:s.jsxs(V,{variant:"ghost",size:"sm",className:"w-9 p-0",children:[s.jsx("span",{className:"sr-only",children:"Toggle"}),e?"Close":"Open"]})})]}),s.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/primitives"}),s.jsxs(y,{className:"space-y-2",children:[s.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/colors"}),s.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@stitches/react"})]})]})}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            @peduarte starred 3 repositories
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <span className="sr-only">Toggle</span>
              {isOpen ? "Close" : "Open"}
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>;
  }
}`,...u.parameters?.docs?.source}}};const ae=["Default"];export{u as Default,ae as __namedExportsOrder,oe as default};
