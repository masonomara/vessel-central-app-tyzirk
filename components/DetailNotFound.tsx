import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { commonStyles, colors } from "../styles/commonStyles";

interface DetailNotFoundProps {
  title: string;
}

export function DetailNotFound({ title }: DetailNotFoundProps) {
  return (
    <View style={commonStyles.container}>
      <Stack.Screen options={{ title: "", headerBackTitle: "Back" }} />
      <View style={styles.centered}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
