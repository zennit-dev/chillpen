import { cn } from "@zenncore/utils";
import {
  Button as ButtonPrimitive,
  type ButtonRootProps,
} from "heroui-native/button";
import type { JSX } from "react";

export const Button = ({ className, ...props }: Button.Props): JSX.Element => {
  return (
    <ButtonPrimitive
      className={cn(
        // "flex-row justify-center rounded-2xl bg-primary py-32 transition-transform active:scale-95",
        // "bg-warning py-32",
        "bg-blue-500",
        className,
      )}
      {...props}
    />
  );
};
export namespace Button {
  export type Props = ButtonRootProps;
}
