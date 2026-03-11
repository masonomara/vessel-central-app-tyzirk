import { useState, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { colors } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { IconSymbol } from "../components/IconSymbol";
import { ListItemCard } from "../components/ListItemCard";
import { CollapsibleSectionHeader } from "../components/CollapsibleSectionHeader";
import { scrollProps } from "../hooks/useTopPadding";
import { formatDate, formatDueDate, formatLabel, getPriorityBadgeColors } from "../utils/formatting";
import {
  formatEventDateRange,
  getEventTypeLabel,
} from "../utils/calendar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VesselDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const {
    vessels,
    maintenanceTasks,
    issues,
    supplyRequests,
    documents,
    calendarEvents,
    getEngineHourLogsForVessel,
  } = useData();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  const vessel = vessels.find((v) => v.id === id);

  if (!vessel) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
        <Stack.Screen options={{ title: "Vessel Not Found" }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Vessel not found</Text>
        </View>
      </View>
    );
  }

  const vesselTasks = maintenanceTasks.filter((t) => t.vesselId === vessel.id);
  const vesselIssues = issues.filter((i) => i.vesselId === vessel.id);
  const vesselSupplies = supplyRequests.filter((s) => s.vesselId === vessel.id);
  const vesselDocs = documents.filter((d) => d.vesselId === vessel.id);
  const vesselEvents = calendarEvents.filter((e) => e.vesselId === vessel.id);
  const engineHourLogs = getEngineHourLogsForVessel(vessel.id);

  const activeTasks = vesselTasks.filter((t) => t.status !== "completed");
  const openIssues = vesselIssues.filter((i) => i.status !== "completed");
  const pendingSupplies = vesselSupplies.filter(
    (s) => s.status !== "received" && s.status !== "denied",
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceOne }]}>
      <Stack.Screen options={{ title: vessel.name }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        {...scrollProps}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          {vessel.image ? (
            <Image source={vessel.image} style={styles.vesselImage} />
          ) : (
            <View
              style={[styles.iconCircle, { backgroundColor: colors.text + "20" }]}
            >
              <IconSymbol
                ios_icon_name="sailboat.fill"
                android_material_icon_name="sailing"
                size={40}
                color={colors.text}
              />
            </View>
          )}
          <Text style={styles.title}>{vessel.name}</Text>
          <Text style={styles.subtitle}>{vessel.location}</Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    (vessel.status === "active"
                      ? colors.success
                      : colors.warning) + "30",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      vessel.status === "active"
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                {vessel.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Engine Hours */}
        <View style={styles.engineHoursSection}>
          <View style={styles.engineHoursHeader}>
            <View>
              <Text style={styles.engineHoursLabel}>Engine Hours</Text>
              <Text style={styles.engineHoursValue}>
                {(vessel.engineHours || 0).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.updateHoursButton}
              onPress={() =>
                router.push({
                  pathname: "/operation-update-engine-hours",
                  params: { vesselId: vessel.id },
                })
              }
            >
              <Text style={styles.updateHoursButtonText}>Update Hours</Text>
            </TouchableOpacity>
          </View>
          {engineHourLogs.length > 0 && (
            <View style={styles.engineLogList}>
              {engineHourLogs.slice(0, 5).map((log) => (
                <View key={log.id} style={styles.engineLogRow}>
                  <Text style={styles.engineLogHours}>
                    {log.newHours.toLocaleString()} hrs
                  </Text>
                  <Text style={styles.engineLogMeta}>
                    {log.updatedByName} {"\u00B7"} {formatDate(log.timestamp)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.listArea}>
          {openIssues.length > 0 && (
            <View>
              <CollapsibleSectionHeader
                title="Open Issues"
                count={openIssues.length}
                collapsed={collapsedSections.has("Open Issues")}
                onToggle={() => toggleSection("Open Issues")}
              />
              {!collapsedSections.has("Open Issues") &&
                openIssues.map((issue, index) => (
                  <ListItemCard
                    key={issue.id}
                    title={issue.title}
                    description={issue.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-issue",
                        params: { id: issue.id },
                      })
                    }
                    isLast={index === openIssues.length - 1}
                    icon={{
                      iosName: "exclamationmark.triangle.fill",
                      androidName: "report-problem",
                    }}
                    badge={{
                      label:
                        issue.priority.charAt(0).toUpperCase() +
                        issue.priority.slice(1),
                      fg: getPriorityBadgeColors(issue.priority).fg,
                      bg: getPriorityBadgeColors(issue.priority).bg,
                    }}
                    metaText={formatDate(issue.createdAt)}
                  />
                ))}
            </View>
          )}

          {vesselEvents.length > 0 && (
            <View>
              <CollapsibleSectionHeader
                title="Events"
                count={vesselEvents.length}
                collapsed={collapsedSections.has("Events")}
                onToggle={() => toggleSection("Events")}
              />
              {!collapsedSections.has("Events") &&
                vesselEvents.map((event, index) => (
                  <ListItemCard
                    key={event.id}
                    title={event.title}
                    description={event.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-calendar-event",
                        params: { eventId: event.id },
                      })
                    }
                    isLast={index === vesselEvents.length - 1}
                    icon={{ iosName: "calendar", androidName: "event" }}
                    badge={{
                      label: getEventTypeLabel(event.type),
                      fg: colors.textSecondary,
                      bg: colors.surfaceThree,
                    }}
                    metaText={formatEventDateRange(
                      event.startDate,
                      event.endDate,
                      event.allDay,
                    )}
                    secondaryMetaText={event.location || undefined}
                  />
                ))}
            </View>
          )}

          {activeTasks.length > 0 && (
            <View>
              <CollapsibleSectionHeader
                title="Maintenance"
                count={activeTasks.length}
                collapsed={collapsedSections.has("Maintenance")}
                onToggle={() => toggleSection("Maintenance")}
              />
              {!collapsedSections.has("Maintenance") &&
                activeTasks.map((task, index) => (
                  <ListItemCard
                    key={task.id}
                    title={`${task.title}${task.estimatedCost != null ? ` - $${task.estimatedCost}` : ""}`}
                    description={task.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-maintenance",
                        params: { id: task.id },
                      })
                    }
                    isLast={index === activeTasks.length - 1}
                    icon={{
                      iosName: "wrench.and.screwdriver.fill",
                      androidName: "build",
                    }}
                    badge={{
                      label:
                        task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1),
                      fg: getPriorityBadgeColors(task.priority).fg,
                      bg: getPriorityBadgeColors(task.priority).bg,
                    }}
                    metaText={formatDueDate(task.dueDate)}
                  />
                ))}
            </View>
          )}

          {pendingSupplies.length > 0 && (
            <View>
              <CollapsibleSectionHeader
                title="Supplies"
                count={pendingSupplies.length}
                collapsed={collapsedSections.has("Supplies")}
                onToggle={() => toggleSection("Supplies")}
              />
              {!collapsedSections.has("Supplies") &&
                pendingSupplies.map((req, index) => (
                  <ListItemCard
                    key={req.id}
                    title={`${req.itemName} - $${req.estimatedCost}`}
                    description={req.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-supply",
                        params: { id: req.id },
                      })
                    }
                    isLast={index === pendingSupplies.length - 1}
                    icon={{
                      iosName: "shippingbox",
                      androidName: "inventory-2",
                    }}
                    badge={{
                      label:
                        req.priority.charAt(0).toUpperCase() +
                        req.priority.slice(1),
                      fg: getPriorityBadgeColors(req.priority).fg,
                      bg: getPriorityBadgeColors(req.priority).bg,
                    }}
                    metaText={formatDate(req.createdAt)}
                  />
                ))}
            </View>
          )}

          {vesselDocs.length > 0 && (
            <View>
              <CollapsibleSectionHeader
                title="Documents"
                count={vesselDocs.length}
                collapsed={collapsedSections.has("Documents")}
                onToggle={() => toggleSection("Documents")}
              />
              {!collapsedSections.has("Documents") &&
                vesselDocs.map((doc, index) => (
                  <ListItemCard
                    key={doc.id}
                    title={doc.title}
                    description={doc.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-document",
                        params: { id: doc.id },
                      })
                    }
                    isLast={index === vesselDocs.length - 1}
                    icon={{
                      iosName: "doc.text.fill",
                      androidName: "description",
                    }}
                    badge={{
                      label: formatLabel(doc.category),
                      fg: colors.textSecondary,
                      bg: colors.surfaceThree,
                    }}
                    metaText={formatDate(doc.uploadedAt)}
                  />
                ))}
            </View>
          )}

          <View style={{ height: insets.bottom }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  scrollContent: { paddingBottom: 0 },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  vesselImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  badges: { flexDirection: "row", gap: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  listArea: {},
  engineHoursSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.container,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  engineHoursHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  engineHoursLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 4,
  },
  engineHoursValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  updateHoursButton: {
    backgroundColor: colors.accent + "20",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateHoursButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
  engineLogList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceThree,
    paddingTop: 12,
    gap: 8,
  },
  engineLogRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  engineLogHours: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  engineLogMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
