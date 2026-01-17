import { Card, CardContent, Button } from "@repo/ui";
import { AlertCircle, RefreshCcw, WifiOff, ServerCrash } from "lucide-react";

interface MfeErrorProps {
  name: string;
  errorDetails: string;
  onRetry?: () => void;
}

const ERROR_CONFIG: Record<
  string,
  {
    title: string;
    description: (name: string) => string;
    icon: typeof AlertCircle;
  }
> = {
  CORE_CONNECTION_REFUSED: {
    title: "Connection Failed",
    description: (name) =>
      `Could not connect to ${name}. Ensure the micro-app server is running.`,
    icon: WifiOff,
  },
  CORE_NOT_FOUND: {
    title: "App Not Found",
    description: (name) =>
      `The application "${name}" could not be found at the specified URL.`,
    icon: ServerCrash,
  },
  CORE_SERVER_ERROR: {
    title: "Server Error",
    description: (name) =>
      `The application "${name}" server responded with an error (500).`,
    icon: ServerCrash,
  },
};

export function MfeError({ name, errorDetails, onRetry }: MfeErrorProps) {
  // Default fallback
  const config = ERROR_CONFIG[errorDetails] || {
    title: "Application Unavailable",
    description: (name: string) => `We encountered an issue loading "${name}".`,
    icon: AlertCircle,
  };

  const { title, icon: Icon } = config;
  const message = config.description(name);

  return (
    <Card className="border-destructive/20 bg-destructive/5 h-full flex flex-col justify-center">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="bg-destructive/10 p-3 rounded-full">
          <Icon className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-destructive">{title}</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 mb-4">
            {message}
          </p>
          {errorDetails && !errorDetails.startsWith("CORE_") && (
            <code className="block bg-black/5 text-xs p-2 rounded text-left overflow-auto max-w-[300px] mx-auto text-muted-foreground">
              {errorDetails}
            </code>
          )}
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
