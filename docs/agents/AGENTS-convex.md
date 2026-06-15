# Convex Conventions

This codebase uses a structured two-layer architecture for all Convex backend code. The `apps/provider` package is the Convex deployment. Follow these patterns precisely.

---

## C1. Two-Layer Architecture: `definition/` and `app/`

All Convex code is split into two layers:

- **`definition/`** — Pure logic: model validators and service business logic. No Convex registrations here.
  - `definition/models/` — Raw `v.*` validators that describe table shapes.
  - `definition/services/` — Business logic functions using handler helpers. These are **never** registered directly with Convex.
- **`app/`** — Convex registrations only.
  - `app/schema.ts` — Imports from `definition/models/` and wraps with `defineTable()`.
  - `app/services/` — Imports handlers from `definition/services/` and registers them with `query`, `mutation`, `authenticatedQuery`, `authenticatedMutation`, etc.

```
src/
├── definition/
│   ├── models/         ← v.* validators (schema shapes)
│   └── services/       ← business logic handlers (not registered)
├── app/
│   ├── schema.ts       ← defineSchema + defineTable
│   └── services/       ← actual Convex exports (args + handler + returns)
└── utils/
    ├── repository.ts   ← repository() + documentValidator()
    ├── context.ts      ← queryHandler / mutationHandler / authenticatedXxxHandler
    ├── authentication.ts ← authenticatedQuery / authenticatedMutation
    ├── validator.ts    ← omit / pick / extend / partial / deepPartial
    └── pagination.ts   ← paginated / paginationParams
```

---

## C2. Model Definitions (`definition/models/`)

Each table gets its own file in `definition/models/`. Export a single named const that is a `v.*` validator (usually `v.object(...)` or `v.union(...)`). No logic here — only schema shape.

```ts
// definition/models/booking.ts
import { v } from "convex/values";

export const booking = v.object({
  business: v.id("business"),
  by: v.id("profile"),
  at: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("cancelled"),
  ),
});
```

Use `v.union(v.literal(...), ...)` for discriminated union tables (e.g., `profile` with `type: "artist" | "client"`):

```ts
// definition/models/profile.ts
export const profile = v.union(
  v.object({ type: v.literal("artist"), user: v.string(), ... }),
  v.object({ type: v.literal("client"), user: v.string(), ... }),
);
```

---

## C3. Schema (`app/schema.ts`)

Import all model validators from `definition/models/` and define the schema with `defineSchema` + `defineTable`. Declare all indexes here.

```ts
// app/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { booking } from "@/definition/models/booking";
import { profile } from "@/definition/models/profile";

const schema = defineSchema({
  profile: defineTable(profile)
    .index("by_user", ["user"])
    .index("by_user_and_type", ["user", "type"]),
  booking: defineTable(booking)
    .index("by_business", ["business"])
    .index("by_profile_and_time", ["by", "at"]),
});

export default schema;
```

---

## C4. Repository Pattern

Use `repository(collectionName)` from `@/utils/repository` to get typed CRUD helpers. Never call `ctx.db` directly in service logic — always go through the repository.

```ts
// definition/services/booking.ts
import { repository } from "@/utils/repository";

const Booking = repository("booking");

// Available methods:
Booking.create(ctx, { data })          // → Id<T>
Booking.get(ctx, { id })               // → Doc<T> | null
Booking.update(ctx, { id, data })      // → void
Booking.list(ctx, partialFilter)       // → Doc<T>[]
Booking.destroy(ctx, { id })           // → void
Booking.paginate(ctx, { filter?, paginationOpts }) // → PaginationResult<Doc<T>>
Booking.replace(ctx, { id, data })     // → void
Booking.query(ctx)                     // → raw QueryBuilder for .withIndex(...) chains
Booking.stream(ctx)                    // → streaming QueryBuilder
```

Use `Booking.query(ctx).withIndex(...)` for index-based queries:

```ts
const results = await Booking.query(ctx)
  .withIndex("by_profile_and_time", (q) =>
    q.eq("by", ctx.session.profile._id).gt("at", Date.now()),
  )
  .paginate(paginationOpts);
```

---

## C5. Handler Helpers (`utils/context.ts`)

