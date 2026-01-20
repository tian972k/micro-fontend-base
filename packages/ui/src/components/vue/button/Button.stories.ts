import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Button from "./Button.vue";

const meta: Meta<typeof Button> = {
  title: "Vue/Button",
  component: Button,
  tags: ["autodocs", "vue"],
  parameters: {
    layout: "centered",
  },
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
      description: "The variant of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: "default",
    default: "Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    default: "Destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    default: "Outline",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    default: "Secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    default: "Ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    default: "Link",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    default: "Small",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    default: "Large",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    default: "Disabled",
  },
};
