"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Hook that returns app state, and takes a callback that is called on active state changes
 *
 * @param callback If defined, it will be called with the "activating" parameter = true when entering active state,
 * false when leaving active state
 *
 * @returns one of 'active', 'background', 'inactive', or 'unknown'
 */
export const useAppState: (
  callback?: (activating: boolean) => void,
) => AppStateStatus = (callback) => {
  const [appState, setAppState] = useState(AppState.currentState);

  const handleAppStateChange = useEffectEvent(
    (updatedAppState: AppStateStatus) => {
      setAppState(updatedAppState);

      // Foregrounding
      if (appState !== "active" && updatedAppState === "active") {
        callback?.(true);
        return;
      }

      // Backgrounding
      if (appState === "active" && updatedAppState !== "active") {
        callback?.(false);
      }
    },
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return subscription.remove;
  }, []);

  return appState;
};
