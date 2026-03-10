import { colors } from "../styles/commonStyles";
import {
  TaskPriority,
  TaskStatus,
  SupplyRequestStatus,
  EquipmentCondition,
} from "../types";

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case "critical":
      return colors.danger;
    case "urgent":
      return colors.danger;
    case "high":
      return colors.warning;
    case "medium":
      return colors.accent;
    case "low":
      return colors.success;
    case "none":
      return colors.grey;
    default:
      return colors.grey;
  }
}

export function getPriorityBadgeColors(priority: TaskPriority): {
  fg: string;
  bg: string;
} {
  switch (priority) {
    case "critical":
      return { fg: colors.redForeground, bg: colors.redBackground };
    case "urgent":
      return { fg: colors.redForeground, bg: colors.redBackground };
    case "high":
      return { fg: colors.redForeground, bg: colors.redBackground };
    case "medium":
      return { fg: colors.orangeForeground, bg: colors.orangeBackground };
    case "low":
      return { fg: colors.yellowForeground, bg: colors.yellowBackground };
    case "none":
      return { fg: colors.textSecondary, bg: colors.surfaceThree };
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

export function getConditionBadgeColors(condition: EquipmentCondition): {
  fg: string;
  bg: string;
} {
  switch (condition) {
    case "good":
      return { fg: colors.textSecondary, bg: colors.surfaceThree };
    case "fair":
      return { fg: colors.textSecondary, bg: colors.surfaceThree };
    case "poor":
      return { fg: colors.yellowForeground, bg: colors.yellowBackground };
    case "needs_replacement":
      return { fg: colors.redForeground, bg: colors.redBackground };
    default:
      return { fg: colors.textSecondary, bg: colors.surfaceThree };
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
