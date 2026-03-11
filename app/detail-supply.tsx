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
import { useLocalSearchParams, Stack } from "expo-router";
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
import { DetailCellPair } from "../components/DetailCellPair";
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate, formatLabel } from "../utils/formatting";
import { TaskPriority, SupplyRequestStatus } from "../types";
import { scrollProps } from "../hooks/useTopPadding";

export default function SupplyDetailScreen() {
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
            isSystemComment: true,
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
            isSystemComment: true,
            attachments: [],
          });
        },
      },
    ]);
  };

  const handlePriorityChange = (value: TaskPriority) => {
    updateSupplyRequest(request.id, { priority: value });
    addSupplyComment(request.id, {
      userId,
      userName,
      userRole,
      text: `${userName} updated priority to ${formatLabel(value)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const handleStatusChange = (value: string) => {
    updateSupplyRequest(request.id, { status: value as SupplyRequestStatus });
    addSupplyComment(request.id, {
      userId,
      userName,
      userRole,
      text: `${userName} changed status to ${formatLabel(value)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const isManagerOrOwner = userRole === "manager" || userRole === "owner";
  const needsApproval = request.status === "pending";
  const isDenied = request.status === "denied";

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
          { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{request.itemName}</Text>
        </View>

        <DetailCellPair
          items={[
            {
              label: "Vessel",
              value: request.vesselName,
              icon: {
                ios_icon_name: "sailboat.fill",
                android_material_icon_name: "directions-boat",
              },
              linkTo: {
                pathname: "/detail-vessel",
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

        {needsApproval && isManagerOrOwner && (
          <View style={styles.approvalRow}>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={handleApprove}
              activeOpacity={0.7}
            >
              {/* <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={16}
                color={colors.greenForeground}
              /> */}
              <Text style={styles.approveBtnText}>Approve Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.denyBtn}
              onPress={handleDeny}
              activeOpacity={0.7}
            >
              {/* <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={16}
                color={colors.redForeground}
              /> */}
              <Text style={styles.denyBtnText}>Deny Request</Text>
            </TouchableOpacity>
          </View>
        )}

        <DropdownRow
          label="Priority"
          options={[
            { label: "Critical", value: "critical" },
            { label: "Urgent", value: "urgent" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
            { label: "None", value: "none" },
          ]}
          selectedValue={request.priority}
          onSelect={(value) => handlePriorityChange(value as TaskPriority)}
        />

        {isDenied ? (
          <DropdownRow
            label="Status"
            options={[{ label: "Denied", value: "denied" }]}
            selectedValue="denied"
            onSelect={() => {}}
            disabled
          />
        ) : needsApproval ? (
          <DropdownRow
            label="Status"
            options={[{ label: "Pending", value: "pending" }]}
            selectedValue="pending"
            onSelect={() => {}}
            disabled
          />
        ) : (
          <DropdownRow
            label="Status"
            options={[
              { label: "Approved", value: "approved" },
              { label: "Ordered", value: "ordered" },
              { label: "Received", value: "received" },
            ]}
            selectedValue={request.status}
            onSelect={(value) => handleStatusChange(value)}
          />
        )}

        <DetailRow label="Category" inline value={request.category} />
        {request.vendor ? (
          <DetailRow label="Vendor" inline value={request.vendor} />
        ) : null}
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

        <DetailRow label="Description" value={request.description} />
        {request.notes ? (
          <DetailRow label="Notes" value={request.notes} />
        ) : null}

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
                <Text style={styles.commentAuthor}>
                  {comment.isSystemComment ? comment.text : comment.userName}
                </Text>
                <Text style={styles.commentDate}>
                  {formatDate(new Date(comment.createdAt))}
                </Text>
                {!comment.isSystemComment && (
                  <Text style={styles.commentBody}>{comment.text}</Text>
                )}
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
  approvalRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.greenForeground,
  },
  approveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.container,
  },
  denyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.redForeground,
  },
  denyBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.container,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surfaceTwo,
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
    backgroundColor: colors.container,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: { padding: 6, backgroundColor: colors.text, borderRadius: 8 },
  sendButtonDisabled: { opacity: 0.5 },
});
