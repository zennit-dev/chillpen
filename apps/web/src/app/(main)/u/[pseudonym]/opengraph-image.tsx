import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og";
import * as User from "@/server/app/user";
import { Environment } from "@/server/utils/environment";

export const alt = "A creator on chillpen";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async ({
  params,
}: {
  params: Promise<{ pseudonym: string }>;
}) => {
  const { pseudonym } = await params;
  const account = await User.byPseudonym(Environment.SERVER, pseudonym);
  const data = account.success ? account.data : null;

  return createOgImage({
    eyebrow: "Creator",
    title: data?.pseudonym ?? pseudonym,
    description:
      data?.bio ?? `${pseudonym} builds living, branching worlds on chillpen.`,
  });
};
