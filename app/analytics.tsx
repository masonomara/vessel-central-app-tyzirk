
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { userId, userRole } = useAuth();
  const { 
    getExpensesForUser, 
    getMaintenanceTasksForUser,
    getIssuesForUser,
    getSupplyRequestsForUser,
  } = useData();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const expenses = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getExpensesForUser(userId, userRole);
  }, [userId, userRole, getExpensesForUser]);

  const maintenanceTasks = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getMaintenanceTasksForUser(userId, userRole);
  }, [userId, userRole, getMaintenanceTasksForUser]);

  const issues = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getIssuesForUser(userId, userRole);
  }, [userId, userRole, getIssuesForUser]);

  const supplyRequests = useMemo(() => {
    if (!userId || !userRole) {
      return [];
    }
    return getSupplyRequestsForUser(userId, userRole);
  }, [userId, userRole, getSupplyRequestsForUser]);

  const expensesByMonth = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleString('default', { month: 'short' });
      monthlyData[key] = 0;
    }

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthKey = expenseDate.toLocaleString('default', { month: 'short' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += expense.amount;
      }
    });

    return {
      labels: Object.keys(monthlyData),
      datasets: [{
        data: Object.values(monthlyData),
      }],
    };
  }, [expenses]);

  const tasksByStatus = useMemo(() => {
    const statusCounts = {
      open: 0,
      in_progress: 0,
      waiting_on_parts: 0,
      completed: 0,
    };

    maintenanceTasks.forEach(task => {
      statusCounts[task.status]++;
    });

    return [
      {
        name: 'Open',
        count: statusCounts.open,
        color: colors.grey,
        legendFontColor: colors.textSecondary,
        legendFontSize: 12,
      },
      {
        name: 'In Progress',
        count: statusCounts.in_progress,
        color: colors.accent,
        legendFontColor: colors.textSecondary,
        legendFontSize: 12,
      },
      {
        name: 'Waiting',
        count: statusCounts.waiting_on_parts,
        color: colors.warning,
        legendFontColor: colors.textSecondary,
        legendFontSize: 12,
      },
      {
        name: 'Completed',
        count: statusCounts.completed,
        color: colors.success,
        legendFontColor: colors.textSecondary,
        legendFontSize: 12,
      },
    ];
  }, [maintenanceTasks]);

  const expensesByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sortedCategories.map(([cat]) => cat),
      datasets: [{
        data: sortedCategories.map(([, amount]) => amount),
      }],
    };
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const avgMonthlyExpense = useMemo(() => {
    if (expensesByMonth.datasets[0].data.length === 0) {
      return 0;
    }
    const total = expensesByMonth.datasets[0].data.reduce((sum, val) => sum + val, 0);
    return total / expensesByMonth.datasets[0].data.length;
  }, [expensesByMonth]);

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.accent,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Analytics' }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol 
              ios_icon_name="dollarsign.circle.fill" 
              android_material_icon_name="payments" 
              size={32} 
              color={colors.success} 
            />
            <Text style={styles.statLabel}>Total Expenses</Text>
            <Text style={styles.statValue}>${totalExpenses.toLocaleString()}</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis" 
              android_material_icon_name="trending_up" 
              size={32} 
              color={colors.accent} 
            />
            <Text style={styles.statLabel}>Avg Monthly</Text>
            <Text style={styles.statValue}>${Math.round(avgMonthlyExpense).toLocaleString()}</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol 
              ios_icon_name="wrench.and.screwdriver.fill" 
              android_material_icon_name="build" 
              size={32} 
              color={colors.warning} 
            />
            <Text style={styles.statLabel}>Active Tasks</Text>
            <Text style={styles.statValue}>
              {maintenanceTasks.filter(t => t.status !== 'completed').length}
            </Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle.fill" 
              android_material_icon_name="warning" 
              size={32} 
              color={colors.danger} 
            />
            <Text style={styles.statLabel}>Open Issues</Text>
            <Text style={styles.statValue}>
              {issues.filter(i => i.status !== 'completed').length}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Trends</Text>
          <View style={styles.chartCard}>
            {expensesByMonth.datasets[0].data.length > 0 ? (
              <LineChart
                data={expensesByMonth}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero
              />
            ) : (
              <Text style={styles.noDataText}>No expense data available</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses by Category</Text>
          <View style={styles.chartCard}>
            {expensesByCategory.datasets[0].data.length > 0 ? (
              <BarChart
                data={expensesByCategory}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
                yAxisLabel="$"
                yAxisSuffix=""
              />
            ) : (
              <Text style={styles.noDataText}>No category data available</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Status Distribution</Text>
          <View style={styles.chartCard}>
            {tasksByStatus.some(s => s.count > 0) ? (
              <PieChart
                data={tasksByStatus}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
              />
            ) : (
              <Text style={styles.noDataText}>No task data available</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={24} 
                color={colors.success} 
              />
              <Text style={styles.metricTitle}>Completion Rate</Text>
            </View>
            <Text style={styles.metricValue}>
              {maintenanceTasks.length > 0 
                ? Math.round((maintenanceTasks.filter(t => t.status === 'completed').length / maintenanceTasks.length) * 100)
                : 0}%
            </Text>
            <Text style={styles.metricSubtext}>
              {maintenanceTasks.filter(t => t.status === 'completed').length} of {maintenanceTasks.length} tasks completed
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={24} 
                color={colors.warning} 
              />
              <Text style={styles.metricTitle}>Average Response Time</Text>
            </View>
            <Text style={styles.metricValue}>2.3 days</Text>
            <Text style={styles.metricSubtext}>From issue report to resolution</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol 
                ios_icon_name="shippingbox.fill" 
                android_material_icon_name="inventory_2" 
                size={24} 
                color={colors.accent} 
              />
              <Text style={styles.metricTitle}>Supply Requests</Text>
            </View>
            <Text style={styles.metricValue}>{supplyRequests.length}</Text>
            <Text style={styles.metricSubtext}>
              {supplyRequests.filter(r => r.status === 'pending').length} pending approval
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
