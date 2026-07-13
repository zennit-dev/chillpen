---
name: zenn-style
description: |
  Personal TypeScript/JavaScript coding style. Apply when writing or editing
  any .ts/.tsx/.js/.jsx file, refactoring code, reviewing diffs, or generating
  new code in a TS project. Covers: const-only (no let), no abbreviated names,
  single-word variable names, IIFE for scoped logic, switch (true) for
  conditional chains, Result pattern with resultify (no try/catch, no "Result"
  suffix, read .data inline), early returns, omit braces for single-statement
  conditionals, return null for "not found", _ prefix for unused destructured
  vars, as const for literal narrowing, void for fire-and-forget async, object
  shorthand, namespace imports for server modules, no types folder, generic
  filenames grouping related exports, named exports with arrow functions,
  implicit return for JSX-only components, static data outside components,
  inline unexported sub-components for local discriminated rendering.
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - Bash
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# zenn-style — Personal TS/JS Coding Style

When writing, editing, refactoring, or reviewing TypeScript / JavaScript code, follow every rule below. These are personal preferences — apply them even when the surrounding file doesn't, unless the user explicitly asks otherwise.

If a rule would conflict with an existing project convention in the same file, match the file's local style and surface the conflict in your end-of-turn summary so the user can decide.

---

## 1. `const` only — never `let`

Always declare variables with `const`. If a value needs to change, restructure (use `reduce`, `map`, callbacks, derive instead of mutate, or extract a function). The binding stays immutable.

```ts
// ✅ Good
const items = data.map((item) => transform(item));
const total = numbers.reduce((sum, n) => sum + n, 0);

// ❌ Bad
let accumulated = 0;
for (const x of items) accumulated += x;
```

**Exception:** Only when an algorithm genuinely requires reassignment. Document why.

---

## 2. Never abbreviate names

Use full descriptive names. No `ctx`, `req`, `res`, `msg`, `err`, `fn`, `cb`, `val`, `ref`, `idx`, `num`, `str`, `obj`, `arr`, `prev`, `acc`, etc.

```ts
// ✅ Good
const context = await getContext();
const request = await fetch(url);
const response = await request.json();
const message = error.message;
const callback = () => {};
const previous = state;

// ❌ Bad
const ctx = ...
const req = ...
const res = ...
const err = ...
const cb = ...
```

**Exception:** Framework conventions universally understood by users of that framework (e.g. `ctx` in Convex handlers) are acceptable when the codebase already uses them. Prefer full names for anything you introduce.

---

## 3. Prefer single-word variable names

When possible, name variables with a single word. Use camelCase only when the concept genuinely requires multiple words.

```ts
// ✅ Good — single word
const result = await resultify(() => fetch(url));
const profile = await Profile.get(context, { id });
const invitation = await Invitation.get(context, { id });
const controller = new AbortController();
const user = await User.get(id);
const creation = await Content.create(data);

// ✅ Acceptable — multi-word when needed
const searchParams = useGlobalSearchParams();
const isCapturing = ...;
const timeoutId = ...;
```

---

## 4. Result pattern — `resultify`, no "Result" suffix, read `.data` inline

For any function that returns a `Result<T, E>` (`{ success: true; data: T } | { success: false; error: E }`):

1. **Use `resultify`**, not `try/catch`, to wrap fallible async/sync work.
2. **Never name the variable `[something]Result`** — the `Result` type is in the annotation. Name by domain concept.
3. **Never extract `.data` into a second variable.** Bind once and read `.data` inline everywhere.

Together these collapse the two-step `const xResult = …; const x = xResult.data;` pattern into a single binding named after the thing itself.

```ts
// ✅ Good — single binding, single-word domain name, read .data inline
const user = await User.get(id);
if (!user.success) return null;
return <Profile name={user.data.name} email={user.data.email} />;

const creation = await Content.create(data);
if (!creation.success) return;
router.push(`/dashboard/content/${creation.data.id}`);

const deletion = await Content.destroy(id);
if (!deletion.success) return { success: false, error: deletion.error };

// ✅ Good — resultify wraps fallible work
const result = await resultify(() =>
  fetch(url, { ...options, signal: controller.signal }),
);
if (!result.success) return { success: false, error: result.error };
return { success: true, data: result.data };
```

