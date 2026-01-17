import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";
import { userEvent, within, expect } from "storybook/test";

const meta: Meta<typeof Input> = {
  title: "React/Input",
  component: Input,
  tags: ["autodocs", "react"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: "email",
    placeholder: "Email",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "test@example.com", { delay: 100 });
    await expect(input).toHaveValue("test@example.com");
  },
};

export const Disabled: Story = {
  args: {
    type: "email",
    placeholder: "Email",
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email">Email</label>
      <Input type="email" id="email" placeholder="Email" {...args} />
    </div>
  ),
};
