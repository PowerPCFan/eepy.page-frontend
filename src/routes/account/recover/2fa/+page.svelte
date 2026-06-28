<script lang="ts">
    import { AuthError, CodeError, MFAError, recoverMfaCode, UserError } from "$lib";
    import Holder from "$lib/components/Holder.svelte";
    import Loader from "$lib/components/Loader.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";

    let username: string = $state("");
    let password: string = $state("");
    let backupCode: string = $state("");

    let modal: Modal;
    let loader: Loader;

    function sendRemoval() {
        loader.show();
        recoverMfaCode(username, password, backupCode)
            .catch(error => {
                loader.hide();
                if (error instanceof AuthError || error instanceof UserError) {
                    modal.open("Failed to remove 2FA", "Username and password do not match.");
                } else if (error instanceof CodeError) {
                    modal.open("Invalid code", "Invalid backup code");
                } else if (error instanceof MFAError) {
                    modal.open("Two-factor authentication is already disabled", "");
                } else {
                    modal.open("An unhandled error occurred.", "Please contact support if this error persists.");
                }
                throw new Error("Failed to remove 2FA");
            })
            .then(_ => {
                loader.hide();
                modal.open("Two-factor authentication is now disabled", "");
            });
    }
</script>

<Modal bind:this={modal} description="" title="" options={["Continue"]}></Modal>
<Loader bind:this={loader} />
<Holder>
    <h1 class="text-2xl font-semibold">Disable two-factor authentication with a backup key</h1>

    <form class="space-y-2">
        <Input type="text" placeholder="Username" bind:value={username} />
        <Input type="password" placeholder="Password" bind:value={password} />
        <Input type="text" placeholder="Backup code" bind:value={backupCode} />

        <Button onclick={_ => sendRemoval()}>
            Disable 2FA
        </Button>
    </form>
    <a class="support-tip" href="mailto:support@eepy.page">Unable to log in? Contact support.</a>
</Holder>

<style>
    form {
        display: flex;
        flex-direction: column;
        height: fit-content;
    }

    .support-tip {
        margin-top: 4em;
        font-size: small;
    }
</style>
