import React from "react";
import {
  View,
  Text,
  ScrollView,
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
import { DetailCellPair } from "../components/DetailCellPair";
import { DetailNotFound } from "../components/DetailNotFound";
import { formatLabel } from "../utils/formatting";
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
        style={{ flex: 1 }}
        contentContainerStyle={[ds.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={ds.titleSection}>
          <Text style={ds.title}>{contact.name}</Text>
        </View>

        <DetailCellPair
          items={[
            {
              label: "Vessel",
              value: contact.vesselNames.length > 0 ? contact.vesselNames[0] : "None",
              icon: {
                ios_icon_name: "sailboat.fill",
                android_material_icon_name: "directions-boat",
              },
            },
            {
              label: "Company",
              value: contact.company || "N/A",
              icon: {
                ios_icon_name: "building.2.fill",
                android_material_icon_name: "business",
              },
            },
          ]}
        />

        <DetailRow label="Role" inline value={contact.role} />
        <DetailRow
          label="Type"
          inline
          value={formatLabel(contact.contactType)}
        />
        <DetailRow label="Phone" inline value={contact.phone} />
        <DetailRow label="Email" inline value={contact.email} />
        {contact.notes && <DetailRow label="Notes" value={contact.notes} />}

        <DetailRow
          label="Delete"
          button={{
            label: "Delete Contact",
            onPress: handleDelete,
            variant: "danger",
          }}
        />
      </ScrollView>
    </View>
  );
}

