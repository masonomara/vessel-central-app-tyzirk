import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Stack, router } from "expo-router";
import { colors, analyticsChartConfig } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scrollProps } from "../hooks/useTopPadding";
import { useExpenseAnalytics } from "../hooks/useExpenseAnalytics";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { userId, userRole } = useAuth();
  const { getExpensesForUser, getCharterLogsForUser, getVesselsForUser } =
    useData();

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

  const {
    totalExpenses,
    avgMonthlyExpense,
    expensesByMonth,
    expensesByCategory,
    revenueVsExpensesByMonth,
  } = useExpenseAnalytics(expenses, charterLogs);

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
      <Stack.Screen options={{ title: "Total Analytics", headerBackTitle: "Back" }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { width: (screenWidth - 48) / 2 }]}>
            <Text style={styles.statLabel}>Total Expenses</Text>
            <Text style={styles.statValue}>
              ${totalExpenses.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statItem, { width: (screenWidth - 48) / 2 }]}>
            <Text style={styles.statLabel}>Avg Monthly</Text>
            <Text style={styles.statValue}>
              ${Math.round(avgMonthlyExpense).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statItem, { width: (screenWidth - 48) / 2 }]}>
            <Text style={styles.statLabel}>Charter Revenue</Text>
            <Text style={styles.statValue}>
              ${charterRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statItem, { width: (screenWidth - 48) / 2 }]}>
            <Text style={styles.statLabel}>Charter Profit</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    charterProfit >= 0
                      ? colors.greenForeground
                      : colors.redForeground,
                },
              ]}
            >
              ${charterProfit.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Total Expense Trends</Text>
          </View>
          <View style={styles.card}>
            {expensesByMonth.datasets[0].data.some((v) => v > 0) ? (
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
            <Text style={styles.sectionTitle}>Total Expenses by Category</Text>
          </View>
          <View style={styles.card}>
            {expensesByCategory.datasets[0].data.some((v) => v > 0) ? (
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

        {revenueVsExpensesByMonth &&
          revenueVsExpensesByMonth.datasets[0].data.some((v) => v > 0) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Total Revenue vs Expenses</Text>
              </View>
              <View style={styles.card}>
                <BarChart
                  data={revenueVsExpensesByMonth}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={analyticsChartConfig}
                  style={styles.chart}
                  fromZero
                  yAxisLabel="$"
                  yAxisSuffix=""
                />
              </View>
            </View>
          )}

        {vessels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fleet Overview</Text>
              <Text style={styles.sectionCount}>
                {vessels.length} {vessels.length === 1 ? "vessel" : "vessels"}
              </Text>
            </View>
            <View style={styles.vesselList}>
              {vessels.map((vessel) => (
                <TouchableOpacity
                  key={vessel.id}
                  style={styles.vesselItem}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/detail-vessel",
                      params: { id: vessel.id },
                    })
                  }
                >
                  <Text style={styles.vesselName}>{vessel.name}</Text>
                  <Text style={styles.vesselLocation}>{vessel.location}</Text>
                  <Text style={styles.vesselMeta}>
                    {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)} · {vessel.crewCount} crew member{vessel.crewCount !== 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
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
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  statItem: {
    backgroundColor: colors.container,
    borderRadius: 12,
    padding: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    marginTop: 2,
    fontWeight: "600",
    color: colors.text,
  },
  chart: {
    borderRadius: 12,
    marginHorizontal: -8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  vesselList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  vesselItem: {
    backgroundColor: colors.container,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  vesselName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  vesselLocation: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2,
  },
  vesselMeta: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 6,
  },
});
