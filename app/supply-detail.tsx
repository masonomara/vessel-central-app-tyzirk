import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import {
  commonStyles,
  colors,
  detailScreenStyles as ds,
} from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { IconSymbol } from "../components/IconSymbol";
import { DetailRow } from "../components/DetailRow";
import { DropdownRow } from "../components/DropdownRow";
import { PriorityDetailRow } from "../components/PriorityDetailRow";
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate } from "../utils/dateUtils";
import { TaskPriority } from "../types";
import { useTopPadding } from "../hooks/useTopPadding";

export default function SupplyDetailScreen() {
  const topPadding = useTopPadding();
  const { id } = useLocalSearchParams();
  const {
    supplyRequests,
    approveSupplyRequest,
    denySupplyRequest,
    updateSupplyRequest,
    addSupplyComment,
  } = useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState("");

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
          addSupplyComment(request.id, {
            userId,
            userName,
            userRole,
            text: `${userName} approved this request`,
            attachments: [],
          });
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
          addSupplyComment(request.id, {
            userId,
            userName,
            userRole,
            text: `${userName} denied this request`,
            attachments: [],
          });
        },
      },
    ]);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!userId || !userName) return;
    addSupplyComment(request.id, {
      userId,
      userName,
      userRole,
      text: commentText.trim(),
      attachments: [],
    });
    setCommentText("");
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Supply Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[
          ds.scrollContent,
          { paddingTop: topPadding, flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{request.itemName}</Text>
        </View>

        <PriorityDetailRow
          items={[
            {
              label: "Vessel",
              value: request.vesselName,
              icon: {
                ios_icon_name: "sailboat.fill",
                android_material_icon_name: "directions-boat",
              },
              linkTo: {
                pathname: "/vessel-detail",
                params: { id: request.vesselId },
              },
            },
            {
              label: "Requested By",
              value: request.requestedByName,
              icon: {
                ios_icon_name: "person.fill",
                android_material_icon_name: "person",
              },
            },
          ]}
        />

        <DropdownRow
          label="Priority"
          options={[
            { label: "Urgent", value: "urgent" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
          selectedValue={request.priority}
          onSelect={(value) =>
            updateSupplyRequest(request.id, {
              priority: value as TaskPriority,
            })
          }
        />
        <DropdownRow
          label="Status"
          options={[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Ordered", value: "ordered" },
            { label: "Received", value: "received" },
            { label: "Denied", value: "denied" },
          ]}
          selectedValue={request.status}
          onSelect={(value) =>
            updateSupplyRequest(request.id, { status: value as any })
          }
        />

        <DetailRow
          label="Quantity"
          inline
          value={`${request.quantity} ${request.unit}`}
        />
        <DetailRow
          label="Estimated Cost"
          inline
          value={`$${request.estimatedCost.toFixed(2)}`}
        />
        {request.actualCost != null && (
          <DetailRow
            label="Actual Cost"
            inline
            value={`$${request.actualCost.toFixed(2)}`}
          />
        )}
        <DetailRow label="Category" inline value={request.category} />
        {request.vendor ? (
          <DetailRow label="Vendor" inline value={request.vendor} />
        ) : null}

        <DetailRow label="Description" value={request.description} />
        {request.notes ? (
          <DetailRow label="Notes" value={request.notes} />
        ) : null}

        {(userRole === "owner" || userRole === "manager") &&
          request.status === "pending" && (
            <>
              <DetailRow
                button={{
                  label: "Approve",
                  onPress: handleApprove,
                  color: colors.success,
                }}
              />
              <DetailRow
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
              button={{
                label: "Mark as Ordered",
                onPress: () => {
                  updateSupplyRequest(request.id, { status: "ordered" });
                  addSupplyComment(request.id, {
                    userId,
                    userName,
                    userRole,
                    text: `${userName} marked as ordered`,
                    attachments: [],
                  });
                },
                color: colors.text,
              }}
            />
          )}

        {(userRole === "owner" || userRole === "manager") &&
          request.status === "ordered" && (
            <DetailRow
              button={{
                label: "Mark as Received",
                onPress: () => {
                  updateSupplyRequest(request.id, { status: "received" });
                  addSupplyComment(request.id, {
                    userId,
                    userName,
                    userRole,
                    text: `${userName} marked as received`,
                    attachments: [],
                  });
                },
                color: colors.success,
              }}
            />
          )}

        <View style={styles.historySection}>
          <View style={styles.commentCard}>
            <View style={styles.commentIcon}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={15}
                color={colors.text}
              />
            </View>
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>
                {request.requestedByName} created this request
              </Text>
              <Text style={styles.commentDate}>
                {formatDate(new Date(request.createdAt))}
              </Text>
            </View>
          </View>

          {(request.comments || []).map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentIcon}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={15}
                  color={colors.text}
                />
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{comment.userName}</Text>
                <Text style={styles.commentDate}>
                  {formatDate(new Date(comment.createdAt))}
                </Text>
                <Text style={styles.commentBody}>{comment.text}</Text>
              </View>
            </View>
          ))}

          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !commentText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <IconSymbol
                ios_icon_name="arrow.up.circle.fill"
                android_material_icon_name="send"
                size={20}
                color={colors.container}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  historySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginTop: 8,
    backgroundColor: colors.surfaceOne,
    borderTopWidth: 1,
    borderColor: colors.borderSoft,
    flex: 1,
  },
  commentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 24,
  },
  commentIcon: {
    padding: 6,
    marginTop: 4.5,
    backgroundColor: colors.surfaceThree,
    borderRadius: 100,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    lineHeight: 20,
  },
  commentDate: { fontSize: 12, color: colors.textTertiary, lineHeight: 15 },
  commentBody: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 19,
    marginTop: 4,
  },
  commentInput: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
    marginTop: "auto",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    padding: 6,
    backgroundColor: colors.text,
    borderRadius: 8,
  },
  sendButtonDisabled: { opacity: 0.5 },
});
