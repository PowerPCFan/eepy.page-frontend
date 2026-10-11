<script lang="ts">
    import { AuthError, CodeError, MFAError, recoverMfaCode, redirectToLogin, UserError } from "$lib";
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
                errorTitle = "Failed to disable 2FA";
                if (error instanceof AuthError || error instanceof UserError) {
                    errorDescription = "Username and password do not match.";
                } else if (error instanceof CodeError) {
                    errorDescription = "Invalid backup code.";
                } else if (error instanceof MFAError) {
                    errorDescription = "Two-factor authentication is already disabled on this account.";
                } else {
                    errorDescription = "An unexpected error occurred. Please contact support if this persists.";
                }
                throw new Error("Failed to remove 2FA");
            })
            .then(() => {
                loading = false;
                noteTitle = "Two-Factor Authentication Disabled";
                noteDescription = "Two-factor authentication has been successfully removed from your account.";
                setTimeout(() => redirectToLogin(200, 2), 1500);
            });
    }
</script>

<Holder>
    <div class="space-y-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Disable Two-factor Authentication</h1>
            <p class="text-sm text-muted-foreground mt-1">
                Enter your account credentials and one of your unused backup codes to disable two-factor authentication.
            </p>
        </div>

        <InlineAlert title={errorTitle} description={errorDescription} variant="error" />
        <InlineAlert title={noteTitle} description={noteDescription} variant="note" />

        <form onsubmit={(e) => { e.preventDefault(); sendRemoval(); }} class="space-y-4 pt-2">
            <div class="space-y-1.5">
                <Label for="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    autocomplete="username"
                    autocapitalize="none"
                    autocorrect="off"
                    placeholder="Your eepy.page username"
                    bind:value={username}
                    required />
            </div>

            <div class="space-y-1.5">
                <Label for="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    autocomplete="current-password"
                    placeholder="Your eepy.page password"
                    bind:value={password}
                    required />
            </div>

            <div class="space-y-1.5">
                <Label for="backupCode">Backup Code</Label>
                <Input
                    id="backupCode"
                    type="text"
                    autocomplete="off"
                    autocapitalize="none"
                    autocorrect="off"
                    placeholder="Enter an unused backup code"
                    bind:value={backupCode}
                    required />
            </div>

            <Button {loading} type="submit" variant="destructive" class="w-full">
                Disable 2FA
            </Button>
        </form>

        <div class="flex justify-between items-center text-sm text-muted-foreground">
            <a href="/login" class="hover:text-foreground transition-colors">
                Back to log in
            </a>
            <a href="/support" class="hover:text-primary transition-colors">
                Need help?
            </a>
        </div>
    </div>
</Holder>
