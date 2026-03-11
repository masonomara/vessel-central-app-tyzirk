import { colors } from "../styles/commonStyles";
import {
  TaskPriority,
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
