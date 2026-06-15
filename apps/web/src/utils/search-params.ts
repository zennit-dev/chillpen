/** Next.js page `searchParams` prop, keyed to the params you read. */
export type SearchParamsProps<Key extends string = string> = {
  searchParams: Promise<Partial<Record<Key, string | string[]>>>;
};

type SearchParamValue = string | string[] | undefined;

export function parseSearchParam(
  value: SearchParamValue,
  mode: "single",
  fallback?: string,
): string;
export function parseSearchParam(
  value: SearchParamValue,
  mode: "multiple",
  fallback?: string[],
): string[];
export function parseSearchParam(
  value: SearchParamValue,
  mode: "single" | "multiple",
  fallback?: string | string[],
): string | string[] {
  if (mode === "multiple") {
    if (value === undefined) return (fallback as string[]) ?? [];
    return Array.isArray(value) ? value : [value];
  }

  if (value === undefined) return (fallback as string) ?? "";
  return Array.isArray(value)
    ? (value[0] ?? (fallback as string) ?? "")
    : value;
}
