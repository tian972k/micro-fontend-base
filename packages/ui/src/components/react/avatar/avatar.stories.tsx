import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "React/Avatar",
  component: Avatar,
  tags: ["autodocs", "react"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {},
};

export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};
