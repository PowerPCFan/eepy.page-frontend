<script lang="ts">
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import { t } from "$lib/i18n";
    import MaterialSymbolsShield from "~icons/material-symbols/shield-outline";
    import MaterialSymbolsBugReport from "~icons/material-symbols/bug-report-outline";
    import MaterialSymbolsArrowForward from "~icons/material-symbols/arrow-forward";
</script>

<svelte:head>
    <title>Report an Issue | eepy.page</title>
    <meta
        name="description"
        content="Help us keep the platform safe by submitting reports for abuse, malicious content, vulnerabilities, bugs, and more." />
    <link rel="canonical" href="https://www.eepy.page/report" />
    <meta property="og:title" content="Report an Issue | eepy.page" />
    <meta
        property="og:description"
        content="Help us keep the platform safe by submitting reports for abuse, malicious content, vulnerabilities, bugs, and more." />
    <meta property="og:url" content="https://www.eepy.page/report" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="Report an Issue | eepy.page" />
    <meta
        name="twitter:description"
        content="Help us keep the platform safe by submitting reports for abuse, malicious content, vulnerabilities, bugs, and more." />
    <meta name="twitter:url" content="https://www.eepy.page/report" />
</svelte:head>

<div class="bg-card max-w-3xl sentry-unmask mt-8 mr-auto ml-auto w-11/12 rounded-2xl border border-border/60 p-6 sm:p-8 shadow-xs">
    <h1 class="text-3xl font-bold tracking-tight">{t("support.reportHub.title")}</h1>
    <p class="mt-2 text-muted-foreground text-sm sm:text-base">{t("support.reportHub.lead")}</p>

    <div class="options mt-6 flex flex-col gap-4">
        <a
            href="/report/abuse-vuln"
            class="group flex items-start gap-4 rounded-xl border border-border/70 bg-background/50 p-5 transition-all duration-150 hover:border-primary/50 hover:bg-background/80 active:scale-[0.99]">
            <IconBadge variant="primary" size="lg">
                <MaterialSymbolsShield class="size-6" />
            </IconBadge>
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{t("support.reportHub.abuseTitle")}</h2>
                    <MaterialSymbolsArrowForward class="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p class="mt-1 text-sm text-muted-foreground">{t("support.reportHub.abuseDesc")}</p>
            </div>
        </a>

        <a
            href="https://github.com/PowerPCFan/eepy.page-frontend/issues/new"
            target="_blank"
            rel="noreferrer"
            class="group flex items-start gap-4 rounded-xl border border-border/70 bg-background/50 p-5 transition-all duration-150 hover:border-primary/50 hover:bg-background/80 active:scale-[0.99]">
            <IconBadge variant="primary" size="lg">
                <MaterialSymbolsBugReport class="size-6" />
            </IconBadge>
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{t("support.reportHub.bugsTitle")}</h2>
                    <MaterialSymbolsArrowForward class="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p class="mt-1 text-sm text-muted-foreground">{t("support.reportHub.bugsDesc")}</p>
            </div>
        </a>
    </div>
</div>
