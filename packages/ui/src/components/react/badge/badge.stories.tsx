import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "React/Badge",
  component: Badge,
  tags: ["autodocs", "react"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "success", "destructive"],
    },
  },
  args: { children: "Badge" },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Success: Story = { args: { variant: "success", children: "EN" } };
export const Destructive: Story = { args: { variant: "destructive" } };
