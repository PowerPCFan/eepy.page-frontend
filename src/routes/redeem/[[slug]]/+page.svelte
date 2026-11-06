<script lang="ts">
    import { browser } from "$app/environment";
    import { AuthError, getAuthToken, redirectToLogin, ServerContactor } from "$lib";
    import { t } from "$lib/i18n";
    import Holder from "$lib/components/Holder.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Loader from "$lib/components/ui/loader/loader.svelte";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import MaterialSymbolsCheckCircle from "~icons/material-symbols/check-circle";
    import consola from "consola";
    import { Confetti } from "svelte-confetti";

    let { data } = $props();

    let success: boolean | undefined = $state(undefined);
    let inputValue: string = $state("");
    let inputRequired: boolean = $state(false);
    let loading: boolean = $state(false);

    $effect(() => {
        if (!browser) return;

        const code = data["code"];

        if (!code) {
            inputRequired = true;
            success = undefined;
            return;
        }

        redeem(code);
    });

    async function redeem(code: string) {
        if (!code.trim()) return;
        inputRequired = false;
        success = undefined;
        loading = true;
        let serverContactor = new ServerContactor(getAuthToken() ?? "");
        try {
            await serverContactor.redeemCode(code.trim());
            consola.log("successfully redeemed!");
            success = true;
        } catch (error) {
            consola.log("Failed to redeem", error);
            if (error instanceof AuthError) {
                redirectToLogin(460);
                return;
            }

            inputRequired = true;
            success = false;
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Redeem Code | eepy.page</title>
</svelte:head>

<Holder>
    <div class="relative py-2">
        {#if loading || success === undefined && !inputRequired}
            <div class="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <Loader asForeground={true} />
                <h1 class="text-2xl font-bold tracking-tight">{t("dashboard.redemption.activating")}</h1>
                <p class="text-muted-foreground text-sm">{t("dashboard.redemption.activatingDesc")}</p>
            </div>
        {:else if success === true}
            <div class="flex flex-col items-center justify-center py-8 text-center space-y-4 relative">
                <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <Confetti
                        colorArray={["#9333ea", "#3b82f6", "#10b981", "#f59e0b"]}
                        cone
                        fallDistance={"80px"}
                        amount={100}
                        x={[-1.5, 1.5]} />
                </div>
                <IconBadge variant="primary" size="xl" shape="circle">
                    <MaterialSymbolsCheckCircle class="size-8" />
                </IconBadge>
                <h1 class="text-2xl font-bold tracking-tight">{t("dashboard.redemption.successTitle")}</h1>
                <p class="text-muted-foreground text-sm">{t("dashboard.redemption.successDesc")}</p>
                <div class="pt-2">
                    <Button href="/dashboard">{t("dashboard.redemption.goToDashboard")}</Button>
                </div>
            </div>
        {:else}
            <div class="space-y-6">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">{t("dashboard.redemption.title")}</h1>
                    <p class="text-muted-foreground text-sm">{t("dashboard.redemption.lead")}</p>
                </div>

                {#if success === false}
                    <InlineAlert
                        variant="error"
                        title={t("dashboard.redemption.failedTitle")}
                        description={t("dashboard.redemption.failedDesc")} />
                {/if}

                <form onsubmit={(e) => { e.preventDefault(); redeem(inputValue); }} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="redeem-code">{t("dashboard.redemption.codeLabel")}</Label>
                        <Input
                            id="redeem-code"
                            bind:value={inputValue}
                            placeholder={t("dashboard.redemption.codePlaceholder")}
                            autocomplete="off"
                            autocorrect="off"
                            autocapitalize="none"
                            spellcheck="false"
                            disabled={loading} />
                    </div>

                    <div class="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={loading || !inputValue.trim()}>
                            {loading ? t("dashboard.redemption.submitting") : t("dashboard.redemption.submit")}
                        </Button>
                        <Button variant="ghost" href="mailto:support@eepy.page">{t("dashboard.redemption.contactSupport")}</Button>
                    </div>
                </form>
            </div>
        {/if}
    </div>
</Holder>
