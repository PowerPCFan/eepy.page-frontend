<svelte:options runes={true} />

<script lang="ts">
    import { browser } from "$app/environment";
    import { redirectToLogin } from "$lib";
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
                errorTitle = "Passwords don't match";
                errorDescription = "Please confirm that your passwords match.";
                return;
            }

            confirmPasswordChange(code ?? "", password)
                .catch(err => {
                    loading = false;
                    errorTitle = "Failed to change password";
                    if (err instanceof CodeError)
                        errorDescription = "Perhaps the code has expired?";
                    else if (err instanceof UserError) redirectToLogin(404);
                    else if (err instanceof RateLimitError)
                        errorDescription = err.message;
                    else errorDescription = "An unexpected error occurred.";

                    throw new Error("Failed to reset password");
                })
                .then(() => {
                    loading = false;
                    noteTitle = "Successfully changed password!";
                    noteDescription = "You can now log in using your new password.";
                    setTimeout(() => redirectToLogin(200, 2), 1500);
                });
        } else {
            if (!username.trim()) {
                loading = false;
                errorTitle = "Username required";
                errorDescription = "Please enter your username.";
                return;
            }

            sendForgotCode(username)
                .catch(err => {
                    loading = false;
                    errorTitle = "Failed to send verification code";
                    if (err instanceof UserError) redirectToLogin(404);
                    else if (err instanceof RateLimitError) errorDescription = err.message;
                    else
                        errorDescription =
                            "Did you double-check your username? eepy.page usernames are case-sensitive.";
                    throw new Error("Failed to send password reset");
                })
                .then(() => {
                    loading = false;
                    noteTitle = "Verification email sent";
                    noteDescription =
                        "A verification email has been sent to your inbox. If you can't find it, please check your spam folder.";
                });
        }
    }

    let cPassword: string = $state("");
    let password: string = $state("");
    let username: string = $state("");
</script>

<Holder>
    <div class="space-y-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Account Recovery</h1>
            <p class="text-sm text-muted-foreground mt-1">
                {#if generatingNew}
                    Enter your new password below to finish resetting your account.
                {:else}
                    Enter your eepy.page username. A verification link will be sent to your registered email address.
                {/if}
            </p>
        </div>

        <InlineAlert title={errorTitle} description={errorDescription} variant="error" />
        <InlineAlert title={noteTitle} description={noteDescription} variant="note" />

        <form onsubmit={(e) => { e.preventDefault(); handleButton(); }} class="space-y-4 pt-2">
            {#if generatingNew}
                <div class="space-y-1.5">
                    <Label for="new-pass">New Password</Label>
                    <Input
                        id="new-pass"
                        type="password"
                        autocomplete="new-password"
                        bind:value={password}
                        placeholder="Enter new password"
                        required />
                </div>
                <div class="space-y-1.5">
                    <Label for="confirm-pass">Confirm New Password</Label>
                    <Input
                        id="confirm-pass"
                        type="password"
                        autocomplete="new-password"
                        bind:value={cPassword}
                        placeholder="Confirm new password"
                        required />
                </div>
            {:else}
                <div class="space-y-1.5">
                    <Label for="recover-user">Username</Label>
                    <Input
                        id="recover-user"
                        type="text"
                        autocomplete="username"
                        autocapitalize="none"
                        autocorrect="off"
                        bind:value={username}
                        placeholder="Enter your eepy.page username"
                        required />
                </div>
            {/if}

            <Button {loading} type="submit" class="w-full mt-2">
                {generatingNew ? "Update Password" : "Send Recovery Email"}
            </Button>
        </form>

        {#if !generatingNew}
            <Button href="/login" variant="link" class="w-full text-primary! py-0! -mt-2!">Back to log in</Button>
        {/if}
    </div>
</Holder>