```ts
// ❌ Bad — "Result" suffix is redundant noise
const userResult = await User.get(id);
if (!userResult.success) return null;

// ❌ Bad — extracting .data into a second variable
const userResult = await User.get(id);
const user = userResult.data;

// ❌ Bad — try/catch instead of resultify for expected failure paths
try {
  const data = await fetch(url);
  return data;
} catch (error) {
  // exhaustive handling
}
```

**Key points:**
- Don't exhaustively handle every error subtype. Propagate the error and let the caller decide.
- Return `null` for "not found" rather than throwing.

---

## 5. IIFE for scoped logic

Use an IIFE `(() => { ... })()` when you need intermediate computation or branching without polluting the outer scope. Especially good combined with `switch (true)` or for element rendering.

```ts
// ✅ Good — derived value
const label = (() => {
  if (items.length === 0) return "No items";
  if (items.length === 1) return "1 item";
  if (items.length < 10) return `${items.length} items`;
  return `Over ${items.length} items`;
})();

// ✅ Good — element rendering via IIFE + switch
const element = (() => {
  switch (props.shape) {
    case "text":
      return <TextField {...field} {...props} />;
    case "select":
      return <Select {...field} {...props} />;
    default:
      return null;
  }
})();
```

---

## 6. `switch (true)` for conditional chains

When multiple independent conditions map to different outcomes, use `switch (true)` instead of a long `if / else if` chain.

```ts
// ✅ Good
const inferKind = (link: string) => {
  switch (true) {
    case link.includes("facebook.com"):
      return "facebook";
    case link.includes("instagram.com"):
      return "instagram";
    case z.url().safeParse(link).success:
      return "website";
    case z.email().safeParse(link).success:
      return "email";
    default:
      return "contact link";
  }
};
```

---

## 7. Early returns — exit on guard

Prefer early returns over nested conditionals.

```ts
// ✅ Good
if (!profile) return null;
if (!user) return null;
if (active.isPending || user.isPending) return null;
if (!active.data || !user.data) return <Redirect href="/sign-in" />;

// ❌ Bad
if (profile) {
  if (user) {
    if (!active.isPending && !user.isPending) {
      // ...
    }
  }
}
```

---

## 8. Omit braces for single-statement conditionals

```ts
// ✅ Good
if (!signature)
  return new Response("Missing stripe-signature header", { status: 400 });
if (!result.success)
  return { success: false, error: result.error };

// ❌ Bad — unnecessary braces
if (!signature) {
  return new Response("Missing stripe-signature header", { status: 400 });
}
```

**Exception:** Use braces when the body spans multiple lines or when it materially improves readability (e.g. multi-line JSX or object literals).

---

## 9. Return `null` for "not found"

Prefer returning `null` over throwing when something is absent. Let the caller decide.

```ts
// ✅ Good
if (!profile) return null;
if (!booking) return null;
return { ...profile, user };
```

---

## 10. Underscore prefix for unused destructured variables

```ts
// ✅ Good
const { user: _user, ...rest } = profile;
return { ...rest, affiliations };

// ✅ Good — unused index in map
{features.map((feature, _index) => (
  <div key={feature.title}>...</div>
))}
```

---

## 11. `as const` for literal narrowing — only when needed

Use `as const` for static data arrays defined outside components and for object literals that need to narrow a union type. Don't sprinkle it everywhere.

```ts
// ✅ Good — static data
const tiers = [
  { name: "Scan", price: "Free", highlighted: false },
  { name: "Compete", price: 149, highlighted: false },
] as const;

// ✅ Good — literal narrowing
return { type: "client" as const, profile: active };
return { type: "artist" as const, profile: active, affiliation };
```

---

## 12. Document suppressions with rationale

`@ts-expect-error` or `biome-ignore` must come with a short reason.

```ts
// @ts-expect-error - void is not a valid type for Omit
// biome-ignore lint/suspicious/noExplicitAny: any is required to handle empty Result types
```

---

## 13. `void` for fire-and-forget async

When invoking async work without awaiting, prefix with `void` to make the intent explicit.

```ts
// ✅ Good
void (async () => {
  const result = await resultify(() => action(client));
  if (!result.success) {
    setError(result.error);
    return;
  }
  setData(result.data);
})();
```

