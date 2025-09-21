import { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  ViroARScene,
  ViroText,
  ViroTrackingReason,
  ViroARSceneNavigator,
  ViroARTrackingReasonConstants,
} from "@reactvision/react-viro";

// Type-safe AR scene props
interface ARSceneProps {
  sceneNavigator: { viroAppProps: unknown };
}

const ARScene = () => {
  const [tracking, setTracking] = useState<ViroTrackingReason>(ViroARTrackingReasonConstants.TRACKING_REASON_NONE);

  return (
    <ViroARScene
      onTrackingUpdated={(state, reason) => setTracking(reason)}
    >
      <ViroText
        text="Hello, AR World!"
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={{ fontSize: 20, color: "#ffffff" }}
      />

      <ViroText
        text={`Tracking: ${tracking}`}
        scale={[0.2, 0.2, 0.2]}
        position={[0, -0.5, -1]}
        style={{ fontSize: 12, color: "#00ff00" }}
      />
    </ViroARScene>
  );
};

const ARScreen = () => (
  <View style={styles.container}>
    <ViroARSceneNavigator
      autofocus
      initialScene={{ scene: ARScene }}
      style={{ flex: 1 }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default ARScreen;
