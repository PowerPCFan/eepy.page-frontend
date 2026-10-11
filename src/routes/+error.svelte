<svelte:options runes={true} />

<script lang="ts">
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import MaterialSymbolsWarning from "~icons/material-symbols/warning-outline-rounded";

    const statusCodeToReasonPhrase: Record<number, string> = {
        202: "Accepted",
        502: "Bad Gateway",
        400: "Bad Request",
        409: "Conflict",
        100: "Continue",
        201: "Created",
        417: "Expectation Failed",
        424: "Failed Dependency",
        403: "Forbidden",
        504: "Gateway Timeout",
        410: "Gone",
        505: "HTTP Version Not Supported",
        418: "I'm a teapot",
        419: "Insufficient Space on Resource",
        507: "Insufficient Storage",
        500: "Internal Server Error",
        411: "Length Required",
        423: "Locked",
        420: "Method Failure",
        405: "Method Not Allowed",
        301: "Moved Permanently",
        302: "Moved Temporarily",
        207: "Multi-Status",
        300: "Multiple Choices",
        511: "Network Authentication Required",
        204: "No Content",
        203: "Non Authoritative Information",
        406: "Not Acceptable",
        404: "Not Found",
        501: "Not Implemented",
        304: "Not Modified",
        200: "OK",
        206: "Partial Content",
        402: "Payment Required",
        308: "Permanent Redirect",
        412: "Precondition Failed",
        428: "Precondition Required",
        102: "Processing",
        103: "Early Hints",
        426: "Upgrade Required",
        407: "Proxy Authentication Required",
        431: "Request Header Fields Too Large",
        408: "Request Timeout",
        413: "Request Entity Too Large",
        414: "Request-URI Too Long",
        416: "Requested Range Not Satisfiable",
        205: "Reset Content",
        303: "See Other",
        503: "Service Unavailable",
        101: "Switching Protocols",
        307: "Temporary Redirect",
        429: "Too Many Requests",
        401: "Unauthorized",
        451: "Unavailable For Legal Reasons",
        422: "Unprocessable Entity",
        415: "Unsupported Media Type",
        305: "Use Proxy",
        421: "Misdirected Request",
    };

    function getHeading() {
        return statusCodeToReasonPhrase[page.status] ?? "Something went wrong";
    }
</script>

<svelte:head>
    <title>{page.status} | eepy.page</title>
</svelte:head>

<main class="flex min-h-[75vh] w-full items-center justify-center px-4 py-16">
    <div class="border-border bg-card/60 sentry-unmask flex w-full max-w-md flex-col items-center rounded-2xl border p-8 text-center shadow-sm backdrop-blur-sm">
        <IconBadge variant="primary" size="xl" shape="circle" class="mb-4">
            <MaterialSymbolsWarning class="size-7" />
        </IconBadge>
        <span class="text-primary text-xl font-semibold">Error {page.status}</span>
        <h1 class="text-foreground mt-1 text-2xl font-bold tracking-tight">{getHeading()}</h1>

        <div class="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button variant="default" onclick={() => window.history.back()}>Go Back</Button>
            <Button variant="secondary" href="/">Go Home</Button>
        </div>
    </div>
</main>