Wrap all service functions with a handler helper. These helpers type-narrow the context and args. Import from `@/utils/context`.

```ts
import {
  queryHandler,
  mutationHandler,
  actionHandler,
  authenticatedQueryHandler,
  authenticatedMutationHandler,
  authenticatedActionHandler,
} from "@/utils/context";
```

- `queryHandler` / `mutationHandler` / `actionHandler` — Unauthenticated. `ctx` is the plain Convex context.
- `authenticatedQueryHandler` / `authenticatedMutationHandler` / `authenticatedActionHandler` — Authenticated. `ctx` is extended with `ctx.session.profile` and `ctx.session.user`.

```ts
// ✅ Good — unauthenticated read
export const get = queryHandler(
  async (ctx, { id }: { id: Id<"booking"> }): Promise<Augmented<Booking> | null> => {
    const booking = await Booking.get(ctx, { id });
    if (!booking) return null;
    return { ...booking, business, services };
  },
);

// ✅ Good — authenticated mutation
export const book = authenticatedMutationHandler(
  async (ctx, { data }: { data: ... }) => {
    const id = await Booking.create(ctx, {
      data: { ...data, by: ctx.session.profile._id },
    });
    return id;
  },
);
```

---

## C6. Definition Services (`definition/services/`)

Each service file owns all business logic for one collection. Structure:

1. **`Internal` namespace** — Internal helpers (not exposed as Convex functions). Grouped as `export const Internal = { ... }`.
2. **`Type`** — The Augmented document type using `WithPopulation<collection, PopulationMap>`.
3. **Named type alias** — `export type Booking = Type` for ergonomics.
4. **`document`** — The document validator factory from `documentValidator()`.
5. **Named handler exports** — Each function exported individually, wrapped in a handler helper.

```ts
// definition/services/booking.ts
import { repository, documentValidator } from "@/utils/repository";
import { authenticatedQueryHandler, queryHandler } from "@/utils/context";
import type { WithPopulation, Augmented } from "@/utils/population";

const Booking = repository("booking");

export const Internal = {
  ...Booking,
  someHelper: queryHandler(async (ctx, args) => { ... }),
};

export type Type = WithPopulation<"booking", {
  business: Augmented<Business.Type>;
  services: Augmented<Service.Type>[];
}>;
export type Booking = Type;

export const document = documentValidator("booking", {
  business: Business.document(true, true),
  services: v.array(Service.document(true, true)),
});

export const get = queryHandler(async (ctx, { id }: { id: Id<"booking"> }) => {
  // ...
});

export const paginate = authenticatedQueryHandler(async (ctx, { paginationOpts }) => {
  // ...
});
```

---

## C7. App Services (`app/services/`)

App services are the actual Convex function registrations. Thin wrappers: declare `args`, `returns`, and point `handler` to the function from `definition/services/`. No business logic lives here.

```ts
// app/services/booking.ts
import { v } from "convex/values";
import * as Booking from "@/definition/services/booking";
import { authenticatedQuery, authenticatedMutation } from "@/utils/authentication";
import { paginated, paginationParams } from "@/utils/pagination";
import { omit } from "@/utils/validator";

export const get = authenticatedQuery({
  args: { id: v.id("booking") },
  handler: Booking.get,
  returns: v.union(v.null(), Booking.document(true, true)),
});

export const paginate = authenticatedQuery({
  args: paginationParams(),
  handler: Booking.paginate,
  returns: paginated(Booking.document(true, true)),
});

export const book = authenticatedMutation({
  args: { data: omit(Booking.document(), ["status", "by", "duration"]) },
  handler: Booking.book,
  returns: v.optional(v.id("booking")),
});
```

**Rules:**
- `authenticatedQuery` / `authenticatedMutation` / `authenticatedAction` — from `@/utils/authentication` — for authenticated endpoints.
- `query` / `mutation` / `action` — from `@/server` — for public endpoints.
- Always declare `returns:` explicitly.
- Always import handler from `definition/services/`, never write logic inline.

---

## C8. Document Validator Factory (`documentValidator`)

