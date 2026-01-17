import{j as r,t as g,c as y}from"./bundle-mjs-BnpRZrpY.js";import{r as s}from"./iframe-Bkb8o0xo.js";function n(...e){return g(y(e))}const t=s.forwardRef(({className:e,gradient:a,...o},u)=>r.jsx("div",{ref:u,className:n("rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md",a&&"bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black",e),...o}));t.displayName="Card";const l=s.forwardRef(({className:e,...a},o)=>r.jsx("div",{ref:o,className:n("flex flex-col space-y-1.5 p-6",e),...a}));l.displayName="CardHeader";const i=s.forwardRef(({className:e,...a},o)=>r.jsx("h3",{ref:o,className:n("text-2xl font-semibold leading-none tracking-tight",e),...a}));i.displayName="CardTitle";const p=s.forwardRef(({className:e,...a},o)=>r.jsx("p",{ref:o,className:n("text-sm text-muted-foreground",e),...a}));p.displayName="CardDescription";const f=s.forwardRef(({className:e,...a},o)=>r.jsx("div",{ref:o,className:n("p-6 pt-0",e),...a}));f.displayName="CardContent";const m=s.forwardRef(({className:e,...a},o)=>r.jsx("div",{ref:o,className:n("flex items-center p-6 pt-0",e),...a}));m.displayName="CardFooter";try{n.displayName="cn",n.__docgenInfo={description:"Utility for merging tailwind classes safely.",displayName:"cn",props:{}}}catch{}try{t.displayName="Card",t.__docgenInfo={description:"",displayName:"Card",props:{gradient:{defaultValue:null,description:"",name:"gradient",required:!1,type:{name:"boolean"}}}}}catch{}try{l.displayName="CardHeader",l.__docgenInfo={description:"",displayName:"CardHeader",props:{}}}catch{}try{i.displayName="CardTitle",i.__docgenInfo={description:"",displayName:"CardTitle",props:{}}}catch{}try{p.displayName="CardDescription",p.__docgenInfo={description:"",displayName:"CardDescription",props:{}}}catch{}try{f.displayName="CardContent",f.__docgenInfo={description:"",displayName:"CardContent",props:{}}}catch{}try{m.displayName="CardFooter",m.__docgenInfo={description:"",displayName:"CardFooter",props:{}}}catch{}const _={title:"React/Card",component:t,tags:["autodocs","react"],argTypes:{gradient:{control:"boolean"}}},d={render:e=>r.jsxs(t,{className:"w-[350px]",...e,children:[r.jsxs(l,{children:[r.jsx(i,{children:"Create project"}),r.jsx(p,{children:"Deploy your new project in one-click."})]}),r.jsx(f,{children:r.jsx("div",{className:"grid w-full items-center gap-4",children:r.jsxs("div",{className:"flex flex-col space-y-1.5",children:[r.jsx("label",{htmlFor:"name",children:"Name"}),r.jsx("input",{id:"name",placeholder:"Name of your project",className:"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"})]})})}),r.jsxs(m,{className:"flex justify-between",children:[r.jsx("button",{className:"h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",children:"Cancel"}),r.jsx("button",{className:"h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",children:"Deploy"})]})]}),args:{}},c={args:{gradient:!0,className:"w-[350px] h-[200px] flex items-center justify-center",children:r.jsx(i,{children:"Gradient Card"})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <Card className="w-[350px]" {...args}>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="name">Name</label>
            <input id="name" placeholder="Name of your project" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <button className="h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
          Cancel
        </button>
        <button className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
          Deploy
        </button>
      </CardFooter>
    </Card>,
  args: {}
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    gradient: true,
    className: "w-[350px] h-[200px] flex items-center justify-center",
    children: <CardTitle>Gradient Card</CardTitle>
  }
}`,...c.parameters?.docs?.source}}};const C=["Default","Gradient"];export{d as Default,c as Gradient,C as __namedExportsOrder,_ as default};
