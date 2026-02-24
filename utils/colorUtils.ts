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
