import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface EmptyStateProps {
  ios_icon_name: string;
  android_material_icon_name: string;
  title: string;
  subtitle: string;
}

export function EmptyState({ ios_icon_name, android_material_icon_name, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <IconSymbol
        ios_icon_name={ios_icon_name}
        android_material_icon_name={android_material_icon_name}
        size={48}
        color={colors.textMuted}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
