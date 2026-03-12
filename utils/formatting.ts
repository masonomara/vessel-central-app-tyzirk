import { colors } from "../styles/commonStyles";
import { TaskPriority, EquipmentCondition } from "../types";

export const PRIORITY_OPTIONS: TaskPriority[] = ['none', 'low', 'medium', 'high', 'urgent', 'critical'];

export function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatDueDate = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `Due in ${days} days`;
  if (days < 30) return `Due in ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const isOverdue = (date: Date): boolean => {
  return date.getTime() < new Date().getTime();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

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
