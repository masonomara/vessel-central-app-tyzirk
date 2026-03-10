import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
  commonStyles,
  colors,
  detailScreenStyles as ds,
} from "../styles/commonStyles";
import { useData } from "../contexts/DataContext";
import { DetailRow } from "../components/DetailRow";
import { DetailNotFound } from "../components/DetailNotFound";
import { formatDate } from "../utils/dateUtils";
import { CertificationStatus } from "../types";
import { scrollProps } from "../hooks/useTopPadding";

function getCertStatus(expiryDate: Date): CertificationStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "expired";
  if (diffDays < 30) return "expiring_soon";
  return "valid";
}

function getStatusDisplay(status: CertificationStatus): {
  fg: string;
  bg: string;
  label: string;
} {
  switch (status) {
    case "expired":
      return {
        fg: colors.redForeground,
        bg: colors.redBackground,
        label: "Expired",
      };
    case "expiring_soon":
      return {
        fg: colors.orangeForeground,
        bg: colors.orangeBackground,
        label: "Expiring Soon",
      };
    case "valid":
      return {
        fg: colors.greenForeground,
        bg: colors.greenBackground,
        label: "Valid",
      };
  }
}

export default function CertificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { certifications, deleteCertification } = useData();

  const cert = certifications.find((c) => c.id === id);

  if (!cert) {
    return <DetailNotFound title="Certification Not Found" />;
  }

  const status = getCertStatus(cert.expiryDate);
  const statusDisplay = getStatusDisplay(status);

  const handleDelete = () => {
    Alert.alert(
      "Delete Certification",
      `Are you sure you want to delete this ${cert.certType} certification?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCertification(cert.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: "Certification Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{cert.certType}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusDisplay.bg },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: statusDisplay.fg }]}>
              {statusDisplay.label}
            </Text>
          </View>
        </View>

        <DetailRow label="Crew Member" inline value={cert.crewName} />
        <DetailRow
          label="Issuing Authority"
          inline
          value={cert.issuingAuthority}
        />
        {cert.certificateNumber ? (
          <DetailRow
            label="Certificate Number"
            inline
            value={cert.certificateNumber}
          />
        ) : null}
        <DetailRow
          label="Issue Date"
          inline
          value={formatDate(new Date(cert.issueDate))}
        />
        <DetailRow
          label="Expiry Date"
          inline
          value={formatDate(new Date(cert.expiryDate))}
        />
        <DetailRow label="Vessel" inline value={cert.vesselName} />
        <DetailRow label="Notes" value={cert.notes || "No notes"} />

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Certification</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
