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
import { colors } from "../styles/commonStyles";

const badgeColors = {
  red: { fg: colors.redForeground, bg: colors.redBackground },
  orange: { fg: colors.orangeForeground, bg: colors.orangeBackground },
  yellow: { fg: colors.yellowForeground, bg: colors.yellowBackground },
  green: { fg: colors.greenForeground, bg: colors.greenBackground },
  blue: { fg: colors.blueForeground, bg: colors.blueBackground },
  purple: { fg: colors.purpleForeground, bg: colors.purpleBackground },
  grey: { fg: colors.textSecondary, bg: colors.surfaceThree },
};

interface BadgeConfig {
  type: "priority" | "supplyStatus" | "status" | "category" | "alert";
  value: string;
  label?: string;
}

interface BadgeRowProps {
  badges: BadgeConfig[];
}

const colorKeywords: [string, { fg: string; bg: string }][] = [
  // green
  ["completed", badgeColors.green],
  // red
  ["urgent", badgeColors.red],
  ["high", badgeColors.red],
  ["denied", badgeColors.red],
  ["cancelled", badgeColors.red],
  ["important", badgeColors.red],
  ["expired", badgeColors.red],
  // orange
  ["waiting", badgeColors.orange],
  // blue
  ["medium", badgeColors.orange],
  ["pending", badgeColors.blue],
  ["approved", badgeColors.blue],
  ["ordered", badgeColors.blue],
  ["received", badgeColors.blue],
  ["in progress", badgeColors.blue],
  // yellow
  ["low", badgeColors.yellow],
];

function resolveColor(value: string): { fg: string; bg: string } {
  const lower = value.toLowerCase();
  for (const [keyword, color] of colorKeywords) {
    if (lower.includes(keyword)) return color;
  }
  return badgeColors.grey;
}

function resolveLabel(value: string, label?: string): string {
  if (label) return label;
  return value.replace(/_/g, " ").toUpperCase();
}

const typeOrder: Record<BadgeConfig["type"], number> = {
  alert: 0,
  status: 1,
  priority: 2,
  supplyStatus: 3,
  category: 4,
};

export function BadgeRow({ badges }: BadgeRowProps) {
  if (badges.length === 0) return null;

  const sorted = [...badges].sort(
    (a, b) => typeOrder[a.type] - typeOrder[b.type],
  );

  return (
    <View style={styles.row}>
      {sorted.map((badge, i) => {
        const { fg, bg } = resolveColor(badge.value);
        const label = resolveLabel(badge.value, badge.label);
        return (
          <View
            key={i}
            style={[styles.badge, { backgroundColor: bg }]}
          >
            <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
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
