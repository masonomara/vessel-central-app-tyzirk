import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/IconSymbol";
import { LinkedDetailRow } from "@/components/LinkedDetailRow";
import { formatDate } from "@/utils/dateUtils";
import { SupplyRequestStatus, TaskPriority } from "@/types";

export default function SupplyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { supplyRequests, approveSupplyRequest, denySupplyRequest } = useData();
  const { userRole, userId, userName } = useAuth();

  const request = supplyRequests.find((r) => r.id === id);

  if (!request) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Request Not Found' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            This supply request could not be found.
          </Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: SupplyRequestStatus) => {
    switch (status) {
      case "approved":
        return colors.success;
      case "ordered":
        return colors.accent;
      case "received":
        return colors.success;
      case "denied":
        return colors.danger;
      case "pending":
        return colors.warning;
      default:
        return colors.grey;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return colors.danger;
      case "high":
        return colors.warning;
      case "medium":
        return colors.accent;
      case "low":
        return colors.success;
      default:
        return colors.grey;
    }
  };

  const handleApprove = () => {
    Alert.alert("Approve Request", `Approve "${request.itemName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          approveSupplyRequest(request.id, userId, userName);
          Alert.alert("Approved", "Supply request has been approved.");
          router.back();
        },
      },
    ]);
  };

  const handleDeny = () => {
    Alert.alert("Deny Request", `Deny "${request.itemName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deny",
        style: "destructive",
        onPress: () => {
          denySupplyRequest(request.id, "Not approved at this time");
          Alert.alert("Denied", "Supply request has been denied.");
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Supply Request' }} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>{request.itemName}</Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor(request.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getStatusColor(request.status) },
              ]}
            >
              {request.status.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: getPriorityColor(request.priority) + "20" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getPriorityColor(request.priority) },
              ]}
            >
              {request.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{request.description}</Text>
        </View>

        <View style={styles.card}>
          <DetailRow
            label="Quantity"
            value={`${request.quantity} ${request.unit}`}
          />
          <DetailRow
            label="Estimated Cost"
            value={`$${request.estimatedCost.toFixed(2)}`}
          />
          {request.actualCost != null && (
            <DetailRow
              label="Actual Cost"
              value={`$${request.actualCost.toFixed(2)}`}
            />
          )}
          <LinkedDetailRow
            label="Vessel"
            value={request.vesselName}
            linkTo={{ pathname: "/vessel-detail", params: { id: request.vesselId } }}
          />
          <DetailRow label="Category" value={request.category} />
          <DetailRow label="Requested By" value={request.requestedByName} />
          <DetailRow
            label="Created"
            value={formatDate(new Date(request.createdAt))}
          />
          {request.vendor ? (
            <DetailRow label="Vendor" value={request.vendor} />
          ) : null}
          {request.approvedByName ? (
            <DetailRow label="Approved By" value={request.approvedByName} />
          ) : null}
          {request.approvedAt ? (
            <DetailRow
              label="Approved On"
              value={formatDate(new Date(request.approvedAt))}
            />
          ) : null}
          {request.deniedReason ? (
            <DetailRow label="Denial Reason" value={request.deniedReason} />
          ) : null}
        </View>

        {request.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.description}>{request.notes}</Text>
          </View>
        ) : null}

        {(userRole === "owner" || userRole === "manager") &&
          request.status === "pending" && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.success },
                ]}
                onPress={handleApprove}
              >
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.danger },
                ]}
                onPress={handleDeny}
              >
                <Text style={styles.actionButtonText}>Deny</Text>
              </TouchableOpacity>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: { fontSize: 14, color: colors.textMuted },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: "500" },
  actionRow: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
