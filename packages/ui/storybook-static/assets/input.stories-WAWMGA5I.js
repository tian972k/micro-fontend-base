import{j as r}from"./bundle-mjs-BnpRZrpY.js";import{I as n}from"./input-BsvhwQ52.js";import"./iframe-Bkb8o0xo.js";import"./index-ScUhNWld.js";const{userEvent:o,within:i,expect:m}=__STORYBOOK_MODULE_TEST__,y={title:"React/Input",component:n,tags:["autodocs","react"],argTypes:{type:{control:"select",options:["text","password","email","number"]},disabled:{control:"boolean"}}},e={args:{type:"email",placeholder:"Email"},play:async({canvasElement:s})=>{const l=i(s).getByRole("textbox");await o.type(l,"test@example.com",{delay:100}),await m(l).toHaveValue("test@example.com")}},a={args:{type:"email",placeholder:"Email",disabled:!0}},t={render:s=>r.jsxs("div",{className:"grid w-full max-w-sm items-center gap-1.5",children:[r.jsx("label",{htmlFor:"email",children:"Email"}),r.jsx(n,{type:"email",id:"email",placeholder:"Email",...s})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    type: "email",
    placeholder: "Email"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "test@example.com", {
      delay: 100
    });
    await expect(input).toHaveValue("test@example.com");
  }
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    type: "email",
    placeholder: "Email",
    disabled: true
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email">Email</label>
      <Input type="email" id="email" placeholder="Email" {...args} />
    </div>
}`,...t.parameters?.docs?.source}}};const g=["Default","Disabled","WithLabel"];export{e as Default,a as Disabled,t as WithLabel,g as __namedExportsOrder,y as default};
