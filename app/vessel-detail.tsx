import { useState, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { colors } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { IconSymbol } from "../components/IconSymbol";
import { ItemCard } from "../components/ItemCard";
import { CollapsibleSectionHeader } from "../components/CollapsibleSectionHeader";
import { scrollProps } from "../hooks/useTopPadding";
import { formatDate, formatDueDate } from "../utils/dateUtils";
import {
  formatEventDateRange,
  getEventTypeLabel,
} from "../utils/calendarUtils";
import { getPriorityBadgeColors } from "../utils/colorUtils";
import { formatLabel } from "../utils/formatLabel";
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
                  <ItemCard
                    key={issue.id}
                    title={issue.title}
                    description={issue.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/issue-detail",
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
                  <ItemCard
                    key={event.id}
                    title={event.title}
                    description={event.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/calendar-event-detail",
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
                  <ItemCard
                    key={task.id}
                    title={`${task.title}${task.estimatedCost != null ? ` - $${task.estimatedCost}` : ""}`}
                    description={task.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/maintenance-detail",
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
                  <ItemCard
                    key={req.id}
                    title={`${req.itemName} - $${req.estimatedCost}`}
                    description={req.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/supply-detail",
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
                  <ItemCard
                    key={doc.id}
                    title={doc.title}
                    description={doc.description}
                    vesselName={vessel.name}
                    onPress={() =>
                      router.push({
                        pathname: "/document-detail",
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

          <View style={{ height: insets.bottom + 64 }} />
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
});
