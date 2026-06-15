import { type ClassList, cn } from "@zenncore/utils";
import {
  createContext,
  useControlled,
  useStableCallback,
} from "@zenncore/utils/hooks";
import type { Tuple, UniqueIdentifier } from "@zenncore/utils/types";
import {
  type ComponentProps,
  type ComponentPropsWithRef,
  type Context,
  type Dispatch,
  type JSX,
  type PropsWithChildren,
  type Ref as ReactRef,
  type SetStateAction,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  type GestureResponderEvent,
  type LayoutRectangle,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type Pressable,
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  ScrollView,
  View,
  type ViewProps,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  type LayoutAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Portal } from "react-native-teleport";
import { scheduleOnRN } from "react-native-worklets";
import * as Slot from "../slot";
import { useDrawerRootContext } from "./drawer-root-provider";
import {
  type UseDrawerReturn as DrawerInstance,
  drawerAnimationConfig,
  type SnapPoint,
  type SnapPoints,
  type UseDrawerParams,
  useDrawer,
} from "./hooks/use-drawer";

// TODO: add drawer classList,disabled
// TODO: DrawerFooter

const INITIAL_SNAP_POINTS: ["0%", "80%"] = ["0%", "80%"] satisfies Tuple<
  SnapPoint,
  2
>;

type DrawerContext = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id: UniqueIdentifier;
  instance: DrawerInstance;
  draggable: boolean;
  dismissible: boolean;
  dynamicSnapPoint: boolean;
  onDrawerContentLayout: (contentLayout: LayoutRectangle) => void;
  onOpenChangeComplete?: (open: boolean) => void;
};

const context = createContext<DrawerContext>({
  name: "Drawer",
});
const DrawerContext: Context<DrawerContext | undefined> = context[0];
const useDrawerContext: () => DrawerContext = context[1];

// workaround for useWindowDimensions height being incorrect in android
const screenHeight = Dimensions.get("screen").height;

//TODO: restructure drawer to be unmounted after close animation ends
//TODO: create animateOut (close drawer and then remove)

export const Drawer = ({
  ref,
  children,
  defaultSnapIndex,
  snapPoints,
  scaleRoot = true,
  contentSnapPoint: dynamicSnapPoint = false,
  draggable = true,
  dismissible = true,
  overDragDisabled,
  overDragResistanceFactor,
  onMove,
  onDrag,
  onSnap,
  onOpenChange,
  onOpenChangeComplete,
}: Drawer.Props): JSX.Element => {
  const scale = useDrawerRootContext();
  const id = useId();

  const handleDrawerMove = (offset: number) => {
    if (scaleRoot) {
      scale.set(
        interpolate(
          offset,
          instance.snapOffsets,
          [1, 0.9],
          Extrapolation.CLAMP,
        ),
      );
    }

    onMove?.(offset);
  };

  const handleSnap: UseDrawerParams["onSnap"] = (snap) => {
    console.log("snapPoint", snapPoint, snapOffset);
    if (dismissible && snapOffset >= screenHeight) {
      setOpen(false);
    }

    // if (snap.point === contentSnapPoint) {
    //   onSnap?.({ type: "content", value: contentSnapPoint });
    // }

    onSnap?.(snapPoint, snapOffset);
  };

  const instance = useDrawer({
    snapPoints,
    defaultSnapIndex,
    draggable,
    overDragDisabled,
    overDragResistanceFactor,
    onDrag,
    onMove: handleDrawerMove,
    onSnap: handleSnap,
  });

  const handleOpenChange = useStableCallback((open: boolean) => {
    const closeSnapPoint = snapPoints[0];
    const openSnapPoint = snapPoints[1];

    const targetSnapPoint = open ? openSnapPoint : closeSnapPoint;
    instance.snapTo(targetSnapPoint);
    onOpenChange?.(open);
  });

  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: defaultOpen,
    name: "open",
  });

  const updateOpen = useStableCallback(
    (updaterOrValue: SetStateAction<boolean>) => {
      setOpen((previousOpen) => {
        const updatedValue =
          typeof updaterOrValue === "function"
            ? updaterOrValue(previousOpen)
            : updaterOrValue;

        if (updatedValue !== previousOpen) handleOpenChange(updatedValue);
        return updatedValue;
      });
    },
  );

  useImperativeHandle(ref, () => ({
    open: () => updateOpen(true),
    collapse: () => instance.snapTo(snapPoints[0]),
    close: () => updateOpen(false),
    snapTo: instance.snapTo,
  }));

  const handleDrawerContentLayout = (contentLayout: LayoutRectangle) => {
    if (!dynamicSnapPoint) return;

    const dynamicSnapPointValue = contentLayout.height;

    console.log("dynamicSnapPointValue", dynamicSnapPointValue);

    instance.snapTo(dynamicSnapPointValue);
    setSnapPoints((prevSnapPoints) => {
      return [prevSnapPoints[0], dynamicSnapPointValue];
    });
  };

  // useEffect(() => {
  //   //TODO: replace openProp with ref methods to avoid using useEffect
  //   // state and visually inconsistent (see base-ui carousel implementation)
  //   // replace this useEffect with custom entering animation on DrawerContent to snap to the correct point on mount
  //   if (openProp) handleOpenChange(openProp);
  // }, [openProp, handleOpenChange]);

  return (
    <DrawerContext
      value={{
        id,
        open,
        setOpen: updateOpen,
        instance,
        draggable,
        dismissible,
        dynamicSnapPoint,
        onDrawerContentLayout: handleDrawerContentLayout,
        onOpenChangeComplete,
      }}
    >
      {children}
    </DrawerContext>
  );
};
export namespace Drawer {
  export type Ref = {
    // open: () => void;
    // offset: SharedValue<number>;
    snapTo: DrawerInstance["snapTo"];
    open: () => void;
    collapse: () => void;
    close: () => void;
    // collapse: () => void;
  };
  export type Props = PropsWithChildren<{
    ref?: ReactRef<Ref>;
    snapPoints: SnapPoints;
    defaultSnapIndex?: number;
    scaleRoot?: boolean;
    contentSnapPoint?: boolean;
    draggable?: boolean;
    dismissible?: boolean;
    overDragDisabled?: boolean;
    overDragResistanceFactor?: number;
    onOpenChange?: (open: boolean) => void;
    //replace with onSnap because drawer doesn't open or close it snaps to a point
    onOpenChangeComplete?: (open: boolean) => void;
  }> &
    Pick<UseDrawerParams, "onMove" | "onDrag" | "onSnap">;
}

