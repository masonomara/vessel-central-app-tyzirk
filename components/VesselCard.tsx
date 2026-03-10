import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { PressableCard } from "./PressableCard";
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
    <PressableCard style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        {vessel.image ? (
          <Image source={vessel.image} style={styles.image} />
        ) : (
          <View style={styles.iconFallback}>
            <IconSymbol
              ios_icon_name="sailboat.fill"
              android_material_icon_name="sailing"
              size={24}
              color={colors.accent}
            />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {vessel.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {vessel.location}
          </Text>
          <View style={styles.footer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    (vessel.status === "active"
                      ? colors.success
                      : colors.warning) + "30",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      vessel.status === "active"
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                {vessel.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.crewBadge}>
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="groups"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.crewText}>{vessel.crewCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </PressableCard>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  iconFallback: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  crewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  crewText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
