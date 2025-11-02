/**
 * Generate a unique 8-character tracking code in format: MU-XXXX-YYYY
 * where XXXX and YYYY are random 4-digit numbers
 */
export function generateTrackingCode(): string {
  const part1 = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  const part2 = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `MU-${part1}-${part2}`;
}

/**
 * Get status badge variant based on status
 */
export function getStatusVariant(status: string): "new" | "progress" | "action" | "closed" {
  switch (status) {
    case "New":
      return "new";
    case "In Progress":
      return "progress";
    case "Action Taken":
      return "action";
    case "Closed":
      return "closed";
    default:
      return "new";
  }
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