```ts
export const document = documentValidator("booking", {
  business: Business.document(true, true),
  services: v.array(Service.document(true, true)),
});

// Usage:
Booking.document()           // base validator (no system fields, no population)
Booking.document(true)       // Augmented (system fields omitted)
Booking.document(true, true) // Augmented + system fields (_id, _creationTime)
Booking.document(false, true)// base + system fields
```

- Use `document()` for mutation args.
- Use `document(true, true)` for `returns:` validators that represent full documents.
- Use `document(true)` for Augmented returns without system fields.

---

## C9. Validator Helpers (`utils/validator.ts`)

```ts
import { omit, pick, extend, partial, deepPartial } from "@/utils/validator";

omit(Booking.document(), ["status", "by", "duration"])
pick(Profile.document(), ["type", "user"])
extend(validator, { newField: v.string() })
partial(validator)
deepPartial(validator)
```

All helpers work correctly on `v.union(...)` validators by distributing the operation over each union member.

---

## C10. Pagination Helpers (`utils/pagination.ts`)

```ts
import { paginated, paginationParams } from "@/utils/pagination";

args: paginationParams()
args: paginationParams(Booking.document())
returns: paginated(Booking.document(true, true))
```

---

## C11. Population Pattern

Use `WithPopulation` + `Augmented` to express the difference between a raw document and a fully resolved document.

```ts
import type { WithPopulation, Augmented } from "@/utils/population";

export type Type = WithPopulation<
  "booking",
  {
    business: Augmented<Business.Type>; // replaces Id<"business">
    services: Augmented<Service.Type>[];// replaces Id<"service">[]
  }
>;
```

---

## C12. `definition/index.ts` — Type Re-exports

All externally consumed types are re-exported from `definition/index.ts`.

```ts
import type { Booking } from "@/definition";
import type { Id } from "@/definition";
```

When adding a new service type that should be externally accessible, add a `export type { ... } from "@/services/..."` line to `definition/index.ts`.

---

## C13. `Internal` Namespace for Non-Exposed Helpers

Group helpers that are only used within `definition/services/` under `export const Internal = { ... }`.

```ts
export const Internal = {
  ...Booking,
  getForBooking: queryHandler(async (ctx, { booking }) => { ... }),
  getOwner: queryHandler(async (ctx, { id }) => { ... }),
};
```

Internal functions are consumed by other definition services. Never registered directly in `app/services/`.

---

## C14. Error Handling in Convex

Use `ConvexError` for known failure states (not `Error`).

```ts
import { ConvexError } from "convex/values";

// ✅ Good — structured error
throw new ConvexError({ status: "unauthenticated", error: "User is not authenticated" });

// ✅ Good — string code
throw new ConvexError("room/failed");

// ❌ Bad — generic Error
throw new Error("not found");
```

---

## C15. Convex Summary Checklist

- [ ] Model validators live in `definition/models/` — pure `v.*`, no logic
- [ ] Schema in `app/schema.ts` — `defineSchema` + `defineTable` with indexes
- [ ] All DB access goes through `repository()` — never call `ctx.db` directly
- [ ] Business logic in `definition/services/` — wrapped in handler helpers
- [ ] App registrations in `app/services/` — thin: `args` + `handler` + `returns` only
- [ ] Use `queryHandler` / `mutationHandler` for unauthenticated handlers
- [ ] Use `authenticatedQueryHandler` / `authenticatedMutationHandler` for handlers requiring `ctx.session`
- [ ] Use `authenticatedQuery` / `authenticatedMutation` for app-layer registrations
- [ ] Always declare `returns:` explicitly in app service exports
- [ ] Use `documentValidator(collection, augmentation)` for all document validators
- [ ] Call `document()` for args, `document(true, true)` for returns with system fields
- [ ] Use `omit` / `pick` / `extend` / `partial` from `@/utils/validator`
- [ ] Use `paginated()` + `paginationParams()` for all paginated endpoints
- [ ] Use `WithPopulation<C, Map>` + `Augmented<T>` for Augmented document types
- [ ] Group internal helpers under `export const Internal = { ...repository, ... }`
- [ ] Re-export public types from `definition/index.ts`
- [ ] Throw `ConvexError` (not `Error`) for known failure states
