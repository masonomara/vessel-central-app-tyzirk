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
import { PriorityDetailRow } from "../components/PriorityDetailRow";
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate, isOverdue, formatLabel, formatFileSize } from "../utils/formatting";
import { openDocument } from "../utils/imageUtils";
import { scrollProps } from "../hooks/useTopPadding";

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { documents, addDocumentComment } = useData();
  const { userId, userName, userRole } = useAuth();
  const [commentText, setCommentText] = useState("");

  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return <DetailNotFound title="Document Not Found" />;
  }

  const isExpired = doc.expiryDate
    ? isOverdue(new Date(doc.expiryDate))
    : false;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!userId || !userName) return;
    addDocumentComment(doc.id, {
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
          title: "Document Details",
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
          <Text style={ds.title}>{doc.title}</Text>
        </View>

        <PriorityDetailRow
          items={[
            {
              label: "Vessel",
              value: doc.vesselName,
              icon: {
                ios_icon_name: "sailboat.fill",
                android_material_icon_name: "directions-boat",
              },
              linkTo: {
                pathname: "/vessel-detail",
                params: { id: doc.vesselId },
              },
            },
            {
              label: "Uploaded By",
              value: doc.uploadedByName,
              icon: {
                ios_icon_name: "person.fill",
                android_material_icon_name: "person",
              },
            },
          ]}
        />
        <TouchableOpacity
          style={styles.previewSection}
          onPress={() => openDocument(doc.fileUri, doc.fileType)}
          activeOpacity={0.7}
        >
          <View style={styles.previewPlaceholder}>
            <IconSymbol
              ios_icon_name="doc.fill"
              android_material_icon_name="description"
              size={40}
              color={colors.textTertiary}
            />
            <Text style={styles.previewText}>View {doc.title}</Text>
            <Text style={styles.previewSubtext}>
              {doc.fileName} ({formatFileSize(doc.fileSize)})
            </Text>
          </View>
        </TouchableOpacity>

        <DetailRow label="Category" inline value={formatLabel(doc.category)} />
        {doc.expiryDate ? (
          <DetailRow
            label="Expires"
            inline
            value={formatDate(new Date(doc.expiryDate))}
            valueColor={isExpired ? colors.danger : undefined}
          />
        ) : null}

        {doc.description ? (
          <DetailRow label="Description" value={doc.description} />
        ) : null}

        {doc.tags.length > 0 ? (
          <View style={styles.tagSection}>
            <Text style={styles.tagLabel}>Tags</Text>
            <View style={styles.tagRow}>
              {doc.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
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
                {doc.uploadedByName} uploaded this document
              </Text>
              <Text style={styles.commentDate}>
                {formatDate(new Date(doc.uploadedAt))}
              </Text>
            </View>
          </View>

          {(doc.comments || []).map((comment) => (
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
  previewSection: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  previewPlaceholder: {
    height: 180,
    backgroundColor: colors.surfaceTwo,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  previewText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  previewSubtext: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  tagSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  tagLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { fontSize: 13, color: colors.textSecondary },
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
