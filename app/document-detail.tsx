import React from "react";
import { StyleSheet, View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import {
  commonStyles,
  colors,
  detailScreenStyles as ds,
} from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { IconSymbol } from "../components/IconSymbol";
import { DetailRow } from "../components/DetailRow";
import { BadgeRow } from "../components/BadgeRow";
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate, isOverdue } from "../utils/dateUtils";
import { formatFileSize } from "../utils/fileUtils";
import { useTopPadding } from "../hooks/useTopPadding";

export default function DocumentDetailScreen() {
  const topPadding = useTopPadding();
  const { id } = useLocalSearchParams();
  const { documents } = useData();

  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return <DetailNotFound title="Document Not Found" />;
  }

  const isExpired = doc.expiryDate
    ? isOverdue(new Date(doc.expiryDate))
    : false;

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Document Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ds.titleSection}>
          <BadgeRow
            badges={[
              { type: "category", value: doc.category },
              ...(doc.isImportant ? [{ type: "alert" as const, value: "important" }] : []),
              ...(isExpired ? [{ type: "alert" as const, value: "expired" }] : []),
            ]}
          />
          <Text style={ds.title}>{doc.title}</Text>
        </View>

        {doc.description ? (
          <DetailRow label="Description" value={doc.description} />
        ) : null}
        <DetailRow label="File Name" value={doc.fileName} />
        <DetailRow label="File Size" value={formatFileSize(doc.fileSize)} />
        <DetailRow label="File Type" value={doc.fileType.toUpperCase()} />
        <DetailRow
          label="Vessel"
          value={doc.vesselName}
          linkTo={{ pathname: "/vessel-detail", params: { id: doc.vesselId } }}
        />
        <DetailRow label="Uploaded By" value={doc.uploadedByName} />
        <DetailRow
          label="Uploaded"
          value={formatDate(new Date(doc.uploadedAt))}
        />
        {doc.expiryDate ? (
          <DetailRow
            label="Expires"
            value={formatDate(new Date(doc.expiryDate))}
            valueColor={isExpired ? colors.danger : undefined}
          />
        ) : null}

        {doc.tags.length > 0 ? (
          <View style={ds.section}>
            <Text style={ds.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {doc.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.previewCard}>
          <View style={styles.previewIconRow}>
            <IconSymbol
              ios_icon_name="doc.text.fill"
              android_material_icon_name="picture-as-pdf"
              size={40}
              color={colors.accent}
            />
          </View>
          <Text style={styles.previewFileName}>{doc.fileName}</Text>
          <Text style={styles.previewFileType}>
            {doc.fileType.toUpperCase()} · {formatFileSize(doc.fileSize)}
          </Text>
        </View>

        <DetailRow
          label="Download"
          button={{
            label: "Download",
            onPress: () =>
              Alert.alert("Download", `"${doc.fileName}" saved to device.`),
            color: colors.accent,
          }}
        />
        <DetailRow
          label="Share"
          button={{
            label: "Share",
            onPress: () =>
              Alert.alert("Shared", `"${doc.fileName}" share sheet opened.`),
            color: colors.secondary,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: colors.secondary + "40",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { fontSize: 13, color: colors.textSecondary },
  previewCard: {
    backgroundColor: colors.surfaceOne,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  previewIconRow: {
    marginBottom: 12,
  },
  previewFileName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  previewFileType: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
