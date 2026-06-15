import { createContext } from "@zenncore/utils/hooks";
import type { Context, JSX, PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { PortalHost } from "react-native-teleport";

type DrawerRootContext = SharedValue<number>;
const context = createContext<DrawerRootContext>({
  error: "Drawer should be used within DrawerRootProvider",
});
const DrawerRootContext: Context<DrawerRootContext | undefined> = context[0];
export const useDrawerRootContext: () => DrawerRootContext = context[1];

export const DrawerRootProvider = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => {
    const borderRadius = interpolate(scale.get(), [1, 0.9], [0, 16]);

    return {
      transform: [{ scale: scale.get() }],
      // transformOrigin: "bottom",
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    };
  });

  return (
    <DrawerRootContext value={scale}>
      <View className={"flex-1 bg-black"}>
        <Animated.View style={style} className={"size-full overflow-hidden"}>
          {children}
        </Animated.View>
        <PortalHost name="drawer" style={StyleSheet.absoluteFillObject} />
      </View>
    </DrawerRootContext>
  );
};
