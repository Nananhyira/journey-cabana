/**
 * Centralized config. This app has no real secrets — no third-party API
 * keys, no DB credentials, no signing keys — so there's no .env file to
 * load. PORT is read directly from the environment (still in one place,
 * not scattered `process.env.X` calls). If a real secret is ever needed,
 * this is where env-based config would expand to.
 */
export const config = {
  port: Number(process.env.PORT ?? 4000),
};
