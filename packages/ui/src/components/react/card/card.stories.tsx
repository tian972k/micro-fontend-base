import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta: Meta<typeof Card> = {
  title: "React/Card",
  component: Card,
  tags: ["autodocs", "react"],
  argTypes: {
    gradient: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card className="w-[350px]" {...args}>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              placeholder="Name of your project"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
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
    </Card>
  ),
  args: {},
};

export const Gradient: Story = {
  args: {
    gradient: true,
    className: "w-[350px] h-[200px] flex items-center justify-center",
    children: <CardTitle>Gradient Card</CardTitle>,
  },
};
