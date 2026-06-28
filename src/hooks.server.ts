import * as Sentry from "@sentry/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";

Sentry.init({
    dsn: "https://0e20b29e0aab621bc4e9eb20bf1e6681@o4508127968886784.ingest.de.sentry.io/4508128377765968",
    enableLogs: true
});

export const handle = sequence(Sentry.sentryHandle());
export const handleError = Sentry.handleErrorWithSentry();
