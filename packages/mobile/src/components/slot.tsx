import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type JSX,
  type ReactNode,
  type Ref,
  type RefCallback,
} from "react";
import type {
  Image as RNImage,
  ImageProps as RNImageProps,
  ImageStyle as RNImageStyle,
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  Text as RNText,
  TextProps as RNTextProps,
  View as RNView,
  ViewProps as RNViewProps,
  StyleProp,
} from "react-native";

const combineStyles = (slotStyle?: Style, childValue?: Style) => {
  if (typeof slotStyle === "function" && typeof childValue === "function") {
    return (state: PressableStateCallbackType) => {
      return StyleSheet.flatten([slotStyle(state), childValue(state)]);
    };
  }
  if (typeof slotStyle === "function") {
    return (state: PressableStateCallbackType) => {
      return childValue
        ? StyleSheet.flatten([slotStyle(state), childValue])
        : slotStyle(state);
    };
  }
  if (typeof childValue === "function") {
    return (state: PressableStateCallbackType) => {
      return slotStyle
        ? StyleSheet.flatten([slotStyle, childValue(state)])
        : childValue(state);
    };
  }

  return StyleSheet.flatten([slotStyle, childValue].filter(Boolean));
};

type AnyProps = Record<string, any>;

const mergeProps = (slotProps: AnyProps, childProps: AnyProps): AnyProps => {
  // all child props should override
  const overrideProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);

    if (isHandler) {
      // if the handler exists on both, we compose them
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      }
      // but if it exists only on the slot, we use only this one
      else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    }
    // if it's `style`, we merge them
    else if (propName === "style") {
      overrideProps[propName] = combineStyles(slotPropValue, childPropValue);
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(" ");
    }
  }

  return { ...slotProps, ...overrideProps };
};

type ImageSlotProps = RNImageProps & {
  children?: ReactNode;
};

type PressableStyle = RNPressableProps["style"];
type ImageStyle = StyleProp<RNImageStyle>;
type Style = PressableStyle | ImageStyle;

export type { AnyProps, ImageSlotProps, ImageStyle, PressableStyle, Style };

// --------------------------------------------------

type PressableProps = RNPressableProps & {
  ref?: Ref<ComponentRef<typeof RNPressable>>;
};

export const Pressable: {
  ({ ref, ...props }: PressableProps): JSX.Element | null;
  displayName: string;
} = ({ ref, ...props }) => {
  const { children, ...pressableSlotProps } = props;

  if (!isValidElement(children)) {
    console.log("Slot.Pressable - Invalid asChild element", children);
    return null;
  }

  return cloneElement<
    React.ComponentPropsWithoutRef<typeof RNPressable>,
    React.ComponentRef<typeof RNPressable>
  >(isTextChildren(children) ? <></> : children, {
    ...mergeProps(pressableSlotProps, children.props as AnyProps),
    ref: ref ? composeRefs(ref, (children as any).ref) : (children as any).ref,
  });
};

Pressable.displayName = "HeroUINative.Primitive.Slot.Pressable";

// --------------------------------------------------

const View = ({
  ref,
  ...props
}: RNViewProps & {
  ref?: Ref<React.ComponentRef<typeof RNView>>;
}) => {
  const { children, ...viewSlotProps } = props;

  if (!isValidElement(children)) {
    console.log("Slot.View - Invalid asChild element", children);
    return null;
  }

  return cloneElement<
    ComponentPropsWithoutRef<typeof RNView>,
    ComponentRef<typeof RNView>
  >(isTextChildren(children) ? <></> : children, {
    ...mergeProps(viewSlotProps, children.props as AnyProps),
    ref: ref ? composeRefs(ref, (children as any).ref) : (children as any).ref,
  });
};

View.displayName = "HeroUINative.Primitive.Slot.View";

// --------------------------------------------------

const Text = ({
  ref,
  ...props
}: RNTextProps & { ref?: Ref<React.ComponentRef<typeof RNText>> }) => {
  const { children, ...textSlotProps } = props;

  if (!isValidElement(children)) {
    console.log("Slot.Text - Invalid asChild element", children);
    return null;
  }

  return cloneElement<
    React.ComponentPropsWithoutRef<typeof RNText>,
    React.ComponentRef<typeof RNText>
  >(isTextChildren(children) ? <></> : children, {
    ...mergeProps(textSlotProps, children.props as AnyProps),
    ref: ref ? composeRefs(ref, (children as any).ref) : (children as any).ref,
  });
};

Text.displayName = "HeroUINative.Primitive.Slot.Text";

// --------------------------------------------------

const Image = forwardRef<ComponentRef<typeof RNImage>, ImageSlotProps>(
  (props, forwardedRef) => {
    const { children, ...imageSlotProps } = props;

    if (!isValidElement(children)) {
      console.log("Slot.Image - Invalid asChild element", children);
      return null;
    }

    return cloneElement<
      ComponentPropsWithoutRef<typeof RNImage>,
      ComponentRef<typeof RNImage>
    >(isTextChildren(children) ? <></> : children, {
      ...mergeProps(imageSlotProps, children.props as AnyProps),
      ref: forwardedRef
        ? composeRefs(forwardedRef, (children as any).ref)
        : (children as any).ref,
    });
  },
);

Image.displayName = "HeroUINative.Primitive.Slot.Image";

import { type PressableStateCallbackType, StyleSheet } from "react-native";

// --------------------------------------------------

export const isTextChildren = (
  children:
    | React.ReactNode
    | ((state: PressableStateCallbackType) => React.ReactNode),
): boolean => {
  return Array.isArray(children)
    ? children.every((child) => typeof child === "string")
    : typeof children === "string";
};

// --------------------------------------------------

export const composeRefs = <T,>(
  ...refs: (Ref<T> | undefined)[]
): RefCallback<T> => {
  return (node: T): void => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        ref.current = node;
      }
    }
  };
};
