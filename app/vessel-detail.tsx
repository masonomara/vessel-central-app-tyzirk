import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { colors } from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { IconSymbol } from "../components/IconSymbol";
import { StatCard } from "../components/StatCard";
import { PressableCard } from "../components/PressableCard";
import { useTopPadding } from "../hooks/useTopPadding";

export default function VesselDetailScreen() {
  const topPadding = useTopPadding();
  const { id } = useLocalSearchParams();
  const { vessels, maintenanceTasks, issues, supplyRequests, documents } =
    useData();

  const vessel = vessels.find((v) => v.id === id);

  if (!vessel) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceTwo }]}>
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

  const activeTasks = vesselTasks.filter((t) => t.status !== "completed");
  const openIssues = vesselIssues.filter((i) => i.status !== "completed");
  const pendingSupplies = vesselSupplies.filter((s) => s.status === "pending");

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceTwo }]}>
      <Stack.Screen options={{ title: vessel.name }} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <IconSymbol
              ios_icon_name="sailboat.fill"
              android_material_icon_name="sailing"
              size={40}
              color={colors.accent}
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

        <View style={styles.statsRow}>
          <StatCard
            icon="wrench.fill"
            androidIcon="build"
            iconColor={colors.accent}
            label="Tasks"
            value={vesselTasks.length}
          />
          <StatCard
            icon="exclamationmark.triangle.fill"
            androidIcon="warning"
            iconColor={colors.warning}
            label="Issues"
            value={vesselIssues.length}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon="shippingbox.fill"
            androidIcon="inventory"
            iconColor={colors.success}
            label="Supplies"
            value={vesselSupplies.length}
          />
          <StatCard
            icon="doc.fill"
            androidIcon="description"
            iconColor={colors.textSecondary}
            label="Docs"
            value={vesselDocs.length}
          />
        </View>

        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tasks</Text>
            {activeTasks.slice(0, 5).map((task) => (
              <PressableCard
                key={task.id}
                style={styles.listCard}
                onPress={() =>
                  router.push({
                    pathname: "/maintenance-detail",
                    params: { id: task.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{task.title}</Text>
                  <Text style={styles.listSubtext}>
                    {task.status.replace("_", " ")} · {task.priority}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </PressableCard>
            ))}
          </View>
        )}

        {openIssues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open Issues</Text>
            {openIssues.slice(0, 5).map((issue) => (
              <PressableCard
                key={issue.id}
                style={styles.listCard}
                onPress={() =>
                  router.push({
                    pathname: "/issue-detail",
                    params: { id: issue.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{issue.title}</Text>
                  <Text style={styles.listSubtext}>{issue.priority}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </PressableCard>
            ))}
          </View>
        )}

        {pendingSupplies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Supplies</Text>
            {pendingSupplies.slice(0, 5).map((req) => (
              <PressableCard
                key={req.id}
                style={styles.listCard}
                onPress={() =>
                  router.push({
                    pathname: "/supply-detail",
                    params: { id: req.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{req.itemName}</Text>
                  <Text style={styles.listSubtext}>
                    ${req.estimatedCost} · {req.status}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </PressableCard>
            ))}
          </View>
        )}

        {vesselDocs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {vesselDocs.slice(0, 5).map((doc) => (
              <PressableCard
                key={doc.id}
                style={styles.listCard}
                onPress={() =>
                  router.push({
                    pathname: "/document-detail",
                    params: { id: doc.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{doc.title}</Text>
                  <Text style={styles.listSubtext}>{doc.category}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </PressableCard>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  titleSection: { alignItems: "center", marginBottom: 24 },
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
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  listCard: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  listCardContent: { flex: 1 },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  listSubtext: { fontSize: 13, color: colors.textSecondary },
});