const DrawerExitAnimation =
  (drawerInstance: DrawerInstance, onExitComplete: () => void) =>
  (): LayoutAnimation => {
    "worklet";

    const initialValues = {
      transform: [{ translateY: drawerInstance.offset.get() }],
    };
    const animations = {
      transform: [
        { translateY: withTiming(screenHeight, drawerAnimationConfig) },
      ],
    };

    const callback = (finished: boolean) => {
      if (finished) scheduleOnRN(onExitComplete);
    };

    return {
      initialValues,
      animations,
      callback,
    };
  };

export const DrawerContent = ({
  children,
  className,
  classList,
  style: styleProp,
  onLayout,
  ...props
}: DrawerContent.Props): JSX.Element => {
  const scale = useDrawerRootContext();
  const {
    instance,
    dynamicSnapPoint,
    onDrawerContentLayout,
    onOpenChangeComplete,
  } = useDrawerContext();
  // const { height: screenHeight } = useWindowDimensions();

  const animatedStyle = useDrawerAnimatedStyle({ instance });

  const handleDrawerUnmount = useStableCallback(() => {
    scale.set(withTiming(1, drawerAnimationConfig));
  });

  useEffect(() => {
    return handleDrawerUnmount;
  }, [handleDrawerUnmount]);

  return (
    <DrawerPortal>
      <DrawerOverlay className={classList?.overlay} />
      <GestureDetector
        gesture={instance.gesture}
        enableContextMenu
        touchAction="pan-y"
      >
        <Animated.View
          //TODO: DrawerExitAnimation(instance, () => onOpenChangeComplete?.(true))
          // entering={}
          // exiting={
          //   //TODO: animate only when unmount not programmatic else return undefined
          //   DrawerExitAnimation(instance, () => onOpenChangeComplete?.(false))
          // }
          onLayout={(event) => {
            if (dynamicSnapPoint) {
              onDrawerContentLayout(event.nativeEvent.layout);
            }
            onLayout?.(event);
          }}
          className={cn(
            !dynamicSnapPoint && "inset-x-0 h-screen rounded-t-3xl bg-accent",
            className,
            classList?.content,
            //these styles should not be overridden
            "absolute z-50",
          )}
          style={[styleProp, animatedStyle]}
          {...props}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </DrawerPortal>
  );
};
export namespace DrawerContent {
  export type ClassListKey = "content" | "overlay";
  export type Props = ViewProps & {
    classList?: ClassList<ClassListKey>;
  };
}

