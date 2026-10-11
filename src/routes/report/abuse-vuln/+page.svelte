<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import { toast } from "svelte-sonner";
    import MaterialSymbolsShield from "~icons/material-symbols/shield-outline";
    import MaterialSymbolsReport from "~icons/material-symbols/report-outline";
    import MaterialSymbolsMail from "~icons/material-symbols/mail-rounded";
    import MaterialSymbolsQuestionMark from "~icons/material-symbols/question-mark";
    import MaterialSymbolsContentCopy from "~icons/material-symbols/content-copy";
    import MaterialSymbolsCheckRounded from "~icons/material-symbols/check-rounded";

    let latestCopied: string | null = $state(null);

    const vulnBody = `Vulnerability Report:
<Try your best to answer the following questions. Skip any that don't apply or that you're unsure about>

The feature that's vulnerable:
Expected behavior:
Actual behavior:
Issue importance (0-5):
Vulnerability description:
Steps to reproduce:
Vulnerability impacts/how an attacker could use it maliciously:
Other relevant information we should know:`;

    const abuseBody = `Abuse Report:
<Try your best to answer the following questions. Skip any that don't apply or that you're unsure about>

Target subdomain (e.g. example.eepy.page)
Evidence of policy violation or phishing (e.g. screenshots)
Any additional context necessary (this may vary depending on the situation)
`;

    function createMailtoLink(subject: string, body: string): string {
        return `mailto:report@eepy.page?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    async function copy(text: string, desc: string) {
        await window.navigator.clipboard.writeText(text);
        toast.success(`${desc} copied to clipboard!`);
        latestCopied = desc;
        setTimeout(() => {
            latestCopied = null;
        }, 4000);
    }
</script>

<svelte:head>
    <title>Report Abuse & Vulnerabilities | eepy.page</title>
</svelte:head>

<main class="mx-auto w-11/12 max-w-4xl py-8 sm:py-12">
    <h1 class="text-3xl font-bold tracking-tight text-foreground">Report Abuse & Vulnerabilities</h1>

    <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm">
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <IconBadge variant="primary" size="md">
                        <MaterialSymbolsShield class="size-6" />
                    </IconBadge>
                    <h2 class="text-lg font-semibold text-foreground">Report Vulnerabilities</h2>
                </div>

                <p class="text-muted-foreground text-xs leading-relaxed">
                    Please provide the following details when submitting a vulnerability report:
                </p>

                <ul class="text-muted-foreground list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
                    <li>The feature that's vulnerable</li>
                    <li>A description of the vulnerability</li>
                    <li>Expected vs actual behavior</li>
                    <li>Reproduction steps</li>
                    <li>How an attacker could use the vulnerability</li>
                </ul>
            </div>

            <div class="mt-6 pt-4 border-t border-border">
                <Button class="w-full" target="_blank" href={createMailtoLink("eepy.page Security Vulnerability Report", vulnBody)}>
                    <MaterialSymbolsMail class="size-4" />
                    Report Vulnerability
                </Button>
            </div>
        </div>

        <div class="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm">
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <IconBadge size="md">
                        <MaterialSymbolsReport class="size-6" />
                    </IconBadge>
                    <h2 class="text-lg font-semibold text-foreground">Abuse & Phishing</h2>
                </div>

                <p class="text-muted-foreground text-xs leading-relaxed">
                    To report malicious subdomains, phishing, malware, or illicit hosting:
                </p>

                <ul class="text-muted-foreground list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
                    <li>Target subdomain (e.g. <span class="font-mono!">example.eepy.page</span>)</li>
                    <li>Evidence of policy violation or phishing (e.g. screenshots)</li>
                    <li>Any additional context necessary (this may vary depending on the situation)</li>
                </ul>
            </div>

            <div class="mt-6 pt-4 border-t border-border">
                <Button class="w-full" target="_blank" href={createMailtoLink("eepy.page Abuse Report", abuseBody)}>
                    <MaterialSymbolsMail class="size-4" />
                    Report Abuse
                </Button>
            </div>
        </div>

        <div class="col-span-2 mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-6 backdrop-blur-sm">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-start gap-4">
                    <IconBadge variant="primary" size="md"><MaterialSymbolsQuestionMark class="size-6" /></IconBadge>
                    <div>
                        <h2 class="text-lg font-semibold text-foreground">Prefer sending an email manually?</h2>
                        <p class="text-muted-foreground text-sm leading-relaxed">
                            Please send us a report at <a href="mailto:support@eepy.page" class="text-primary hover:underline">report@eepy.page</a>.
                            Make sure to follow the guidelines listed above to ensure your report can be handled quickly and properly.
                            Copy the report templates using the buttons to the right.
                        </p>
                    </div>
                </div>
                <div class="flex-col space-y-3">
                    <Button size="sm" class="min-w-full px-4!" variant="outline" onclick={() => copy(vulnBody, "Vulnerability report template")}>
                        {#if latestCopied === "Vulnerability report template"}
                            <MaterialSymbolsCheckRounded class="size-4 text-green-500" />
                        {:else}
                            <MaterialSymbolsContentCopy class="size-4" />
                            Copy Vulnerability Report Template
                        {/if}
                    </Button>
                    <Button size="sm" class="min-w-full px-4!" variant="outline" onclick={() => copy(abuseBody, "Abuse report template")}>
                        {#if latestCopied === "Abuse report template"}
                            <MaterialSymbolsCheckRounded class="size-4 text-green-500" />
                        {:else}
                            <MaterialSymbolsContentCopy class="size-4" />
                            Copy Abuse Report Template
                        {/if}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</main>
