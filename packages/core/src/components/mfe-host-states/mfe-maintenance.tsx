import { Card, CardContent } from "@repo/ui";
import { Hammer } from "lucide-react";

interface MfeMaintenanceProps {
  name: string;
}

export function MfeMaintenance({ name }: MfeMaintenanceProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50/50 h-full flex flex-col justify-center">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="bg-yellow-100 p-3 rounded-full">
          <Hammer className="w-8 h-8 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-900">
            Under Maintenance
          </h3>
          <p className="text-yellow-700 max-w-xs mx-auto mt-2">
            The application "{name}" is currently undergoing scheduled
            maintenance. Please check back later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
