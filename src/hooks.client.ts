import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";

Sentry.init({
    dsn: "https://0282a25a9d71818a00050d292b033a20@o4511644088139776.ingest.us.sentry.io/4511644093775872",
    enableLogs: true,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 0.2,
    sampleRate: 0.2,
    tracesSampleRate: 0.05,
    tunnel: "/sentry",
    integrations: [replayIntegration()]
});

export const handleError = handleErrorWithSentry();
