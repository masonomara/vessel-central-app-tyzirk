import { useState, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { IconSymbol } from "../components/IconSymbol";
import { ListItemCard } from "../components/ListItemCard";
import { CollapsibleSectionHeader } from "../components/CollapsibleSectionHeader";
import { DetailRow } from "../components/DetailRow";
import { VesselAnalyticsSection } from "../components/VesselAnalyticsSection";
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
      <Stack.Screen options={{ title: "", headerTransparent: true, headerTintColor: "#fff" }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          {vessel.image ? (
            <Image source={vessel.image} style={styles.heroImage} />
          ) : (
            <View style={styles.heroFallback}>
              <IconSymbol
                ios_icon_name="sailboat.fill"
                android_material_icon_name="sailing"
                size={48}
                color="#ffffff80"
              />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.heroGradient}
          />
          <View style={[styles.heroTextContainer, { paddingBottom: 20, paddingTop: insets.top + 60 }]}>
            <Text style={styles.heroTitle}>{vessel.name}</Text>
            <Text style={styles.heroSubtitle}>{vessel.location}</Text>
          </View>
        </View>

        <DetailRow
          label="Engine Hours"
          inline
          button={{
            label: "Update Hours",
            onPress: () =>
              router.push({
                pathname: "/operation-update-engine-hours",
                params: { vesselId: vessel.id },
              }),
            color: colors.text,
          }}
        />
        {engineHourLogs.length > 0 && (
          <DetailRow
            label="Last Engine Update"
            value={`${engineHourLogs[0].newHours.toLocaleString()} hours by ${engineHourLogs[0].updatedByName} ${formatDate(engineHourLogs[0].timestamp)}`}
          />
        )}

        <View style={styles.sectionDivider} />
        <VesselAnalyticsSection vesselId={vessel.id} />

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
                    isFirst={index === 0}
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
                    isFirst={index === 0}
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
                    isFirst={index === 0}
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
                    isFirst={index === 0}
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
                    isFirst={index === 0}
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
  heroSection: {
    position: "relative",
    marginBottom:0,
  },
  heroImage: {
    width: "100%",
    height: 360,
  },
  heroFallback: {
    width: "100%",
    height: 360,
    backgroundColor: colors.surfaceThree,
    alignItems: "center",
    justifyContent: "center",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  heroTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.92)",
  },
  listArea: {},
  sectionDivider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginBottom: 16,
  },
});
