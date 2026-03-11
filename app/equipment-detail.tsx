import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
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
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate, formatLabel } from "../utils/formatting";
import { EquipmentCondition } from "../types";
import { scrollProps } from "../hooks/useTopPadding";

export default function EquipmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { equipment, updateEquipment, addEquipmentComment } = useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState("");

  const item = equipment.find((e) => e.id === id);

  if (!item) {
    return <DetailNotFound title="Equipment Not Found" />;
  }

  const handleConditionChange = (newCondition: string) => {
    updateEquipment(item.id, {
      condition: newCondition as EquipmentCondition,
    });
    addEquipmentComment(item.id, {
      userId,
      userName,
      userRole,
      text: `${userName} changed condition to ${formatLabel(newCondition)}`,
      isSystemComment: true,
      attachments: [],
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!userId || !userName) return;
    addEquipmentComment(item.id, {
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
          title: "Equipment Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{item.name}</Text>
        </View>

        <DropdownRow
          label="Condition"
          options={[
            { label: "Good", value: "good" },
            { label: "Fair", value: "fair" },
            { label: "Poor", value: "poor" },
            { label: "Needs Replacement", value: "needs_replacement" },
          ]}
          selectedValue={item.condition}
          onSelect={(value) => handleConditionChange(value)}
        />

        <DetailRow
          label="Category"
          inline
          value={formatLabel(item.category)}
        />
        <DetailRow
          label="Vessel"
          inline
          value={item.vesselName}
          linkTo={{
            pathname: "/vessel-detail",
            params: { id: item.vesselId },
          }}
        />
        <DetailRow label="Quantity" inline value={String(item.quantity)} />
        {item.serialNumber ? (
          <DetailRow label="Serial Number" inline value={item.serialNumber} />
        ) : null}
        {item.manufacturer ? (
          <DetailRow label="Manufacturer" inline value={item.manufacturer} />
        ) : null}
        {item.model ? (
          <DetailRow label="Model" inline value={item.model} />
        ) : null}
        <DetailRow label="Location" inline value={item.location} />
        {item.purchaseDate ? (
          <DetailRow
            label="Purchase Date"
            inline
            value={formatDate(item.purchaseDate)}
          />
        ) : null}
        {item.lastInspectionDate ? (
          <DetailRow
            label="Last Inspection"
            inline
            value={formatDate(item.lastInspectionDate)}
          />
        ) : null}
        {item.nextInspectionDate ? (
          <DetailRow
            label="Next Inspection"
            inline
            value={formatDate(item.nextInspectionDate)}
          />
        ) : null}
        <DetailRow label="Description" value={item.description} />
        <DetailRow label="Notes" value={item.notes || "No notes"} />

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
                {item.createdByName} added this equipment
              </Text>
              <Text style={styles.commentDate}>
                {formatDate(new Date(item.createdAt))}
              </Text>
            </View>
          </View>

          {(item.comments || []).map((comment) => (
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