---

## 14. Default parameters for optional options

```ts
// ✅ Good
export const request = async (
  url: string,
  options: RequestInit,
  { timeout = 60000 }: { timeout?: number } = {},
) => { ... };
```

---

## 15. Object shorthand

```ts
// ✅ Good
{ id }
{ profile, user }

// ❌ Redundant
{ id: id }
{ profile: profile, user: user }
```

---

## 16. Namespace imports for module bundles

Import related server/utility modules as namespaces (`import * as Module`), not destructured functions. The namespace keeps functions and the `Type` alias accessible under a single name.

```ts
// ✅ Good
import * as Products from "@/server/app/product";
import * as Content from "@/server/app/content";

const products = await Products.list();
const creation = await Content.create(data);

// ✅ Good — types only in client code that doesn't call the actions
import type * as Products from "@/server/app/product";

type Props = { products: Products.Type[] };

// ❌ Bad — destructured imports lose the namespace grouping
import { list } from "@/server/app/product";
import { create } from "@/server/app/content";
```

---

## 16b. Function arguments use domain names — rename internally on conflict

Function parameters are named after the **domain concept**, not the technical primitive they hold. A function that takes a store identifier accepts `{ store }`, not `{ storeId }`. A function that takes a product accepts `{ product }`, not `{ productId }`. The caller passes "the store" — they shouldn't need to know whether the receiver works with the full object, the ID, or a slug.

If the parameter name conflicts with a local binding (typically when the body resolves the domain object via `[Module].get(id)` into a variable of the same name), **rename the parameter via destructuring**. Default to `id`. For multiple IDs that would all collapse onto `id`, use `[domain]Id` to disambiguate.

```ts
// ✅ Good — argument is `store`; renamed to `id` because the resolved store occupies `store`
export const syncProducts = withAuthentication(
  async (_, { store: id }: { store: string }) => {
    const store = await get(Environment.SERVER, id);
    if (!store.success) return store;
    if (!store.data) return { success: false, error: new Error("Store not found") };

    switch (store.data.platform) {
      case "shopify":
        return Shopify.syncProducts({ store: id });
      case "woocommerce":
        return WooCommerce.syncProducts({ store: id });
    }
  },
  "Store.syncProducts",
);

// ✅ Good — no local conflict, no rename
async (_, { store }: { store: string }) =>
  find(Environment.SERVER, { where: eq(schema.product.storeId, store) });

// ✅ Good — multiple IDs, disambiguate with [domain]Id
async (_, { store: storeId, product: productId }: { store: string; product: string }) => { ... }
```

```ts
// ❌ Bad — primitive-suffixed argument leaks the implementation detail
async (_, { storeId }: { storeId: string }) => {
  const store = await get(Environment.SERVER, storeId);
  return Shopify.syncProducts({ storeId });
}
```

This pairs with §17 below: the **domain name** travels through the API regardless of what concrete data shape is under the hood.

DB schema column names (e.g. `storeId: text("storeId")` in a Drizzle schema, or `storeId:` in an insert payload that maps to that column) are unrelated to this rule — schema columns keep their conventional names.

---

## 17. Pass domain objects, not derived primitives

When a parent passes data to a child component, pass the full domain object. Let the child derive what it needs.

```ts
// ✅ Good
<SidebarNav products={products} optimizations={optimizations.published} />
// child derives: products.length, optimizations.length

// ❌ Bad — pre-computed primitives strip context
<SidebarNav productCount={products.length} pendingCount={optimizations.pending.length} />
```

---

## 18. No `types` folder — declare types alongside their logic

```ts
// ✅ Good — utils/result.ts, utils/auth.ts
export type Result<T, E = Error> = ...
export type AuthState = ...

// ❌ Bad — dedicated types folder
// types/result.ts
// types/auth.ts
```

---

## 19. Generic filenames — group related exports

Put multiple related hooks/utils in one file. Don't create one file per hook or util.

```ts
// ✅ Good
// hooks/auth.ts
export const useAuth = () => { ... };
export const useIsAuthenticated = () => { ... };
export const useLogout = () => { ... };

// utils/format.ts
export const formatDate = (...) => { ... };
export const formatCurrency = (...) => { ... };

// ❌ Bad — one file per hook/util
// hooks/use-auth.ts
// hooks/use-is-authenticated.ts
// utils/format-date.ts
// utils/format-currency.ts
```

