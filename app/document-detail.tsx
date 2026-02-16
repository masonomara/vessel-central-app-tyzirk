import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";
import { formatDate, isOverdue } from "@/utils/dateUtils";
import { formatFileSize } from "@/utils/fileUtils";

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { documents } = useData();

  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            This document could not be found.
          </Text>
        </View>
      </View>
    );
  }

  const isExpired = doc.expiryDate
    ? isOverdue(new Date(doc.expiryDate))
    : false;

  const handleOpenFile = () => {
    Alert.alert(
      "Document Preview",
      `"${doc.fileName}" would open here in a production build.`,
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Document Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.docHeader}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <IconSymbol
              ios_icon_name="doc.fill"
              android_material_icon_name="description"
              size={32}
              color={colors.accent}
            />
          </View>
          <Text style={styles.title}>{doc.title}</Text>
          <View style={styles.badgeRow}>
            <View
              style={[styles.badge, { backgroundColor: colors.accent + "20" }]}
            >
              <Text style={[styles.badgeText, { color: colors.accent }]}>
                {doc.category.toUpperCase()}
              </Text>
            </View>
            {doc.isImportant && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.warning + "20" },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.warning }]}>
                  IMPORTANT
                </Text>
              </View>
            )}
            {isExpired && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.danger + "20" },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.danger }]}>
                  EXPIRED
                </Text>
              </View>
            )}
          </View>
        </View>

        {doc.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{doc.description}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <DetailRow label="File Name" value={doc.fileName} />
          <DetailRow label="File Size" value={formatFileSize(doc.fileSize)} />
          <DetailRow label="File Type" value={doc.fileType.toUpperCase()} />
          <DetailRow label="Vessel" value={doc.vesselName} />
          <DetailRow label="Uploaded By" value={doc.uploadedByName} />
          <DetailRow
            label="Uploaded"
            value={formatDate(new Date(doc.uploadedAt))}
          />
          {doc.expiryDate ? (
            <DetailRow
              label="Expires"
              value={formatDate(new Date(doc.expiryDate))}
              valueColor={isExpired ? colors.danger : colors.text}
            />
          ) : null}
        </View>

        {doc.tags.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {doc.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <TouchableOpacity style={styles.openButton} onPress={handleOpenFile}>
          <IconSymbol
            ios_icon_name="doc.text"
            android_material_icon_name="description"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.openButtonText}>Open Document</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          valueColor ? { color: valueColor } : undefined,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  docHeader: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  detailLabel: { fontSize: 14, color: colors.textMuted, flex: 1 },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: colors.secondary + "40",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { fontSize: 13, color: colors.textSecondary },
  openButton: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  openButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
