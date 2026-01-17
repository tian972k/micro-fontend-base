import{j as e}from"./bundle-mjs-BnpRZrpY.js";import{S as l,a as o,b as n,c as d,d as c,e as h,f as m,g as p}from"./sheet-CxDeJE59.js";import{B as a}from"./button-ByN8YjpI.js";import{I as r}from"./input-BsvhwQ52.js";import"./iframe-Bkb8o0xo.js";import"./index-CNGDm2rl.js";import"./index-W-iqCezE.js";import"./index-IFhxvYCp.js";import"./index-CeQyeD2E.js";import"./index-88SpO9eA.js";import"./index-CjBh5xxL.js";import"./index-DgdhKIVa.js";import"./createLucideIcon-pyCGlTHT.js";import"./index-ScUhNWld.js";const T={title:"React/Sheet",component:l,tags:["autodocs","react"]},t={render:()=>e.jsxs(l,{children:[e.jsx(o,{asChild:!0,children:e.jsx(a,{variant:"outline",children:"Open"})}),e.jsxs(n,{children:[e.jsxs(d,{children:[e.jsx(c,{children:"Edit profile"}),e.jsx(h,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx("label",{htmlFor:"name",className:"text-right",children:"Name"}),e.jsx(r,{id:"name",value:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx("label",{htmlFor:"username",className:"text-right",children:"Username"}),e.jsx(r,{id:"username",value:"@peduarte",className:"col-span-3"})]})]}),e.jsx(m,{children:e.jsx(p,{asChild:!0,children:e.jsx(a,{type:"submit",children:"Save changes"})})})]})]})},s={render:()=>e.jsx("div",{className:"grid grid-cols-2 gap-2",children:["top","right","bottom","left"].map(i=>e.jsxs(l,{children:[e.jsx(o,{asChild:!0,children:e.jsx(a,{variant:"outline",children:i})}),e.jsxs(n,{side:i,children:[e.jsxs(d,{children:[e.jsx(c,{children:"Edit profile"}),e.jsx(h,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx("label",{htmlFor:"name",className:"text-right",children:"Name"}),e.jsx(r,{id:"name",value:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx("label",{htmlFor:"username",className:"text-right",children:"Username"}),e.jsx(r,{id:"username",value:"@peduarte",className:"col-span-3"})]})]}),e.jsx(m,{children:e.jsx(p,{asChild:!0,children:e.jsx(a,{type:"submit",children:"Save changes"})})})]})]},i))})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">
              Username
            </label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-2 gap-2">
      {["top", "right", "bottom", "left"].map(side => <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side as any}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input id="name" value="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="username" className="text-right">
                  Username
                </label>
                <Input id="username" value="@peduarte" className="col-span-3" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>)}
    </div>
}`,...s.parameters?.docs?.source}}};const k=["Default","Side"];export{t as Default,s as Side,k as __namedExportsOrder,T as default};
