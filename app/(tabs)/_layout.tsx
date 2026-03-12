import { useMemo } from "react";
import { Platform, View } from "react-native";
import {
  NativeTabs,
  Icon,
  Label,
  Badge,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { colors } from "../../styles/commonStyles";

const isIOS26 = Platform.OS === "ios" && Number(Platform.Version) >= 26;

export default function TabLayout() {
  const { userRole, userId, isLoading } = useAuth();
  const { getIssuesForUser, getMaintenanceTasksForUser } = useData();

  const openIssueCount = useMemo(() => {
    if (!userId || !userRole) return 0;
    const issues = getIssuesForUser(userId, userRole);
    return issues.filter((i) => i.status === "open").length;
  }, [userId, userRole, getIssuesForUser]);

  const urgentMaintenanceCount = useMemo(() => {
    if (!userId || !userRole) return 0;
    const tasks = getMaintenanceTasksForUser(userId, userRole);
    return tasks.filter((t) => t.priority === "high" || t.priority === "urgent" || t.priority === "critical")
      .length;
  }, [userId, userRole, getMaintenanceTasksForUser]);

  const sharedTriggerProps = {
    disablePopToTop: Platform.OS === "android",
  };

  if (isLoading || !userRole) {
    return <View style={{ flex: 1, backgroundColor: colors.surfaceTwo }} />;
  }

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge
      backgroundColor={colors.surfaceTwo}
      iconColor={{
        default: colors.textTertiary,
        selected: colors.text,
      }}
      labelStyle={{
        default: {
          fontSize: 10,
          fontWeight: "500" as const,
          color: colors.textTertiary,
        },
        selected: {
          fontSize: 10,
          fontWeight: "500" as const,
          color: colors.text,
        },
      }}
    >
      {/* Owner Dashboard */}
      <NativeTabs.Trigger
        name="owner"
        hidden={userRole !== "owner"}
        {...sharedTriggerProps}
      >
        <Icon
          sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }}
          androidSrc={<VectorIcon family={MaterialIcons} name="dashboard" />}
        />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>

      {/* Manager Dashboard */}
      <NativeTabs.Trigger
        name="manager"
        hidden={userRole !== "manager"}
        {...sharedTriggerProps}
      >
        <Icon
          sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }}
          androidSrc={<VectorIcon family={MaterialIcons} name="dashboard" />}
        />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>

      {/* Crew Tasks */}
      <NativeTabs.Trigger
        name="crew"
        hidden={userRole !== "crew"}
        {...sharedTriggerProps}
      >
        <Icon
          sf="list.bullet"
          androidSrc={<VectorIcon family={MaterialIcons} name="list" />}
        />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>

      {/* Calendar (all roles) */}
      <NativeTabs.Trigger name="calendar" {...sharedTriggerProps}>
        <Icon
          sf="calendar"
          androidSrc={<VectorIcon family={MaterialIcons} name="event" />}
        />
        <Label>Calendar</Label>
      </NativeTabs.Trigger>

      {/* Maintenance (owner + manager) */}
      <NativeTabs.Trigger
        name="maintenance"
        hidden={userRole === "crew"}
        {...sharedTriggerProps}
      >
        <Icon
          sf={{
            default: "wrench.and.screwdriver",
            selected: "wrench.and.screwdriver.fill",
          }}
          androidSrc={<VectorIcon family={MaterialIcons} name="build" />}
        />
        <Label>Maintenance</Label>
        <Badge hidden={urgentMaintenanceCount === 0}>
          {String(urgentMaintenanceCount)}
        </Badge>
      </NativeTabs.Trigger>

      {/* Issues (all roles) */}
      <NativeTabs.Trigger
        name="issues"
        {...sharedTriggerProps}
      >
        <Icon
          sf={{
            default: "exclamationmark.triangle",
            selected: "exclamationmark.triangle.fill",
          }}
          androidSrc={
            <VectorIcon family={MaterialIcons} name="report-problem" />
          }
        />
        <Label>Issues</Label>
        <Badge hidden={openIssueCount === 0}>{String(openIssueCount)}</Badge>
      </NativeTabs.Trigger>

      {/* Supplies (crew only as direct tab; owner+manager access via More) */}
      <NativeTabs.Trigger
        name="supplies"
        hidden={userRole !== "crew"}
        {...sharedTriggerProps}
      >
        <Icon
          sf={{ default: "shippingbox", selected: "shippingbox.fill" }}
          androidSrc={<VectorIcon family={MaterialIcons} name="inventory-2" />}
        />
        <Label>Supplies</Label>
      </NativeTabs.Trigger>

      {/* Hidden overflow tabs (accessed via More tab for owner+manager) */}
      <NativeTabs.Trigger name="documents" hidden {...sharedTriggerProps}>
        <Icon sf="doc.text" androidSrc={<VectorIcon family={MaterialIcons} name="description" />} />
        <Label>Documents</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="contacts" hidden {...sharedTriggerProps}>
        <Icon sf="person.2" androidSrc={<VectorIcon family={MaterialIcons} name="contacts" />} />
        <Label>Contacts</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="certifications" hidden {...sharedTriggerProps}>
        <Icon sf="checkmark.seal" androidSrc={<VectorIcon family={MaterialIcons} name="verified" />} />
        <Label>Certs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="charters" hidden {...sharedTriggerProps}>
        <Icon sf="sailboat" androidSrc={<VectorIcon family={MaterialIcons} name="directions-boat" />} />
        <Label>Charters</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="equipment" hidden {...sharedTriggerProps}>
        <Icon sf="lifepreserver" androidSrc={<VectorIcon family={MaterialIcons} name="inventory" />} />
        <Label>Equipment</Label>
      </NativeTabs.Trigger>

      {/* More (owner + manager) */}
      <NativeTabs.Trigger
        name="more"
        hidden={userRole === "crew"}
        {...sharedTriggerProps}
      >
        <Icon
          sf={{ default: "ellipsis.circle", selected: "ellipsis.circle.fill" }}
          androidSrc={<VectorIcon family={MaterialIcons} name="more-horiz" />}
        />
        <Label>More</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
