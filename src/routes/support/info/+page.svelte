<script lang="ts">
    import { browser } from "$app/environment";
    import { getAuthToken, ServerContactor, serverURL } from "$lib";
    import { t } from "$lib/i18n";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import MaterialSymbolsContentCopy from "~icons/material-symbols/content-copy";
    import copy from "clipboard-copy";
    import { toast } from "svelte-sonner";

    // @ts-expect-error | defined in vite.config.ts
    const commit = typeof __BUILD_COMMIT__ !== "undefined" ? __BUILD_COMMIT__ : "development";

    let deviceWidth: number = $state(0);
    let deviceHeight: number = $state(0);
    let userAgent: string = $state("unknown");
    let userId: string = $state("Loading...");
    let ipAddress: string = $state("Loading...");

    let formattedInfo = $derived(`Commit: ${commit}
Server: ${serverURL}
Resolution: ${deviceWidth}x${deviceHeight}
User Agent: ${userAgent}
Username: ${userId}
IP Address: ${ipAddress}`);

    function copyInfo() {
        copy(formattedInfo);
        toast.success(t("support.diagnostics.copied"));
    }

    if (browser) {
        userAgent = navigator.userAgent;

        const token = getAuthToken();
        if (!token) {
            userId = "Not logged in";
        } else {
            const serverContactor = new ServerContactor(token);
            serverContactor.getAccountSettings().then(data => { userId = data.username; }).catch(() => { userId = "Unauthenticated / Session expired"; });
        }

        (async () => { try { ipAddress = (await (await fetch("https://c.myip.wtf/json")).json()).YourIPAddress } catch (e) {} })()
    }
</script>

<svelte:head>
    <title>Technical Info | eepy.page</title>
</svelte:head>

<svelte:window bind:innerHeight={deviceHeight} bind:innerWidth={deviceWidth} />

<Holder>
    <div class="space-y-6 py-2">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">{t("support.diagnostics.title")}</h1>
            <p class="text-muted-foreground text-sm">{t("support.diagnostics.description")}</p>
        </div>

        <div class="rounded-xl border border-border bg-card/60 p-4">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div>
                    <span class="text-muted-foreground text-xs block font-medium">{t("support.diagnostics.commit")}</span>
                    <span class="font-mono text-foreground font-medium">{commit}</span>
                </div>
                <div>
                    <span class="text-muted-foreground text-xs block font-medium">{t("support.diagnostics.server")}</span>
                    <span class="font-mono text-foreground font-medium truncate block">{serverURL}</span>
                </div>
                <div>
                    <span class="text-muted-foreground text-xs block font-medium">{t("support.diagnostics.resolution")}</span>
                    <span class="font-mono text-foreground font-medium">{deviceWidth} × {deviceHeight}</span>
                </div>
                <div>
                    <span class="text-muted-foreground text-xs block font-medium">{t("support.diagnostics.username")}</span>
                    <span class="font-medium text-foreground">{userId}</span>
                </div>
                <div>
                    <span class="text-muted-foreground text-xs block font-medium">{t("support.diagnostics.ipAddress")}</span>
                    <span class="font-mono text-foreground font-medium">{ipAddress}</span>
                </div>
                <div class="sm:col-span-2">
                    <span class="text-muted-foreground text-xs block font-medium">{t("support.diagnostics.userAgent")}</span>
                    <span class="font-mono text-xs text-foreground/80 break-all">{userAgent}</span>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
            <Button onclick={copyInfo}>
                <MaterialSymbolsContentCopy class="size-4" />
                {t("support.diagnostics.copyButton")}
            </Button>
        </div>
    </div>
</Holder>
