"use server";

import { resultify } from "@zenncore/utils";
import { withAuthentication } from "../utils/authentication";
import { Environment } from "../utils/environment";
import { upload } from "./storage";

/**
 * Upload a single cover/banner image for the Writer Studio. Returns the hosted
 * URL on success; failures (e.g. no UploadThing token in preview) surface as a
 * Result so the caller can fall back to a generated cover.
 */
export const uploadImage = withAuthentication(async (_, formData: FormData) => {
  const file = formData.get("file");
  if (!(file instanceof File))
    return { success: false as const, error: new Error("no-file") };

  const result = await resultify(() => upload([file]));
  if (!result.success) return result;

  const url = result.data[0]?.ufsUrl;
  if (!url)
    return { success: false as const, error: new Error("upload-failed") };

  return { success: true as const, data: { url } };
}, "Upload.uploadImage");
