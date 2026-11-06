<svelte:options runes={true} />

<script lang="ts">
    import { browser } from "$app/environment";
    import { redirectToLogin } from "$lib";
    import { t } from "$lib/i18n";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        CodeError,
        confirmPasswordChange,
        RateLimitError,
        sendForgotCode,
        UserError
    } from "./../../../serverContactor";

    let generatingNew: boolean = $state(false);
    let code: string | null = null;
    let loading: boolean = $state(false);

    let errorTitle: string = $state("");
    let errorDescription: string = $state("");
    let noteTitle: string = $state("");
    let noteDescription: string = $state("");

    if (browser) {
        const params: URLSearchParams = new URLSearchParams(window.location.search);
        code = params.get("c");
        generatingNew = code !== null;
    }

    function clearFeedback() {
        errorTitle = "";
        errorDescription = "";
        noteTitle = "";
        noteDescription = "";
    }

    function handleButton() {
        clearFeedback();
        loading = true;

        if (generatingNew) {
            if (password !== cPassword) {
                loading = false;
                errorTitle = t("auth.recovery.passwordsDoNotMatchTitle");
                errorDescription = t("auth.recovery.passwordsDoNotMatchDesc");
                return;
            }

            confirmPasswordChange(code ?? "", password)
                .catch(err => {
                    loading = false;
                    errorTitle = t("auth.recovery.failedChangeTitle");
                    if (err instanceof CodeError)
                        errorDescription = t("auth.recovery.codeExpired");
                    else if (err instanceof UserError) redirectToLogin(404);
                    else if (err instanceof RateLimitError)
                        errorDescription = err.message;
                    else errorDescription = t("errors.network.UNEXPECTED", { status: 500 });

                    throw new Error("Failed to reset password");
                })
                .then(() => {
                    loading = false;
                    noteTitle = t("auth.recovery.successChangeTitle");
                    noteDescription = t("auth.recovery.successChangeDesc");
                    setTimeout(() => redirectToLogin(200, 2), 1500);
                });
        } else {
            if (!username.trim()) {
                loading = false;
                errorTitle = t("auth.recovery.usernameRequiredTitle");
                errorDescription = t("auth.recovery.usernameRequiredDesc");
                return;
            }

            sendForgotCode(username)
                .catch(err => {
                    loading = false;
                    errorTitle = t("auth.recovery.failedSendTitle");
                    if (err instanceof UserError) redirectToLogin(404);
                    else if (err instanceof RateLimitError) errorDescription = err.message;
                    else
                        errorDescription = t("auth.recovery.checkUsername");
                    throw new Error("Failed to send password reset");
                })
                .then(() => {
                    loading = false;
                    noteTitle = t("auth.recovery.successSendTitle");
                    noteDescription = t("auth.recovery.successSendDesc");
                });
        }
    }

    let cPassword: string = $state("");
    let password: string = $state("");
    let username: string = $state("");
</script>

<svelte:head>
    <title>Account Recovery | eepy.page</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Holder>
    <div class="space-y-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">{t("auth.recovery.title")}</h1>
            <p class="text-sm text-muted-foreground mt-1">
                {#if generatingNew}
                    {t("auth.recovery.descNew")}
                {:else}
                    {t("auth.recovery.descUsername")}
                {/if}
            </p>
        </div>

        <InlineAlert title={errorTitle} description={errorDescription} variant="error" />
        <InlineAlert title={noteTitle} description={noteDescription} variant="note" />

        <form onsubmit={(e) => { e.preventDefault(); handleButton(); }} class="space-y-4 pt-2">
            {#if generatingNew}
                <div class="space-y-1.5">
                    <Label for="new-pass">{t("auth.recovery.newPassword")}</Label>
                    <Input
                        id="new-pass"
                        type="password"
                        autocomplete="new-password"
                        bind:value={password}
                        placeholder="••••••••••••"
                        required />
                </div>
                <div class="space-y-1.5">
                    <Label for="confirm-pass">{t("auth.recovery.confirmNewPassword")}</Label>
                    <Input
                        id="confirm-pass"
                        type="password"
                        autocomplete="new-password"
                        bind:value={cPassword}
                        placeholder="••••••••••••"
                        required />
                </div>
            {:else}
                <div class="space-y-1.5">
                    <Label for="recover-user">{t("auth.fields.username")}</Label>
                    <Input
                        id="recover-user"
                        type="text"
                        autocomplete="username"
                        autocapitalize="none"
                        autocorrect="off"
                        bind:value={username}
                        placeholder={t("auth.fields.usernamePlaceholder")}
                        required />
                </div>
            {/if}

            <Button {loading} type="submit" class="w-full mt-2">
                {generatingNew ? t("auth.recovery.updatePassword") : t("auth.recovery.sendEmail")}
            </Button>
        </form>

        {#if !generatingNew}
            <Button href="/login" variant="link" class="w-full text-primary! py-0! -mt-2!">{t("auth.recovery.backToLogin")}</Button>
        {/if}
    </div>
</Holder>
