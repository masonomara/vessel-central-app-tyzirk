
import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../styles/commonStyles';

interface MiniBarChartProps {
  data: number[];
  color?: string;
  height?: number;
  showAxis?: boolean;
}

export const MiniBarChart = memo(function MiniBarChart({
  data,
  color = colors.accent,
  height = 60,
  showAxis = false,
}: MiniBarChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return {
      max,
      min,
      range,
      normalizedData: data.map(value => ((value - min) / range) * (height - 10)),
    };
  }, [data, height]);

  if (!chartData) {
    return null;
  }

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartContainer}>
        {chartData.normalizedData.map((normalizedHeight, index) => (
          <View key={index} style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: normalizedHeight || 2,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        ))}
      </View>
      {showAxis && (
        <View style={styles.axis}>
          <Text style={styles.axisLabel}>{chartData.min}</Text>
          <Text style={styles.axisLabel}>{chartData.max}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    gap: 2,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
});
