import { Skeleton } from "@repo/ui";

interface MfeLoadingProps {
  name: string;
}

export function MfeLoading({ name }: MfeLoadingProps) {
  return (
    <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
      <Skeleton className="w-full h-full rounded-lg absolute inset-0 opacity-20" />
      <div className="relative z-20 flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading {name}...
        </p>
      </div>
    </div>
  );
}
