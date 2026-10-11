<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import MaterialSymbolsMail from "~icons/material-symbols/mail-outline";
    import MaterialSymbolsShield from "~icons/material-symbols/shield-outline";
    import MaterialSymbolsGavel from "~icons/material-symbols/gavel";
    import MaterialSymbolsInfo from "~icons/material-symbols/info-outline";
    import MaterialSymbolsLock from "~icons/material-symbols/lock-outline";
    import MaterialSymbolsBugReport from "~icons/material-symbols/bug-report-outline";
    import MaterialSymbolsQuestionMark from "~icons/material-symbols/quiz-outline";
    import MaterialSymbolsArrowForward from "~icons/material-symbols/arrow-forward";
    import Codeblock from "$lib/components/ui/codeblock/codeblock.svelte";
</script>

<svelte:head>
    <title>Support Center | eepy.page</title>
</svelte:head>

<div class="mx-auto w-11/12 max-w-6xl py-8 sm:py-12">
    <div class="mb-8 max-w-2xl">
        <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">eepy.page support center</h1>
    </div>

    <div class="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 backdrop-blur-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-4">
                <IconBadge variant="primary" size="md" class="mt-1">
                    <MaterialSymbolsQuestionMark class="size-6" />
                </IconBadge>
                <div class="space-y-1">
                    <h2 class="text-lg font-semibold text-foreground">Have a question? Check the FAQ first</h2>
                    <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-xl">
                        Most common questions about eepy.page are answered in our FAQ. However, don't be afraid to reach out if you have a more specific issue that's not covered!
                    </p>
                </div>
            </div>
            <div class="shrink-0 pt-2 sm:pt-0">
                <Button href="/faq" class="w-full sm:w-auto">
                    <span>Browse FAQ</span>
                    <MaterialSymbolsArrowForward class="size-4" />
                </Button>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="border-border bg-card/75 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all shadow-xs">
            <div class="space-y-3">
                <IconBadge variant="primary" size="md">
                    <MaterialSymbolsMail class="size-5" />
                </IconBadge>
                <h3 class="text-lg font-semibold text-foreground">General Inquiries</h3>
                <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Have questions regarding your account, DNS setup, or custom domains?
                    Reach out directly via email at <Codeblock variant="inline" class="px-px text-inherit" text="support@eepy.page" />.
                </p>
            </div>
            <div class="pt-4 border-t border-border">
                <Button variant="secondary" class="w-full" href="mailto:support@eepy.page">
                    <MaterialSymbolsMail class="size-4" />
                    Email Support
                </Button>
            </div>
        </div>

        <div class="border-border bg-card/75 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all shadow-xs">
            <div class="space-y-3">
                <IconBadge variant="primary" size="md">
                    <MaterialSymbolsShield class="size-5" />
                </IconBadge>
                <h3 class="text-lg font-semibold text-foreground">Security & Abuse</h3>
                <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Need to report any malicious subdomains, phishing, malware, or security vulnerabilities? Use our Report Hub.
                </p>
            </div>
            <div class="mt-6 pt-4 border-t border-border">
                <Button variant="secondary" class="w-full" href="/report">
                    <MaterialSymbolsShield class="size-4" />
                    Visit Report Hub
                </Button>
            </div>
        </div>

        <div class="border-border bg-card/75 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all shadow-xs">
            <div class="space-y-3">
                <IconBadge variant="primary" size="md">
                    <MaterialSymbolsBugReport class="size-5" />
                </IconBadge>
                <h3 class="text-lg font-semibold text-foreground">Software Bugs & Feature Requests</h3>
                <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Want to report UI glitches, request features, suggest improvements, or report other bugs? Open a GitHub issue via our Report Hub!
                </p>
            </div>
            <div class="mt-6 pt-4 border-t border-border">
                <Button variant="secondary" class="w-full" href="/report">
                    <MaterialSymbolsBugReport class="size-4" />
                    Visit Report Hub
                </Button>
            </div>
        </div>

        <div class="border-border bg-card/75 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all shadow-xs col-span-3">
            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-foreground">Terms & Privacy Policy</h3>
                    <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        Review our terms of service and privacy policy to understand our rules and policies.
                    </p>
                    <div class="flex flex-wrap gap-3 pt-2">
                        <Button variant="ghost" size="sm" href="/terms">
                            <MaterialSymbolsGavel class="size-4" />
                            Terms of Service
                        </Button>
                        <Button variant="ghost" size="sm" href="/privacy">
                            <MaterialSymbolsLock class="size-4" />
                            Privacy Policy
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-foreground">Diagnostic Info</h3>
                    <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        View diagnostic information about your setup. We would appreciate if you include this information when submitting bug reports!
                    </p>
                    <div class="flex flex-wrap gap-3 pt-2">
                        <Button variant="ghost" size="sm" href="/support/info">
                            <MaterialSymbolsInfo class="size-4" />
                            View Diagnostics
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