export type useDrawerAnimatedStyleParams = {
  instance: DrawerInstance;
};
export type useDrawerAnimatedStyleReturn = {
  transform: [{ translateY: number }, { scaleY: number }];
  transformOrigin: string;
};
export const useDrawerAnimatedStyle = ({
  instance,
}: useDrawerAnimatedStyleParams): useDrawerAnimatedStyleReturn => {
  return useAnimatedStyle(() => {
    const { offset, snapOffsets } = instance;
    // biome-ignore lint/style/noNonNullAssertion: highestSnapPointOffset is guaranteed
    const highestSnapPointOffset = snapOffsets[snapOffsets.length - 1]!;
    // biome-ignore lint/style/noNonNullAssertion: lowestSnapPointOffset is guaranteed
    const lowestSnapPointOffset = snapOffsets[0]!;

    const isOverDraggingUp = offset.get() < highestSnapPointOffset;
    const isOverDraggingDown = offset.get() > lowestSnapPointOffset;

    let scaleY = 1;

    if (isOverDraggingUp) {
      const overDragAmount = highestSnapPointOffset - offset.get();
      const maxOverDrag = screenHeight * 0.2; // Adjust this to control sensitivity
      const scaleFactor = Math.min(overDragAmount / maxOverDrag, 1);
      scaleY = 1 + scaleFactor * 0.5; // Scale from 1.0 to 1.5
    } else if (isOverDraggingDown) {
      const overDragAmount = offset.get() - lowestSnapPointOffset;
      const maxOverDrag = screenHeight * 0.2;
      const scaleFactor = Math.min(overDragAmount / maxOverDrag, 1);
      scaleY = 1 + scaleFactor * 0.5; // Scale from 1.0 to 1.5
    }

    return {
      transform: [{ translateY: offset.get() }, { scaleY }],
      transformOrigin: isOverDraggingDown ? "top" : "center",
    };
  });
};

export type DrawerHandleProps = {
  className?: string;
};

export const DrawerHandle = ({ className }: DrawerHandleProps): JSX.Element => {
  return (
    <View
      className={cn(
        "mx-auto my-6 h-1.5 w-20 rounded-full bg-background-rich",
        className,
      )}
    />
  );
};
export namespace DrawerHandle {
  export type Props = {
    className?: string;
  };
}

export const DrawerTrigger = ({
  asChild,
  onPress,
  ...props
}: DrawerTrigger.Props): JSX.Element => {
  const { setOpen } = useDrawerContext();

  const handleOpen = (event: GestureResponderEvent) => {
    setOpen(true);
    onPress?.(event);
  };

  const Component = asChild ? Slot.Pressable : RNPressable;

  return <Component onPress={handleOpen} {...props} />;
};
export namespace DrawerTrigger {
  export type Props = ComponentPropsWithRef<typeof Pressable> & {
    asChild?: boolean;
  };
}

const DrawerPortal = ({
  forceMount,
  hostName = "drawer",
  ...props
}: DrawerPortal.Props) => {
  const context = useDrawerContext();

  const { open } = context;

  if (!forceMount && !open) return null;

  return (
    <Portal hostName={hostName} name={`drawer_${context.id}`} {...props} />
  );
};
export namespace DrawerPortal {
  export type Props = PropsWithChildren<
    {
      hostName?: string;
    } & { forceMount?: boolean }
  >;
}

const AnimatedRNPressable = Animated.createAnimatedComponent(RNPressable);

const DrawerOverlayExitAnimation =
  (drawerInstance: DrawerInstance) => (): LayoutAnimation => {
    "worklet";

    const initialValues = {
      opacity: interpolate(
        drawerInstance.offset.get(),
        drawerInstance.snapOffsets,
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
    const animations = {
      opacity: withTiming(0, drawerAnimationConfig),
    };

    return {
      initialValues,
      animations,
    };
  };

// todo: overlay composable component, add props: dismissOnPress, visibleOnSnapPointIndex, hiddenOnSnapPointIndex
const DrawerOverlay = ({
  forceMount,
  className,
  style: styleProp,
  onPress,
  ...props
}: DrawerOverlay.Props) => {
  const { id, instance, dismissible, setOpen } = useDrawerContext();

  const style = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        instance.offset.get(),
        instance.snapOffsets,
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  }, [instance.offset, instance.snapOffsets]);

  const handleDismiss = (event: GestureResponderEvent) => {
    if (dismissible) instance.close();

    onPress?.(event);
  };

  return (
    <AnimatedRNPressable
      key={`drawer_${id}_overlay`}
      exiting={DrawerOverlayExitAnimation(instance)}
      className={cn(
        "bg-black/60",
        className,
        //these styles should not be overridden
        "absolute inset-0",
      )}
      style={[styleProp, style]}
      onPress={handleDismiss}
      {...props}
    />
  );
};
export namespace DrawerOverlay {
  export type Props = RNPressableProps & { forceMount?: boolean };
}

