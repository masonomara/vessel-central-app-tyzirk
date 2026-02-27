import { StyleSheet } from "react-native";

export const colors = {
  // Primary Navy/Charcoal Palette
  primary: "#0A2540", // Deep Navy (primary brand color)
  secondary: "#1E3A5F", // Medium Navy

  // Accent Colors
  accent: "#3B82F6", // Bright Blue (operational)
  gold: "#D4AF37", // Subtle Gold (premium accent)

  // Status Colors
  success: "#10B981", // Green for completed/active
  warning: "#F59E0B", // Amber for pending
  danger: "#9d2435", // Red for urgent/issues
  info: "#3B82F6", // Blue for info
  grey: "#6B7280", // Neutral gray

  // Badge Colors (foreground / background pairs)
  redForeground: "#9d2435",
  redBackground: "#efd7da",
  orangeForeground: "#8e3917",
  orangeBackground: "#f6d6c9",
  yellowForeground: "#615213",
  yellowBackground: "#ecdc97",
  greenForeground: "#016040",
  greenBackground: "#cee1db",
  blueForeground: "#1e4ead",
  blueBackground: "#d2dcf1",
  purpleForeground: "#7a2ca8",
  purpleBackground: "#e7d8ef",

  // Backgrounds
  surfaceOne: "#fbf8f7",
  surfaceTwo: "#f7f2ef",
  surfaceThree: "#efe4dd",
  container: "#ffffff",

  // Text
  text: "rgba(0, 0, 0, .92)",
  textSecondary: "rgba(0, 0, 0, .76)",
  textTertiary: "rgba(0, 0, 0, .38)",

  // Borders & Dividers
  border: "rgba(0, 0, 0, .28)",
  borderSoft: "rgba(0, 0, 0, .11)",
  divider: "#1f1e1d4d",

  // Gradients (for use in LinearGradient)
  gradientStart: "#0A2540",
  gradientEnd: "#1E3A5F",
  gradientAccentStart: "#3B82F6",
  gradientAccentEnd: "#1E40AF",
  gradientGoldStart: "#D4AF37",
  gradientGoldEnd: "#B8941F",
  gradientSuccessStart: "#10B981",
  gradientSuccessEnd: "#059669",
  gradientWarningStart: "#F59E0B",
  gradientWarningEnd: "#D97706",
  gradientDangerStart: "#9d2435",
  gradientDangerEnd: "#9d2435",
};

export const gradients = {
  primary: [colors.gradientStart, colors.gradientEnd] as const,
  accent: [colors.gradientAccentStart, colors.gradientAccentEnd] as const,
  gold: [colors.gradientGoldStart, colors.gradientGoldEnd] as const,
  success: [colors.gradientSuccessStart, colors.gradientSuccessEnd] as const,
  warning: [colors.gradientWarningStart, colors.gradientWarningEnd] as const,
  danger: [colors.gradientDangerStart, colors.gradientDangerEnd] as const,
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  glow: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  glowGold: {
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  goldButton: {
    backgroundColor: colors.gold,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  outlineButton: {
    backgroundColor: "transparent",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surfaceOne,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 800,
  },

  // Typography
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 20,
  },
  textSmall: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textTertiary,
    lineHeight: 16,
  },
  textMuted: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textTertiary,
    lineHeight: 20,
  },

  // Cards
  card: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 16,
    padding: spacing.xl,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Sections
  section: {
    width: "100%",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  // Badges & Pills
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  dividerLight: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // Icons
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const indexScreenStyles = StyleSheet.create({
  // Screen shell
  container: {
    flex: 1,
  },
  listContent: {
    backgroundColor: colors.surfaceOne,
  },
  listHeaderComponent: { marginBottom: 20 },

  // Search bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.container,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },

  // Filter chips
  filterContainer: {
    marginBottom: 0,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,

    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  filterChipActive: {
    backgroundColor: colors.surfaceThree,
    borderColor: colors.surfaceThree,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.text,
  },

  // Collapsible section headers
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 36,
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 2,
    borderColor: colors.borderSoft,
  },
  sectionHeader: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: 15,
    color: colors.textTertiary,
  },
  dropdown: {
    padding: 0,
    paddingRight: 3,
  },

  // Card base
  card: {
    backgroundColor: colors.surfaceOne,
    marginLeft: 20,
    paddingRight: 20,
    marginBottom: 12,
    paddingTop: 12,
  },
  cardLast: {
    marginBottom: 20,
  },

  // Card internals
  topRow: {
    flexDirection: "row",
    gap: 16,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  cardDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 15,
  },
  priorityText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
    borderRadius: 4,
    paddingHorizontal: 4,
    lineHeight: 20,
    height: 20,
  },

  // Checkbox (issues + maintenance)
  completeButton: {
    height: 20,
    width: 20,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  // Offset for rows under checkbox
  bottomRowWithCheckbox: {
    paddingLeft: 36,
  },
  metaRowWithCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 36,
    gap: 8,
    marginTop: 4,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export const detailScreenStyles = StyleSheet.create({
  scrollContent: {},
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
