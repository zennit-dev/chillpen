import { headers } from "next/headers";
import type * as Session from "@/server/app/session";
import type * as User from "@/server/app/user";
import { schema } from "@/server/database";
import {
  type ContextedAction,
  defineWithContext,
  type Enhancer,
  type GenericContext,
  type WithContextParams,
} from "./context";
import { Environment } from "./environment";
import { UnauthenticatedError } from "./error";
import { repository } from "./repository";

// Use the repository directly — importing `@/server/app/user` here creates a
// circular TDZ with `withAuthentication` (user.ts imports this module).
const { get: getUser } = repository(schema.user);

export type AuthenticatedContext = GenericContext & {
  session: { user: User.Type; session: Session.Type };
};

/**
 * Prefer the Drizzle user row over better-auth's session.user payload.
 * Custom columns like `role` can be missing from the Better Auth session
 * snapshot — which silently failed every `withAuthorization(["admin"])` gate
 * (admin panel bounced to `/` even for a real admin).
 */
export const authenticate: Enhancer<
  GenericContext,
  AuthenticatedContext,
  UnauthenticatedError
> = async (base) => {
  const session = await base.auth.getSession({
    headers: await headers(),
  });

  if (!session)
    return {
      success: false,
      error: new UnauthenticatedError("Unauthenticated"),
    };

  const profile = await getUser(Environment.SERVER, session.user.id);
  if (!profile.success || !profile.data)
    return {
      success: false,
      error: new UnauthenticatedError("Unauthenticated"),
    };

  base.span.setAttribute("session.id", session.session.id);
  base.span.setAttribute("session.user.id", profile.data.id);
  if (profile.data.role)
    base.span.setAttribute("session.user.role", profile.data.role);

  return {
    success: true,
    data: {
      ...base,
      session: {
        user: profile.data,
        session: session.session as Session.Type,
      },
    },
  };
};

export const withAuthentication = <
  T extends ContextedAction<AuthenticatedContext>,
>(
  ...args: WithContextParams<AuthenticatedContext, T>
) => {
  const handler = defineWithContext(authenticate);
  return handler(...args);
};