---

## 20. Components — named exports, arrow functions, implicit JSX returns

- **Named exports** for all reusable components.
- **Anonymous default exports** only for Next.js `page.tsx` / `layout.tsx`.
- **Implicit return** (parens) when the body is only a return statement. Block body only when logic precedes the return.

```tsx
// ✅ Good — implicit return, named export
export const Navbar = () => (
  <nav>...</nav>
);

// ✅ Good — block body when there's logic before return
export const Hero = () => {
  const data = computeSomething();
  return <div>{data}</div>;
};

// ✅ Good — anonymous default for Next.js page
export default () => (
  <main>
    <Navbar />
    <Hero />
  </main>
);
```

---

## 21. Namespace + component pattern

Colocate `Props`, `State`, and other types with the component via a namespace.

```ts
export const Button = ({
  variant = "default",
  ...props
}: Button.Props) => {
  // ...
};
export namespace Button {
  export type Props = RenderComponentProps<...> & VariantProps<typeof buttonVariants>;
  export type State = ButtonPrimitive.State;
}
```

---

## 22. Static data outside components

Define static arrays and config objects outside the component with `as const`.

```tsx
// ✅ Good
const tiers = [
  { name: "Scan", price: "Free" },
  { name: "Dominate", price: 449 },
] as const;

export const Pricing = () => (
  <section>
    {tiers.map((tier, index) => (
      <div key={index}>{tier.name}</div>
    ))}
  </section>
);
```

---

## 23. Inline unexported sub-components for local discriminated rendering

Small presentational sub-components that are only used in one file should live in that file and not be exported.

```tsx
// ✅ Good — StatusCell stays local
const StatusCell = ({ status }: { status: Status }) => {
  switch (status) {
    case "yes":
      return <span className="text-blue-600">✓</span>;
    case "partial":
      return <span className="text-sm text-zinc-400">Partial</span>;
    case "no":
      return <span className="text-zinc-300">—</span>;
  }
};
```

---

## 24. Derive instead of mutate

Prefer deriving values (`.filter().length`, `.reduce()`, `Object.fromEntries`) over mutable counters or imperative accumulation.

```ts
// ✅ Good — derived
const wins = results.filter((r) => r.winner === "product").length;
const losses = results.length - wins;

const rates = Object.fromEntries(
  models.map((model) => {
    const wins = results.filter((r) => r.model === model.id && r.winner === "product").length;
    const total = results.filter((r) => r.model === model.id).length;
    return [model.id, { wins, total, rate: total > 0 ? Math.round((wins / total) * 100) : 0 }];
  }),
);

// ❌ Bad — mutable counters
let wins = 0;
let losses = 0;
for (const r of results) {
  if (r.winner === "product") wins += 1;
  else losses += 1;
}
```

---

## 25. Fully parallelize independent async work

When async operations are independent, flatten into a single `Promise.all` with `.flatMap()` instead of sequential loops.

```ts
// ✅ Good — all calls fire at once
const results = await Promise.all(
  products.flatMap((product) =>
    competitors.flatMap((competitor) =>
      models.map((model) => runSimulation(product, competitor, model)),
    ),
  ),
);

// ❌ Bad — sequential outer loop
for (const pair of pairs) {
  const results = await Promise.all(
    models.map((model) => runSimulation(pair.product, pair.competitor, model)),
  );
}
```

---

## How to apply this skill

1. **Before writing code**: scan the target file for the existing style. If it already follows these rules, continue them. If it conflicts, follow the file's local convention and surface the conflict in your summary.
2. **While writing**: apply every rule above by default. Single-word names, `const` only, Result pattern with inline `.data` access — these are non-negotiable defaults.
3. **In review/refactor mode**: flag violations as you see them and propose the rewrite. Don't silently leave `let`, `xResult` extractions, abbreviated names, or `try/catch` blocks for fallible work that has a Result-returning equivalent.
4. **End-of-turn**: if you applied any non-obvious rewrite (collapsing a two-step `Result` extraction, replacing an `if/else if` chain with `switch (true)`, inlining a derived counter), say so in one line.
