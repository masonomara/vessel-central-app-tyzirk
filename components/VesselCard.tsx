import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { IconSymbol } from "./IconSymbol";
import { colors } from "../styles/commonStyles";
import type { Vessel } from "../types";

interface VesselCardProps {
  vessel: Vessel;
  onPress: () => void;
}

export const VesselCard = React.memo(function VesselCard({
  vessel,
  onPress,
}: VesselCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {vessel.image ? (
        <Image source={vessel.image} style={styles.image} />
      ) : (
        <View style={styles.iconFallback}>
          <IconSymbol
            ios_icon_name="sailboat.fill"
            android_material_icon_name="sailing"
            size={28}
            color={colors.textSecondary}
          />
        </View>
      )}
      <View style={styles.textContent}>
        <Text style={styles.title} numberOfLines={1}>
          {vessel.name}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {vessel.location}
        </Text>
        <Text style={styles.metaText}>
          {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)}
          {` \u2022 ${vessel.crewCount} crew`}
          {vessel.engineHours ? ` \u2022 ${vessel.engineHours.toLocaleString()} engine hrs` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.container,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    padding: 0,
  },
  image: {
    width: 80,
    height: "100%",
  
    aspectRatio: 1,
  },
  iconFallback: {
    width: 80,
    alignSelf: "stretch",
  
    backgroundColor: colors.surfaceTwo,
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: 4,
  },
});
