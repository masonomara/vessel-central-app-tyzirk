import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, analyticsChartConfig } from '../styles/commonStyles';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { VesselCard } from '../components/VesselCard';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scrollProps } from '../hooks/useTopPadding';
import { useExpenseAnalytics } from '../hooks/useExpenseAnalytics';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { userId, userRole } = useAuth();
  const {
    getExpensesForUser,
    getCharterLogsForUser,
    getVesselsForUser,
  } = useData();

  const expenses = useMemo(() => {
    if (!userId || !userRole) return [];
    return getExpensesForUser(userId, userRole);
  }, [userId, userRole, getExpensesForUser]);

  const charterLogs = useMemo(() => {
    if (!userId || !userRole) return [];
    return getCharterLogsForUser(userId, userRole);
  }, [userId, userRole, getCharterLogsForUser]);

  const vessels = useMemo(() => {
    if (!userId || !userRole) return [];
    return getVesselsForUser(userId, userRole);
  }, [userId, userRole, getVesselsForUser]);

  const { totalExpenses, avgMonthlyExpense, expensesByMonth, expensesByCategory } =
    useExpenseAnalytics(expenses);

  const charterRevenue = useMemo(() => {
    return charterLogs.reduce((sum, c) => sum + c.revenue, 0);
  }, [charterLogs]);

  const charterProfit = useMemo(() => {
    return charterLogs.reduce(
      (sum, c) => sum + (c.revenue - c.expenses - (c.brokerCommission || 0)),
      0,
    );
  }, [charterLogs]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen options={{ title: 'Analytics' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Expenses</Text>
                <Text style={styles.statValue}>${totalExpenses.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Monthly</Text>
                <Text style={styles.statValue}>${Math.round(avgMonthlyExpense).toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Charter Revenue</Text>
                <Text style={styles.statValue}>${charterRevenue.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Charter Profit</Text>
                <Text style={[styles.statValue, { color: charterProfit >= 0 ? colors.success : colors.danger }]}>
                  ${charterProfit.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expense Trends</Text>
          </View>
          <View style={styles.card}>
            {expensesByMonth.datasets[0].data.some(v => v > 0) ? (
              <LineChart
                data={expensesByMonth}
                width={screenWidth - 80}
                height={220}
                chartConfig={analyticsChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero
              />
            ) : (
              <Text style={styles.emptyText}>No expense data available</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expenses by Category</Text>
          </View>
          <View style={styles.card}>
            {expensesByCategory.datasets[0].data.some(v => v > 0) ? (
              <BarChart
                data={expensesByCategory}
                width={screenWidth - 80}
                height={220}
                chartConfig={analyticsChartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
                yAxisLabel="$"
                yAxisSuffix=""
              />
            ) : (
              <Text style={styles.emptyText}>No category data available</Text>
            )}
          </View>
        </View>

        {vessels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fleet Vessels</Text>
              <Text style={styles.sectionCount}>
                {vessels.length} {vessels.length === 1 ? 'vessel' : 'vessels'}
              </Text>
            </View>
            {vessels.map(vessel => (
              <VesselCard
                key={vessel.id}
                vessel={vessel}
                onPress={() => router.push({ pathname: '/detail-vessel', params: { id: vessel.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 15,
    color: colors.textTertiary,
  },
  card: {
    backgroundColor: colors.container,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    gap: 12,
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});