export const DrawerClose = ({
  asChild,
  onPress,
  ...props
}: DrawerClose.Props): JSX.Element => {
  const { setOpen } = useDrawerContext();

  const handleClose = (event: GestureResponderEvent) => {
    setOpen(false);
    onPress?.(event);
  };

  const Component = asChild ? Slot.Pressable : RNPressable;

  return <Component onPress={handleClose} {...props} />;
};
export namespace DrawerClose {
  export type Props = ComponentProps<typeof RNPressable> & {
    asChild?: boolean;
  };
}

type ScrollableComponent = typeof ScrollView | typeof FlatList;

type ScrollHandlerProps<T extends ScrollableComponent> = ComponentProps<T> & {
  context?: DrawerContext;
  shouldDragDrawerOnOverScroll?: boolean;
};

type DrawerScrollableContainerProps<T extends ScrollableComponent> =
  ScrollHandlerProps<T> & {
    Component: T;
  };

const DrawerScrollableContainer = <T extends ScrollableComponent>({
  Component,
  shouldDragDrawerOnOverScroll = true,
  context,
  ...props
}: DrawerScrollableContainerProps<T>): JSX.Element => {
  const scrollOffset = useSharedValue(0);
  const [isOverScrolling, setIsOverScrolling] = useState(false);

  const {
    instance: { gesture: initialGesture },
    // biome-ignore lint/correctness/useHookAtTopLevel: useDrawerContext(use hook) can be called conditionally
  } = context ?? useDrawerContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: dragGesture is not a dependency of this effect
  const gesture = useMemo(() => {
    const scrollGesture = Gesture.Native()
      .enabled(shouldDragDrawerOnOverScroll)
      .shouldCancelWhenOutside(true);

    const panGesture = Gesture.Pan()
      .enabled(shouldDragDrawerOnOverScroll)
      .onUpdate(({ velocityY }) => {
        const scrollDirection = velocityY > 0 ? "up" : "down";
        if (scrollDirection === "up" && scrollOffset.get() <= 0) {
          scheduleOnRN(setIsOverScrolling, true);
        }

        if (scrollDirection === "down") scheduleOnRN(setIsOverScrolling, false);
      });

    if (!shouldDragDrawerOnOverScroll) {
      return scrollGesture.blocksExternalGesture(initialGesture);
    }

    if (!isOverScrolling) {
      scrollGesture.simultaneousWithExternalGesture(initialGesture);
      panGesture
        .blocksExternalGesture(initialGesture)
        .simultaneousWithExternalGesture(initialGesture);
    }

    return isOverScrolling
      ? scrollGesture.blocksExternalGesture(initialGesture) // Android // or Gesture.Native()
      : Gesture.Simultaneous(scrollGesture, panGesture);
  }, [shouldDragDrawerOnOverScroll, isOverScrolling]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollOffset.set(offsetY);

    props.onScroll?.(event);
  };

  return (
    <GestureDetector gesture={gesture}>
      {/** @ts-expect-error: it is callable */}
      <Component
        {...props}
        {...(shouldDragDrawerOnOverScroll && {
          bounces: isOverScrolling ? false : props.bounces,
          overScrollMode: "never",
          scrollEventThrottle: 16,
          onScroll: handleScroll,
          onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            setIsOverScrolling(false);
            props.onScrollEndDrag?.(event);
          },
        })}
      />
    </GestureDetector>
  );
};

export const DrawerScrollView = (
  props: DrawerScrollView.Props,
): JSX.Element => {
  return <DrawerScrollableContainer Component={ScrollView} {...props} />;
};
export namespace DrawerScrollView {
  export type Props = ScrollHandlerProps<typeof ScrollView>;
}

export const DrawerFlatList = (props: DrawerFlatList.Props): JSX.Element => {
  return <DrawerScrollableContainer Component={FlatList} {...props} />;
};
export namespace DrawerFlatList {
  export type Props = ScrollHandlerProps<typeof FlatList>;
}
