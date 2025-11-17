
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#0A2463',    // Deep Navy Blue (yacht/maritime theme)
  secondary: '#1E3A8A',  // Royal Blue
  accent: '#3B82F6',     // Bright Blue
  success: '#10B981',    // Green for completed tasks
  warning: '#F59E0B',    // Amber for pending items
  danger: '#EF4444',     // Red for urgent/overdue
  background: '#0F172A',  // Dark slate background
  backgroundAlt: '#1E293B',  // Lighter slate
  card: '#1E293B',       // Card background
  text: '#F1F5F9',       // Light text
  textSecondary: '#94A3B8', // Secondary text
  grey: '#64748B',       // Grey
  border: '#334155',     // Border color
  gold: '#F59E0B',       // Gold accent for premium feel
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.text,
  },
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
});
