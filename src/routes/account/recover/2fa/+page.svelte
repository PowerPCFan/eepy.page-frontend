<script lang="ts">
    import { AuthError, CodeError, MFAError, recoverMfaCode, redirectToLogin, UserError } from "$lib";
    import { t } from "$lib/i18n";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    let username: string = $state("");
    let password: string = $state("");
    let backupCode: string = $state("");
    let loading: boolean = $state(false);

    let errorTitle: string = $state("");
    let errorDescription: string = $state("");
    let noteTitle: string = $state("");
    let noteDescription: string = $state("");

    function clearFeedback() {
        errorTitle = "";
        errorDescription = "";
        noteTitle = "";
        noteDescription = "";
    }

    function sendRemoval() {
        clearFeedback();
        loading = true;

        recoverMfaCode(username, password, backupCode)
            .catch(error => {
                loading = false;
                errorTitle = t("auth.twoFactorRecovery.failedTitle");
                if (error instanceof AuthError || error instanceof UserError) {
                    errorDescription = t("auth.alerts.credentialsMismatch");
                } else if (error instanceof CodeError) {
                    errorDescription = t("auth.twoFactorRecovery.invalidCode");
                } else if (error instanceof MFAError) {
                    errorDescription = t("auth.twoFactorRecovery.alreadyDisabled");
                } else {
                    errorDescription = t("errors.network.UNEXPECTED", { status: 500 });
                }
                throw new Error("Failed to remove 2FA");
            })
            .then(() => {
                loading = false;
                noteTitle = t("auth.twoFactorRecovery.successTitle");
                noteDescription = t("auth.twoFactorRecovery.successDesc");
                setTimeout(() => redirectToLogin(200, 2), 1500);
            });
    }
</script>

<svelte:head>
    <title>Disable 2FA | eepy.page</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Holder>
    <div class="space-y-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">{t("auth.twoFactorRecovery.title")}</h1>
            <p class="text-sm text-muted-foreground mt-1">
                {t("auth.twoFactorRecovery.desc")}
            </p>
        </div>

        <InlineAlert title={errorTitle} description={errorDescription} variant="error" />
        <InlineAlert title={noteTitle} description={noteDescription} variant="note" />

        <form onsubmit={(e) => { e.preventDefault(); sendRemoval(); }} class="space-y-4 pt-2">
            <div class="space-y-1.5">
                <Label for="username">{t("auth.fields.username")}</Label>
                <Input
                    id="username"
                    type="text"
                    autocomplete="username"
                    autocapitalize="none"
                    autocorrect="off"
                    placeholder={t("auth.fields.usernamePlaceholder")}
                    bind:value={username}
                    required />
            </div>

            <div class="space-y-1.5">
                <Label for="password">{t("auth.fields.password")}</Label>
                <Input
                    id="password"
                    type="password"
                    autocomplete="current-password"
                    placeholder="••••••••••••"
                    bind:value={password}
                    required />
            </div>

            <div class="space-y-1.5">
                <Label for="backupCode">{t("auth.twoFactorRecovery.backupCodeLabel")}</Label>
                <Input
                    id="backupCode"
                    type="text"
                    autocomplete="off"
                    autocapitalize="none"
                    autocorrect="off"
                    placeholder={t("auth.twoFactorRecovery.codePlaceholder")}
                    bind:value={backupCode}
                    required />
            </div>

            <Button {loading} type="submit" variant="destructive" class="w-full">
                {t("auth.twoFactorRecovery.submit")}
            </Button>
        </form>

        <div class="flex justify-between items-center text-sm text-muted-foreground">
            <a href="/login" class="hover:text-foreground transition-colors">
                {t("auth.recovery.backToLogin")}
            </a>
            <a href="/support" class="hover:text-primary transition-colors">
                {t("auth.twoFactorRecovery.needHelp")}
            </a>
        </div>
    </div>
</Holder>
