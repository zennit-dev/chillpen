// Typed environment so `process.env.X` dot-access satisfies
// `noPropertyAccessFromIndexSignature`. NODE_ENV is intentionally omitted —
// Next.js already declares it.

declare namespace NodeJS {
  interface ProcessEnv {
    // core
    APP_HOST: string;
    NEXT_RUNTIME: string;
    CI: string;
    npm_package_name: string;
    npm_package_version: string;
    // database
    DATABASE_URL: string;
    // auth
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    SHOPIFY_CLIENT_ID: string;
    SHOPIFY_CLIENT_SECRET: string;
    SHOPIFY_AUTHORIZATION_URL: string;
    SHOPIFY_TOKEN_URL: string;
    // email
    RESEND_API_KEY: string;
    FROM_EMAIL: string;
    // payments
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_SUB_READER: string;
    STRIPE_SUB_COMPETE: string;
    STRIPE_SUB_DOMINATE: string;
    // storage
    UPLOADTHING_TOKEN: string;
    // durable
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    // ai
    AZURE_API_KEY: string;
    AZURE_RESOURCE_NAME: string;
    // observability
    SENTRY_DSN: string;
    NEXT_PUBLIC_SENTRY_DSN: string;
  }
}
