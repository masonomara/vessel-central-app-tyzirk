import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { colors, analyticsChartConfig } from '../styles/commonStyles';
import { useData } from '../contexts/DataContext';
import { useExpenseAnalytics } from '../hooks/useExpenseAnalytics';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface VesselAnalyticsSectionProps {
  vesselId: string;
}

export const VesselAnalyticsSection = React.memo(function VesselAnalyticsSection({
  vesselId,
}: VesselAnalyticsSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { expenses, charterLogs } = useData();

  const vesselExpenses = expenses.filter(e => e.vesselId === vesselId);
  const vesselCharters = charterLogs.filter(c => c.vesselId === vesselId);

  const { totalExpenses, avgMonthlyExpense, expensesByMonth, expensesByCategory } =
    useExpenseAnalytics(vesselExpenses);

  const charterRevenue = vesselCharters.reduce((sum, c) => sum + c.revenue, 0);
  const charterProfit = vesselCharters.reduce(
    (sum, c) => sum + (c.revenue - c.expenses - (c.brokerCommission || 0)),
    0,
  );

  const hasExpenses = vesselExpenses.length > 0;
  const hasCharters = vesselCharters.length > 0;

  if (!hasExpenses && !hasCharters) {
    return null;
  }

  const chartWidth = screenWidth - 72;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Expenses</Text>
            <Text style={styles.statValue}>${totalExpenses.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg Monthly</Text>
            <Text style={styles.statValue}>
              ${Math.round(avgMonthlyExpense).toLocaleString()}
            </Text>
          </View>
          {hasCharters && (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Charter Revenue</Text>
                <Text style={styles.statValue}>
                  ${charterRevenue.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Charter Profit</Text>
                <Text style={[styles.statValue, { color: charterProfit >= 0 ? colors.success : colors.danger }]}>
                  ${charterProfit.toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {hasExpenses && expensesByMonth.datasets[0].data.some(v => v > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Expense Trends</Text>
          <LineChart
            data={expensesByMonth}
            width={chartWidth}
            height={160}
            chartConfig={analyticsChartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero
          />
        </View>
      )}

      {hasExpenses && expensesByCategory.labels.length > 0 && expensesByCategory.datasets[0].data.some(v => v > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Expenses by Category</Text>
          <BarChart
            data={expensesByCategory}
            width={chartWidth}
            height={160}
            chartConfig={analyticsChartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            yAxisLabel="$"
            yAxisSuffix=""
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: colors.container,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    minWidth: '45%',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  chart: {
    borderRadius: 12,
    marginHorizontal: -8,
  },
});
