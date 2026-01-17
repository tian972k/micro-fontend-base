import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "React/Button",
  component: Button,
  tags: ["autodocs", "react"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};
