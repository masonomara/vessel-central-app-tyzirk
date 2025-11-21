
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Primary Navy/Charcoal Palette
  primary: '#0A2540',        // Deep Navy (primary brand color)
  primaryDark: '#051729',    // Darker Navy
  secondary: '#1E3A5F',      // Medium Navy
  charcoal: '#2C3E50',       // Charcoal
  charcoalLight: '#34495E',  // Light Charcoal
  
  // Accent Colors
  accent: '#3B82F6',         // Bright Blue (operational)
  gold: '#D4AF37',           // Subtle Gold (premium accent)
  goldLight: '#E8C547',      // Light Gold
  
  // Status Colors
  success: '#10B981',        // Green for completed/active
  warning: '#F59E0B',        // Amber for pending
  danger: '#EF4444',         // Red for urgent/issues
  info: '#3B82F6',           // Blue for info
  
  // Status Pills
  statusInPort: '#10B981',      // Green
  statusOnCharter: '#3B82F6',   // Blue
  statusInYard: '#F59E0B',      // Amber
  statusOffline: '#6B7280',     // Gray
  
  // Backgrounds
  background: '#0F1419',        // Very Dark (almost black)
  backgroundAlt: '#1A1F26',     // Dark slate
  backgroundLight: '#252B33',   // Lighter dark
  card: '#1E2530',              // Card background
  cardHover: '#252D3A',         // Card hover state
  
  // Text
  text: '#F8FAFC',              // Almost white
  textSecondary: '#94A3B8',     // Light gray
  textTertiary: '#64748B',      // Medium gray
  textMuted: '#475569',         // Muted gray
  
  // Borders & Dividers
  border: '#2D3748',            // Subtle border
  borderLight: '#374151',       // Lighter border
  divider: '#1F2937',           // Divider line
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Gradients (for use in LinearGradient)
  gradientStart: '#0A2540',
  gradientEnd: '#1E3A5F',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  goldButton: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  
  // Typography
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  textSmall: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    lineHeight: 16,
  },
  textMuted: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 20,
  },
  
  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardCompact: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.large,
  },
  
  // Sections
  section: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Badges & Pills
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
  dividerLight: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  
  // Icons
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
