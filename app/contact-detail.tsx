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
import { formatLabel } from "../utils/formatLabel";
import { scrollProps } from "../hooks/useTopPadding";

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { contacts, deleteContact } = useData();

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return <DetailNotFound title="Contact Not Found" />;
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteContact(contact.id);
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
          title: "Contact Details",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={[ds.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{contact.name}</Text>
        </View>

        <DetailRow label="Role" inline value={contact.role} />
        <DetailRow
          label="Type"
          inline
          value={formatLabel(contact.contactType)}
        />
        <DetailRow label="Phone" inline value={contact.phone} />
        <DetailRow label="Email" inline value={contact.email} />
        {contact.company ? (
          <DetailRow label="Company" inline value={contact.company} />
        ) : null}
        <DetailRow
          label="Vessels"
          inline
          value={
            contact.vesselNames.length > 0
              ? contact.vesselNames.join(", ")
              : "None"
          }
        />
        <DetailRow
          label="Notes"
          value={contact.notes || "No notes"}
        />

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
