import { CheckCircle, Circle, Clock } from "lucide-react";
import { formatDate } from "@/lib/grievance-utils";
import type { StatusHistory, GrievanceStatus } from "@/types/grievance";
import { cn } from "@/lib/utils";

interface StatusTimelineProps {
  history: StatusHistory[];
  currentStatus: GrievanceStatus;
}

const statusIcons = {
  "New": Circle,
  "In Progress": Clock,
  "Action Taken": CheckCircle,
  "Closed": CheckCircle,
};

const statusColors = {
  "New": "text-blue-500",
  "In Progress": "text-yellow-500",
  "Action Taken": "text-green-500",
  "Closed": "text-gray-500",
};

export default function StatusTimeline({ history, currentStatus }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No status history available
      </div>
    );
  }

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedHistory.map((item, index) => {
        const Icon = statusIcons[item.new_status] || Circle;
        const isLast = index === sortedHistory.length - 1;

        return (
          <div key={item.id} className="flex gap-4 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
            )}

            {/* Icon */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full border-2 border-background bg-card flex items-center justify-center shadow-sm z-10",
              statusColors[item.new_status]
            )}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    {item.old_status ? (
                      <>
                        Status changed from <span className="text-muted-foreground">{item.old_status}</span> to{" "}
                        <span className={statusColors[item.new_status]}>{item.new_status}</span>
                      </>
                    ) : (
                      <>
                        Grievance submitted as <span className={statusColors[item.new_status]}>{item.new_status}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.changed_at)}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
