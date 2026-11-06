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
    import { t } from "$lib/i18n";

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
        toast.success(t("support.abuseVuln.templateCopied", { desc }));
        latestCopied = desc;
        setTimeout(() => {
            latestCopied = null;
        }, 4000);
    }
</script>

<svelte:head>
    <title>{t("support.abuseVuln.title")} | eepy.page</title>
    <meta
        name="description"
        content="Report subdomain abuse, malware, phishing, or security vulnerabilities to the eepy.page security team." />
    <link rel="canonical" href="https://www.eepy.page/report/abuse-vuln" />
    <meta property="og:title" content="{t("support.abuseVuln.title")} | eepy.page" />
    <meta
        property="og:description"
        content="Report subdomain abuse, malware, phishing, or security vulnerabilities to the eepy.page security team." />
    <meta property="og:url" content="https://www.eepy.page/report/abuse-vuln" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="{t("support.abuseVuln.title")} | eepy.page" />
    <meta
        name="twitter:description"
        content="Report subdomain abuse, malware, phishing, or security vulnerabilities to the eepy.page security team." />
    <meta name="twitter:url" content="https://www.eepy.page/report/abuse-vuln" />
</svelte:head>

<main class="mx-auto w-11/12 max-w-4xl py-8 sm:py-12">
    <h1 class="text-3xl font-bold tracking-tight text-foreground">{t("support.abuseVuln.title")}</h1>

    <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm">
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <IconBadge variant="primary" size="md">
                        <MaterialSymbolsShield class="size-6" />
                    </IconBadge>
                    <h2 class="text-lg font-semibold text-foreground">{t("support.abuseVuln.vulnTitle")}</h2>
                </div>

                <p class="text-muted-foreground text-xs leading-relaxed">
                    {t("support.abuseVuln.vulnPrompt")}
                </p>

                <ul class="text-muted-foreground list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
                    <li>{t("support.abuseVuln.vulnItems.item1")}</li>
                    <li>{t("support.abuseVuln.vulnItems.item2")}</li>
                    <li>{t("support.abuseVuln.vulnItems.item3")}</li>
                    <li>{t("support.abuseVuln.vulnItems.item4")}</li>
                    <li>{t("support.abuseVuln.vulnItems.item5")}</li>
                </ul>
            </div>

            <div class="mt-6 pt-4 border-t border-border">
                <Button class="w-full" target="_blank" href={createMailtoLink("eepy.page Security Vulnerability Report", vulnBody)}>
                    <MaterialSymbolsMail class="size-4" />
                    {t("support.abuseVuln.vulnButton")}
                </Button>
            </div>
        </div>

        <div class="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm">
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <IconBadge size="md">
                        <MaterialSymbolsReport class="size-6" />
                    </IconBadge>
                    <h2 class="text-lg font-semibold text-foreground">{t("support.abuseVuln.abuseTitle")}</h2>
                </div>

                <p class="text-muted-foreground text-xs leading-relaxed">
                    {t("support.abuseVuln.abusePrompt")}
                </p>

                <ul class="text-muted-foreground list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
                    <li>{t("support.abuseVuln.abuseItems.item1", { example: "example.eepy.page" })}</li>
                    <li>{t("support.abuseVuln.abuseItems.item2")}</li>
                    <li>{t("support.abuseVuln.abuseItems.item3")}</li>
                </ul>
            </div>

            <div class="mt-6 pt-4 border-t border-border">
                <Button class="w-full" target="_blank" href={createMailtoLink("eepy.page Abuse Report", abuseBody)}>
                    <MaterialSymbolsMail class="size-4" />
                    {t("support.abuseVuln.abuseButton")}
                </Button>
            </div>
        </div>

        <div class="col-span-2 mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-6 backdrop-blur-sm">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-start gap-4">
                    <IconBadge variant="primary" size="md"><MaterialSymbolsQuestionMark class="size-6" /></IconBadge>
                    <div>
                        <h2 class="text-lg font-semibold text-foreground">{t("support.abuseVuln.emailSectionTitle")}</h2>
                        <p class="text-muted-foreground text-sm leading-relaxed">
                            {t("support.abuseVuln.emailSectionDesc", { email: "report@eepy.page" })}
                        </p>
                    </div>
                </div>
                <div class="flex-col space-y-3">
                    <Button size="sm" class="min-w-full px-4!" variant="outline" onclick={() => copy(vulnBody, t("support.abuseVuln.copyVulnTemplate"))}>
                        {#if latestCopied === t("support.abuseVuln.copyVulnTemplate")}
                            <MaterialSymbolsCheckRounded class="size-4 text-green-500" />
                        {:else}
                            <MaterialSymbolsContentCopy class="size-4" />
                            {t("support.abuseVuln.copyVulnTemplate")}
                        {/if}
                    </Button>
                    <Button size="sm" class="min-w-full px-4!" variant="outline" onclick={() => copy(abuseBody, t("support.abuseVuln.copyAbuseTemplate"))}>
                        {#if latestCopied === t("support.abuseVuln.copyAbuseTemplate")}
                            <MaterialSymbolsCheckRounded class="size-4 text-green-500" />
                        {:else}
                            <MaterialSymbolsContentCopy class="size-4" />
                            {t("support.abuseVuln.copyAbuseTemplate")}
                        {/if}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</main>
