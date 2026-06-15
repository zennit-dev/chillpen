"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { useState } from "react";
import * as Follow from "@/server/app/follow";

export const FollowButton = ({ writer, following }: FollowButton.Props) => {
  const [active, setActive] = useState(following);

  const [toggle, isPending] = useAsyncAction(async () => {
    setActive((current) => !current);
    const result = await Follow.toggle({ writer });
    if (!result.success) setActive((current) => !current);
  });

  return (
    <Button
      color={active ? "neutral" : "primary"}
      variant={active ? "outline" : "default"}
      disabled={isPending}
      onClick={() => void toggle()}
    >
      {active ? "Following" : "Follow"}
    </Button>
  );
};

export namespace FollowButton {
  export type Props = {
    writer: string;
    following: boolean;
  };
}
