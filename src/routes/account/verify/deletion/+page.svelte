<script lang="ts">
    import { redirectToLogin } from "$lib";
    import { t } from "$lib/i18n";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import Loader from "$lib/components/ui/loader/loader.svelte";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import MaterialSymbolsWarning from "~icons/material-symbols/warning-rounded";
    import MaterialSymbolsCheckCircle from "~icons/material-symbols/check-circle";
    import { CodeError, UserError, verifyDeletion } from "../../../../serverContactor";
    import { onMount } from "svelte";

    let doneVerifying: boolean = $state(false);
    let valid: boolean = $state(false);
    let clicked: boolean = $state(false);
    let loading: boolean = $state(false);
    let noDeletionCode: boolean = $state(false);

    function confirmDeletion() {
        clicked = true;
        loading = true;
        const urlParams = new URLSearchParams(window.location.search);

        verifyDeletion(urlParams.get("code") || "undefined")
            .then(() => {
                valid = true;
                doneVerifying = true;
                loading = false;
            })
            .catch((err) => {
                if (err instanceof CodeError) console.error("Code is invalid");
                if (err instanceof UserError) console.error("User does not exist");
                valid = false;
                doneVerifying = true;
                loading = false;
            });
    }

    $effect(() => {
        if (valid) redirectToLogin(200, 3);
    });

    onMount(() => {
        let params = new URLSearchParams(window.location.search);
        let code = params.get("code");
        console.log(params);
        console.log(code);
        if (!((code?.length ?? 0) > 1)) noDeletionCode = true;
    });
</script>

<svelte:head>
    <title>Confirm Account Deletion | eepy.page</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if !noDeletionCode}
    <Holder>
        <div class="space-y-6 py-2">
            <div class="flex items-center gap-3">
                <IconBadge variant="destructive" size="md">
                    <MaterialSymbolsWarning class="size-6" />
                </IconBadge>
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">{t("auth.accountDeletion.title")}</h1>
                    <p class="text-muted-foreground text-sm">
                        {t("auth.accountDeletion.lead")}
                        <span class="font-semibold">{t("auth.accountDeletion.warning")}</span>
                    </p>
                </div>
            </div>

            {#if !clicked}
                <div class="border-destructive/30 bg-destructive/5 space-y-2 rounded-xl border p-5">
                    <p class="text-foreground text-sm font-medium">
                        {t("auth.accountDeletion.confirmLead")}
                    </p>
                    <ul class="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm">
                        <li>{t("auth.accountDeletion.bullet1")}</li>
                        <li>{t("auth.accountDeletion.bullet2")}</li>
                        <li>{t("auth.accountDeletion.bullet3")}</li>
                        <li>{t("auth.accountDeletion.bullet4")}</li>
                    </ul>
                </div>

                <div class="flex flex-wrap items-center gap-3 pt-2">
                    <Button variant="destructive" class="cursor-pointer" onclick={confirmDeletion}>{t("auth.accountDeletion.confirmButton")}</Button>
                    <Button variant="ghost" href="/dashboard">{t("auth.accountDeletion.cancelButton")}</Button>
                </div>
            {:else if loading}
                <div class="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <Loader asForeground />
                    <p class="text-muted-foreground text-sm">{t("auth.accountDeletion.verifying")}</p>
                </div>
            {:else if doneVerifying && valid}
                <div class="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <IconBadge variant="primary" size="lg" shape="circle">
                        <MaterialSymbolsCheckCircle class="size-7" />
                    </IconBadge>
                    <h2 class="text-xl font-bold">{t("auth.accountDeletion.successTitle")}</h2>
                    <p class="text-muted-foreground text-sm">{t("auth.accountDeletion.successDesc")}</p>
                </div>
            {:else if doneVerifying && !valid}
                <div class="space-y-4">
                    <InlineAlert
                        variant="error"
                        title={t("auth.accountDeletion.invalidTitle")}
                        description={t("auth.accountDeletion.invalidDesc")} />
                    <div class="pt-2">
                        <Button variant="secondary" href="/account/manage">{t("auth.accountDeletion.backToSettings")}</Button>
                    </div>
                </div>
            {/if}
        </div>
    </Holder>
{:else}
    <Holder>
        <div class="space-y-3 py-2 px-2">
            <h1 class="text-2xl font-bold tracking-tight">{t("auth.accountDeletion.noCodeTitle")}</h1>
            <p class="text-muted-foreground text-sm leading-relaxed">
                {t("auth.accountDeletion.noCodeDesc")}
            </p>

            <div class="flex flex-wrap items-center gap-3 mt-4">
                <Button variant="default" href="/account/manage">{t("auth.accountDeletion.goToSettings")}</Button>
                <Button variant="ghost" href="/dashboard">{t("auth.accountDeletion.backToDashboard")}</Button>
            </div>
        </div>
    </Holder>
{/if}