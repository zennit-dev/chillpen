import { merge } from "@zenncore/utils";
import {
  HeroUINativeProvider,
  type HeroUINativeProviderProps,
} from "heroui-native/provider";
import type { JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "react-native-teleport";
import { DrawerRootProvider } from "./drawer/drawer-root-provider";

export const UIProvider = ({
  config = {},
  ...props
}: HeroUINativeProviderProps): JSX.Element => {
  return (
    <PortalProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DrawerRootProvider>
          <HeroUINativeProvider
            config={merge(
              {
                devInfo: { stylingPrinciples: false },
              },
              config ?? {},
            )}
            {...props}
          />
        </DrawerRootProvider>
      </GestureHandlerRootView>
    </PortalProvider>
  );
};
