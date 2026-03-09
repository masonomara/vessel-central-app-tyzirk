import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const check = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        if (!authToken) {
          router.replace("/login");
          return;
        }
        const userRole = await AsyncStorage.getItem("userRole");
        if (userRole === "owner") router.replace("/(tabs)/owner");
        else if (userRole === "manager") router.replace("/(tabs)/manager");
        else if (userRole === "crew") router.replace("/(tabs)/crew");
        else router.replace("/login");
      } catch {
        router.replace("/login");
      } finally {
        SplashScreen.hideAsync();
      }
    };

    check();
  }, []);

  return <View style={{ flex: 1, backgroundColor: "#0A1628" }} />;
}
