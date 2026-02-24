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
  danger: "#EF4444", // Red for urgent/issues
  info: "#3B82F6", // Blue for info
  grey: "#6B7280", // Neutral gray

  // Backgrounds - DARKER for better text contrast
  surfaceOne: "#fbf8f7", // Almost black (darker)
  surfaceTwo: "#f7f2ef", // Almost black (darker)
  surfaceThree: "#efe4dd", // Almost black (darker)
  container: "#ffffff", // Card background (darker)

  // Text - Higher contrast
  text: "rgba(0, 0, 0, .92)", // Pure white for maximum contrast
  textSecondary: "rgba(0, 0, 0, .76)", // Lighter gray for better visibility
  textTertiary: "rgba(0, 0, 0, .38)", // Medium gray

  // Borders & Dividers
  border: "rgba(0, 0, 0, .28)", // Subtle border
  borderSoft: "rgba(0, 0, 0, .11)", // Subtle border

  divider: "#1f1e1d4d", // Divider line

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
  gradientDangerStart: "#EF4444",
  gradientDangerEnd: "#DC2626",
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
    backgroundColor: colors.surfaceTwo,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: colors.surfaceTwo,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 800,
    width: "100%",
  },

  // Typography
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
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
    fontWeight: "700",
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
