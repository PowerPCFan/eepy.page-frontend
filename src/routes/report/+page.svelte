<script lang="ts">
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import MaterialSymbolsShield from "~icons/material-symbols/shield-outline";
    import MaterialSymbolsBugReport from "~icons/material-symbols/bug-report-outline";
    import MaterialSymbolsArrowForward from "~icons/material-symbols/arrow-forward";
</script>

<svelte:head>
    <title>Report | eepy.page</title>
</svelte:head>

<div class="bg-card max-w-3xl sentry-unmask mt-8 mr-auto ml-auto w-11/12 rounded-2xl border border-border/60 p-6 sm:p-8 shadow-xs">
    <h1 class="text-3xl font-bold tracking-tight">What would you like to report?</h1>
    <p class="mt-2 text-muted-foreground text-sm sm:text-base">Select the category that best matches your issue to ensure it gets handled quickly and properly.</p>

    <div class="options mt-6 flex flex-col gap-4">
        <a
            href="/report/abuse-vuln"
            class="group flex items-start gap-4 rounded-xl border border-border/70 bg-background/50 p-5 transition-all duration-150 hover:border-primary/50 hover:bg-background/80 active:scale-[0.99]">
            <IconBadge variant="primary" size="lg">
                <MaterialSymbolsShield class="size-6" />
            </IconBadge>
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Abuse & Security Vulnerabilities</h2>
                    <MaterialSymbolsArrowForward class="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p class="mt-1 text-sm text-muted-foreground">Report phishing, malware, malicious subdomains, or responsible security vulnerability disclosures.</p>
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
                    <h2 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Software Bugs & Feature Requests</h2>
                    <MaterialSymbolsArrowForward class="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p class="mt-1 text-sm text-muted-foreground">Found a UI glitch, missing button, or broken feature? Open an issue on GitHub.</p>
            </div>
        </a>
    </div>
</div>
