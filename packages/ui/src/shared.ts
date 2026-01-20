// Shared utilities that work across all frameworks
export { cn } from "@repo/utils";

// Export all shared variants - these can be used by any framework
export * from "./shared/variants";

// Re-export commonly used utilities
export {
  buttonVariants,
  type ButtonVariant,
  type ButtonSize,
} from "./shared/variants/button";
export { cardClasses } from "./shared/variants/card";
export { inputClasses } from "./shared/variants/input";
export {
  sheetVariants,
  sheetClasses,
  type SheetSide,
} from "./shared/variants/sheet";
export { separatorClasses } from "./shared/variants/separator";
export { skeletonClasses } from "./shared/variants/skeleton";
export { tooltipClasses } from "./shared/variants/tooltip";
export { avatarClasses } from "./shared/variants/avatar";
