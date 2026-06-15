"use client";

import { useDebounceCallback } from "@zenncore/utils/hooks";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const SearchBox = ({ initial }: SearchBox.Props) => {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  const push = useDebounceCallback((next: string) => {
    router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }, 300);

  return (
    <TextField
      value={value}
      onValueChange={(next) => {
        setValue(next);
        push(next);
      }}
      className="border-white/10 bg-background-rich"
    >
      <TextFieldInput
        placeholder="Search living universes…"
        className="text-lg"
      />
    </TextField>
  );
};

export namespace SearchBox {
  export type Props = {
    initial: string;
  };
}
