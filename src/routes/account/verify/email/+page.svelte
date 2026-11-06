<script lang="ts">
    import { redirectToLogin, CodeError, UserError, verifyEmail } from "$lib";
    import { t } from "$lib/i18n";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import Loader from "$lib/components/ui/loader/loader.svelte";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import MaterialSymbolsCheckCircle from "~icons/material-symbols/check-circle";
    import { onMount } from "svelte";

    let doneVerifying: boolean = $state(false);
    let valid: boolean = $state(false);

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code") || "undefined";

        // const emailFunc =
        //     code === "mock"
        //         ? async () => {
        //               await new Promise((resolve) => setTimeout(resolve, 1000));
        //               return "success";
        //           }
        //         : verifyEmail;
        const emailFunc = verifyEmail;

        emailFunc(code)
            .then(() => {
                valid = true;
                doneVerifying = true;
            })
            .catch((err) => {
                if (err instanceof CodeError) console.error("Code is invalid");
                if (err instanceof UserError) console.error("User does not exist");
                valid = false;
                doneVerifying = true;
            });
    });

    $effect(() => {
        if (valid) redirectToLogin(200, 2, true);
    });
</script>

<svelte:head>
    <title>Email Verification | eepy.page</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Holder>
    <div class="px-1 py-3">
        {#if !doneVerifying}
            <div class="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                <Loader asForeground />
                <h1 class="text-xl font-bold tracking-tight">{t("auth.emailVerification.pendingTitle")}</h1>
                <p class="text-muted-foreground text-sm">{t("auth.emailVerification.pendingDesc")}</p>
            </div>
        {:else if valid}
            <div class="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                <IconBadge variant="primary" size="lg" shape="circle">
                    <MaterialSymbolsCheckCircle class="size-7" />
                </IconBadge>
                <h1 class="text-2xl font-bold tracking-tight">{t("auth.emailVerification.successTitle")}</h1>
                <p class="text-muted-foreground text-sm">{t("auth.emailVerification.successDesc")}</p>
                <div class="pt-2">
                    <Button href="/login">{t("auth.emailVerification.goToLogin")}</Button>
                </div>
            </div>
        {:else}
            <div class="space-y-4">
                <h1 class="text-2xl font-bold tracking-tight">{t("auth.emailVerification.title")}</h1>
                <InlineAlert
                    variant="error"
                    title={t("auth.emailVerification.invalidTitle")}
                    description={t("auth.emailVerification.invalidDesc")} />
                <div class="pt-2">
                    <Button href="/login">{t("auth.emailVerification.goToLogin")}</Button>
                </div>
            </div>
        {/if}
    </div>
</Holder>
