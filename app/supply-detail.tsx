import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import {
  commonStyles,
  colors,
  detailScreenStyles as ds,
} from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { DetailRow } from "../components/DetailRow";
import { BadgeRow } from "../components/BadgeRow";
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate } from "../utils/dateUtils";
import { useTopPadding } from "../hooks/useTopPadding";

export default function SupplyDetailScreen() {
  const topPadding = useTopPadding();
  const { id } = useLocalSearchParams();
  const {
    supplyRequests,
    approveSupplyRequest,
    denySupplyRequest,
    updateSupplyRequest,
  } = useData();
  const { userRole, userId, userName } = useAuth();

  const request = supplyRequests.find((r) => r.id === id);

  if (!request) {
    return <DetailNotFound title="Request Not Found" />;
  }

  const handleApprove = () => {
    if (!userId || !userName) return;
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
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Supply Detail",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{request.itemName}</Text>
          <BadgeRow
            badges={[
              { type: "supplyStatus", value: request.status },
              { type: "priority", value: request.priority },
            ]}
          />
        </View>

        <DetailRow label="Description" value={request.description} />
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
        <DetailRow
          label="Vessel"
          value={request.vesselName}
          linkTo={{
            pathname: "/vessel-detail",
            params: { id: request.vesselId },
          }}
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

        {request.notes ? (
          <DetailRow label="Notes" value={request.notes} />
        ) : null}

        {(userRole === "owner" || userRole === "manager") &&
          request.status === "pending" && (
            <>
              <DetailRow
                label="Approval"
                button={{
                  label: "Approve",
                  onPress: handleApprove,
                  color: colors.success,
                }}
              />
              <DetailRow
                label="Approval"
                button={{
                  label: "Deny",
                  onPress: handleDeny,
                  color: colors.danger,
                }}
              />
            </>
          )}

        {(userRole === "owner" || userRole === "manager") &&
          request.status === "approved" && (
            <DetailRow
              label="Fulfillment"
              button={{
                label: "Mark as Ordered",
                onPress: () => {
                  updateSupplyRequest(request.id, { status: "ordered" });
                  Alert.alert("Updated", "Supply request marked as ordered.");
                },
                color: colors.text,
              }}
            />
          )}

        {(userRole === "owner" || userRole === "manager") &&
          request.status === "ordered" && (
            <DetailRow
              label="Fulfillment"
              button={{
                label: "Mark as Received",
                onPress: () => {
                  updateSupplyRequest(request.id, { status: "received" });
                  Alert.alert("Updated", "Supply request marked as received.");
                },
                color: colors.success,
              }}
            />
          )}
      </ScrollView>
    </View>
  );
}
