import { NativeTabs, Icon, Label, VectorIcon } from "expo-router/unstable-native-tabs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { userRole } = useAuth();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="owner" hidden={userRole !== "owner"}>
        <Icon
          sf="square.grid.2x2.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="dashboard" />}
        />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="manager" hidden={userRole !== "manager"}>
        <Icon
          sf="square.grid.2x2.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="dashboard" />}
        />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="crew" hidden={userRole !== "crew"}>
        <Icon
          sf="list.bullet"
          androidSrc={<VectorIcon family={MaterialIcons} name="list" />}
        />
        <Label>Tasks</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <Icon
          sf="calendar"
          androidSrc={<VectorIcon family={MaterialIcons} name="event" />}
        />
        <Label>Calendar</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="maintenance" hidden={userRole === "crew"}>
        <Icon
          sf="wrench.and.screwdriver.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="build" />}
        />
        <Label>Maintenance</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="issues" hidden={userRole === "owner"}>
        <Icon
          sf="exclamationmark.triangle.fill"
          androidSrc={
            <VectorIcon family={MaterialIcons} name="report-problem" />
          }
        />
        <Label>Issues</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="supplies" hidden={userRole === "owner"}>
        <Icon
          sf="shippingbox.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="inventory-2" />}
        />
        <Label>Supplies</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="documents" hidden={userRole !== "owner"}>
        <Icon
          sf="doc.text.fill"
          androidSrc={
            <VectorIcon family={MaterialIcons} name="description" />
          }
        />
        <Label>Documents</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
