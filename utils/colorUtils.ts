import { colors } from "../styles/commonStyles";
import { TaskPriority, TaskStatus, SupplyRequestStatus } from "../types";

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case "urgent":
      return colors.danger;
    case "high":
      return colors.warning;
    case "medium":
      return colors.accent;
    case "low":
      return colors.success;
    default:
      return colors.grey;
  }
}

export function getPriorityBadgeColors(priority: TaskPriority): {
  fg: string;
  bg: string;
} {
  switch (priority) {
    case "urgent":
      return { fg: colors.redForeground, bg: colors.redBackground };
    case "high":
      return { fg: colors.redForeground, bg: colors.redBackground };
    case "medium":
      return { fg: colors.orangeForeground, bg: colors.orangeBackground };
    case "low":
      return { fg: colors.yellowForeground, bg: colors.yellowBackground };
    default:
      return { fg: colors.textSecondary, bg: colors.surfaceThree };
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case "completed":
      return colors.success;
    case "in_progress":
      return colors.accent;
    case "waiting_on_parts":
      return colors.warning;
    case "open":
      return colors.grey;
    default:
      return colors.grey;
  }
}

export function getSupplyStatusColor(status: SupplyRequestStatus): string {
  switch (status) {
    case "approved":
      return colors.success;
    case "ordered":
      return colors.accent;
    case "received":
      return colors.success;
    case "denied":
      return colors.danger;
    case "pending":
      return colors.warning;
    default:
      return colors.grey;
  }
}
