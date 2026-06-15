import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture, type PanGesture } from "react-native-gesture-handler";
import {
  type AnimationCallback,
  Easing,
  type EasingFunction,
  Extrapolation,
  interpolate,
  ReduceMotion,
  type SharedValue,
  useAnimatedReaction,
  useSharedValue,
  type WithTimingConfig,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export const drawerAnimationConfig: {
  duration: number;
  easing: EasingFunction;
  reduceMotion: ReduceMotion;
} = {
  duration: 300,
  easing: Easing.inOut(Easing.quad),
  reduceMotion: ReduceMotion.System,
};

type SnapOffsets = [number, ...number[]];

const getSurroundingSnapOffsets = (
  offset: number,
  snapOffsets: [number, number, ...number[]],
): [number, number] => {
  "worklet";

  if (offset >= snapOffsets[0]) {
    return [snapOffsets[0], snapOffsets[1]];
  }

  // biome-ignore lint/style/noNonNullAssertion: last snapPoint is guaranteed
  const lastSnapOffset = snapOffsets[snapOffsets.length - 1]!;

  if (offset <= lastSnapOffset) {
    // biome-ignore lint/style/noNonNullAssertion: second last snapPoint is guaranteed
    return [snapOffsets[snapOffsets.length - 2]!, lastSnapOffset];
  }

  for (const [index, snapOffset] of snapOffsets.entries()) {
    // biome-ignore lint/style/noNonNullAssertion: next snapPoint is guaranteed
    if (offset < snapOffset && offset > snapOffsets[index + 1]!) {
      // biome-ignore lint/style/noNonNullAssertion: next snapPoint is guaranteed
      return [snapOffset, snapOffsets[index + 1]!];
    }
  }

  // // This point should never be reached, but added as a safeguard
  // // throw new Error("Unexpected input or logic error.");

  return [snapOffsets[0], snapOffsets[1]];
};

const getTargetSnapOffset = (
  offset: number,
  snapOffsets: SnapOffsets,
  velocity: number,
) => {
  "worklet";

  const lowestSnapPointOffset = snapOffsets[0];

  if (snapOffsets.length === 1) return lowestSnapPointOffset;

  //TODO: get from hook params
  const collapseVelocityThreshold = 4000;

  if (velocity >= collapseVelocityThreshold) return lowestSnapPointOffset;

  const surroundingSnapOffsets = getSurroundingSnapOffsets(
    offset,
    snapOffsets as [number, number, ...number[]],
  );

  const [lowerSnapPointOffset, higherSnapPointOffset] = surroundingSnapOffsets;

  if (offset >= lowerSnapPointOffset) return lowerSnapPointOffset;
  if (offset <= higherSnapPointOffset) return higherSnapPointOffset;

  const direction = velocity > 0 ? "down" : "up";

  const distanceFromLowerSnapPoint = Math.abs(offset - lowerSnapPointOffset);
  const distanceFromHigherSnapPoint = Math.abs(offset - higherSnapPointOffset);

  // const directionBias = 0.5; => (1 - directionBias)

  if (direction === "up") {
    // When moving up, favor the higher snap point
    return distanceFromHigherSnapPoint - Math.abs(velocity) <=
      distanceFromLowerSnapPoint
      ? higherSnapPointOffset
      : lowerSnapPointOffset;
  }

  // When moving down, favor the lower snap point
  return distanceFromLowerSnapPoint - Math.abs(velocity) <=
    distanceFromHigherSnapPoint
    ? lowerSnapPointOffset
    : higherSnapPointOffset;
};

const getSnapPoint = (offset: number, screenHeight: number) => {
  "worklet";
  return Math.max(0, screenHeight - offset);
};

const getSnapOffset = (snapPoint: SnapPoint, screenHeight: number) => {
  "worklet";

  if (typeof snapPoint === "number") {
    return Math.max(0, screenHeight - snapPoint);
  }

  const percentage = Number(snapPoint.replace("%", ""));

  return Math.max(0, screenHeight - (screenHeight * percentage) / 100);
};

export type SnapPoint = number | `${number}%`;
export type SnapPoints = [SnapPoint, ...SnapPoint[]];

export type UseDrawerParams = {
  snapPoints: SnapPoints;
  animationConfig?: WithTimingConfig;
  defaultSnapIndex?: number;
  draggable?: boolean;
  overDragResistanceFactor?:
    | {
        top?: number;
        bottom?: number;
      }
    | number;
  overDragDisabled?:
    | {
        top?: boolean;
        bottom?: boolean;
      }
    | boolean;
  onDrag?: (offset: number) => void;
  onSnap?: (snap: { snapIndex: number; point: number }) => void;
  onMove?: (offset: number) => void;
};

export type UseDrawerReturn = {
  snapOffsets: number[];
  offset: SharedValue<number>;
  gesture: PanGesture;
  activeSnapIndex: number;
  snapTo: (
    snap:
      | { type: "index"; value: number }
      | { type: "point"; value: SnapPoint },
  ) => void;
  close: () => void;
  collapse: () => void;
  extend: () => void;
  // activeSnapPoint: T[number];
};

//TODO: defaultSnapIndex -1 for closed state (if closed state is in snapPoints than index 0)
// or make defaultSnapIndex number | "closed"
// because -1 is for snaps that are not in snapPoints

export const useDrawer = ({
  snapPoints,
  animationConfig = drawerAnimationConfig,
  defaultSnapIndex = 0,
  draggable = true,
  overDragDisabled,
  overDragResistanceFactor,
  onDrag,
  onMove,
  onSnap,
}: UseDrawerParams): UseDrawerReturn => {
  if (snapPoints.length === 0) throw new Error("No snap point specified");
  if (snapPoints.length < 1) {
    throw new Error("There should be at least 1 snapPoint");
  }
  // if (defaultSnapIndex < 0 || defaultSnapIndex >= snapPoints.length) {
  //   throw new Error(
  //     `Invalid default snap index, index must be ${snapPoints.length > 1 ? `between 0 and ${snapPoints.length - 1}` : "0"}`,
  //   );
  // }

  const { height: screenHeight } = useWindowDimensions();
  const [activeSnapIndex, setActiveSnapIndex] = useState(defaultSnapIndex);
  const context = useSharedValue(screenHeight);
  const offset = useSharedValue(screenHeight);

  const snapOffsets = useMemo(
    () =>
      snapPoints.map((snapPoint) =>
        getSnapOffset(snapPoint, screenHeight),
      ) as SnapOffsets,
    [snapPoints, screenHeight],
  );

  const lowestSnapPointOffset = snapOffsets[0];
  // biome-ignore lint/style/noNonNullAssertion: highest snapPoints is guaranteed
  const highestSnapPointOffset = snapOffsets[snapOffsets.length - 1]!;

  const snapDrawer = (
    targetOffset: number,
    velocity = 0,
    _onAnimationEnd?: AnimationCallback,
  ) => {
    const distance = Math.abs(targetOffset - offset.get());
    const absVelocity = Math.abs(velocity);

    const baseDuration = 300;
    const minDuration = 200;
    const maxDuration = 500;

    let duration = baseDuration;

    if (absVelocity > 100) {
      // Scale duration inversely with velocity
      // velocityFactor: higher velocity = smaller factor = shorter duration
      const velocityFactor = Math.max(0.3, Math.min(1, 1000 / absVelocity));
      duration = baseDuration * velocityFactor;
    }

    // Adjust for distance (longer distances might need slightly more time)
    if (distance > screenHeight * 0.5) {
      duration *= 1.05;
    }

    duration = Math.max(minDuration, Math.min(maxDuration, duration));

    if (targetOffset >= screenHeight) {
      offset.set(
        withTiming(screenHeight, { ...animationConfig, duration }, () => {
          scheduleOnRN(handleDrawerMoveEnd, screenHeight);
        }),
      );
      return;
    }

    console.log("absVelocity", absVelocity);

    offset.set(
      withSpring(
        targetOffset,
        {
          stiffness: 900,
          damping: 110,
          mass: interpolate(
            absVelocity,
            [0, 4000, 7000],
            [4, 2, 1],
            Extrapolation.CLAMP,
          ),
        },
        () => {
          scheduleOnRN(handleDrawerMoveEnd, targetOffset);
        },
      ),
    );
  };

  const handleDrawerMoveEnd = (offset: number) => {
    const snapIndex = snapOffsets.indexOf(offset);
    const snapPoint = getSnapPoint(offset, screenHeight);

    setActiveSnapIndex(snapIndex);
    onSnap?.({ snapIndex, point: snapPoint });
  };

  const snapTo: UseDrawerReturn["snapTo"] = (snap) => {
    if (
      snap.type === "index" &&
      (snap.value < 0 || snap.value >= snapPoints.length)
    ) {
      throw new Error(
        `Invalid index value, index must be ${snapPoints.length > 1 ? `between 0 and ${snapPoints.length - 1}` : "0"}`,
      );
    }

    const targetOffset =
      snap.type === "index"
        ? // biome-ignore lint/style/noNonNullAssertion: snapPoints is guaranteed here
          snapOffsets[snap.value]!
        : getSnapOffset(snap.value, screenHeight);

    snapDrawer(targetOffset);
  };

  const close = () => snapDrawer(screenHeight);
  const collapse = () => snapDrawer(lowestSnapPointOffset);
  const extend = () => snapDrawer(highestSnapPointOffset);

  //TODO: migrate to RNGH v3.0
  const drawerGesture = Gesture.Pan()
    .enabled(draggable)
    .onStart(() => {
      context.set(offset.get());
    })
    .onUpdate(({ translationY, velocityY }) => {
      const currentOffset = translationY + context.get();
      const direction = velocityY > 0 ? "down" : "up";
      const isOverDraggingTop =
        direction === "up" && currentOffset < highestSnapPointOffset;
      const isOverDraggingBottom =
        direction === "down" && currentOffset > lowestSnapPointOffset;
      const isOverDragging = isOverDraggingTop || isOverDraggingBottom;

      const isTopOverDragDisabled =
        typeof overDragDisabled === "object"
          ? overDragDisabled.top
          : overDragDisabled;
      const isBottomOverDragDisabled =
        typeof overDragDisabled === "object"
          ? overDragDisabled.bottom
          : overDragDisabled;

      if (
        (isOverDraggingTop && isTopOverDragDisabled) ||
        (isOverDraggingBottom && isBottomOverDragDisabled)
      ) {
        return;
      }

      if (overDragResistanceFactor && isOverDragging) {
        const boundarySnapPoint = isOverDraggingTop
          ? highestSnapPointOffset
          : lowestSnapPointOffset;
        const overDragAmount = currentOffset - boundarySnapPoint;

        const resistanceFactor =
          typeof overDragResistanceFactor === "object"
            ? isOverDraggingTop
              ? (overDragResistanceFactor.top ?? 0)
              : (overDragResistanceFactor.bottom ?? 0)
            : overDragResistanceFactor;

        const resistedOverDrag = overDragAmount / (resistanceFactor || 1); // Prevent division by 0
        offset.set(boundarySnapPoint + resistedOverDrag);
      } else {
        offset.set(currentOffset);
      }

      if (onDrag) scheduleOnRN(onDrag, offset.get());
    })
    .onEnd(({ velocityY }) => {
      const targetSnapOffset = getTargetSnapOffset(
        offset.get(),
        snapOffsets,
        velocityY,
      );

      scheduleOnRN(snapDrawer, targetSnapOffset, velocityY);

      if (onDrag) scheduleOnRN(onDrag, offset.get());
    });

  const handleSnapOffsetsChange = useEffectEvent((snapOffsets: SnapOffsets) => {
    if (activeSnapIndex === -1) {
      const snapIndex = snapOffsets.indexOf(offset.get());
      if (snapIndex !== -1) setActiveSnapIndex(snapIndex);
      return;
    }

    const targetOffset = snapOffsets[activeSnapIndex];

    if (targetOffset === offset.get()) return;

    if (targetOffset === undefined) collapse();
    else snapDrawer(targetOffset);
  });

  useEffect(() => {
    handleSnapOffsetsChange(snapOffsets);
  }, [snapOffsets]);

  useAnimatedReaction(
    () => offset.get(),
    (drawerOffset, previousDrawerOffset) => {
      const isDrawerMoving =
        previousDrawerOffset !== null && drawerOffset !== previousDrawerOffset;

      // const direction = drawerOffset < previousValue ? "up" : "down";

      if (isDrawerMoving && onMove) scheduleOnRN(onMove, drawerOffset);
    },
  );

  return {
    gesture: drawerGesture,
    offset,
    snapOffsets,
    activeSnapIndex,
    snapTo,
    close,
    collapse,
    extend,
  };
};
