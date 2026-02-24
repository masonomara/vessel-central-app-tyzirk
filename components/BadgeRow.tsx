/**
 * BadgeRow — Static badge chips for detail screen title sections.
 * All badge colors are resolved here. Screens pass { type, value } — never raw colors.
 *
 * BRAND BADGE PALETTE (derived from orange #C15F3C — matched saturation/brightness):
 *   red:    #C23C3C
 *   orange: #C15F3C
 *   yellow: #C2A03C
 *   blue:   #3C7FC2
 *   grey:   #6B7280
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ COLORED BADGES                                                             │
 * ├──────────────┬──────────────┬──────────────┬───────────────────────────────┤
 * │ type         │ value        │ brand color  │ hex                           │
 * ├──────────────┼──────────────┼──────────────┼───────────────────────────────┤
 * │ alert        │ important    │ red          │ #C23C3C                       │
 * │ alert        │ expired      │ red          │ #C23C3C                       │
 * ├──────────────┼──────────────┼──────────────┼───────────────────────────────┤
 * │ priority     │ urgent       │ red          │ #C23C3C                       │
 * │ priority     │ high         │ red          │ #C23C3C                       │
 * │ priority     │ medium       │ blue         │ #3C7FC2                       │
 * │ priority     │ low          │ yellow       │ #C2A03C                       │
 * ├──────────────┼──────────────┼──────────────┼───────────────────────────────┤
 * │ supplyStatus │ pending      │ blue         │ #3C7FC2                       │
 * │ supplyStatus │ approved     │ blue         │ #3C7FC2                       │
 * │ supplyStatus │ ordered      │ blue         │ #3C7FC2                       │
 * │ supplyStatus │ received     │ blue         │ #3C7FC2                       │
 * │ supplyStatus │ denied       │ red          │ #C23C3C                       │
 * └──────────────┴──────────────┴──────────────┴───────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ NEUTRAL BADGES (no semantic color — always grey #6B7280)                   │
 * ├──────────────┬─────────────────────────────────────────────────────────────┤
 * │ type         │ examples                                                    │
 * ├──────────────┼─────────────────────────────────────────────────────────────┤
 * │ category     │ issue category (Structural, Electrical, ...)               │
 * │ category     │ document category (Safety, Compliance, ...)                │
 * │ category     │ calendar event type (Maintenance, Charter, ...)            │
 * └──────────────┴─────────────────────────────────────────────────────────────┘
 *
 * RENDER ORDER (auto-sorted): alert → priority → everything else
 *
 * SCREEN USAGE:
 * - maintenance-detail:    priority
 * - issue-detail:          priority + category
 * - supply-detail:         supplyStatus + priority
 * - document-detail:       alert(important) + alert(expired) + category
 * - calendar-event-detail: category
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const badgeColors = {
  red: "#C23C3C",
  orange: "#C15F3C",
  yellow: "#C2A03C",
  blue: "#3C7FC2",
  grey: "#6B7280",
};

interface BadgeConfig {
  type: "priority" | "supplyStatus" | "category" | "alert";
  value: string;
  label?: string;
}

interface BadgeRowProps {
  badges: BadgeConfig[];
}

function resolveColor(type: BadgeConfig["type"], value: string): string {
  switch (type) {
    case "alert":
      return badgeColors.red;
    case "priority":
      if (value === "urgent" || value === "high") return badgeColors.red;
      if (value === "medium") return badgeColors.blue;
      if (value === "low") return badgeColors.yellow;
      return badgeColors.grey;
    case "supplyStatus":
      if (value === "denied") return badgeColors.red;
      return badgeColors.blue;
    case "category":
      return badgeColors.grey;
    default:
      return badgeColors.grey;
  }
}

function resolveLabel(value: string, label?: string): string {
  if (label) return label;
  return value.toUpperCase();
}

const typeOrder: Record<BadgeConfig["type"], number> = {
  alert: 0,
  priority: 1,
  supplyStatus: 2,
  category: 3,
};

export function BadgeRow({ badges }: BadgeRowProps) {
  if (badges.length === 0) return null;

  const sorted = [...badges].sort(
    (a, b) => typeOrder[a.type] - typeOrder[b.type],
  );

  return (
    <View style={styles.row}>
      {sorted.map((badge, i) => {
        const color = resolveColor(badge.type, badge.value);
        const label = resolveLabel(badge.value, badge.label);
        return (
          <View
            key={i}
            style={[styles.badge, { backgroundColor: color + "20" }]}
          >
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  badge: {
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 24,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
