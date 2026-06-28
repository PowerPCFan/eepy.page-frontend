<script lang="ts">
    import { redirectToLogin } from "$lib";
    import Holder from "$lib/components/Holder.svelte";
    import { onMount } from "svelte";
    import { CodeError, UserError, verifyEmail } from "../../../../serverContactor";
    let doneVerifying: boolean = $state(false);
    let valid: boolean = $state(false);

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);

        verifyEmail(urlParams.get("code") || "undefined")
            .catch(err => {
                if (err instanceof CodeError) console.error("Code is invalid");
                if (err instanceof UserError) console.error("User does not exist");
                valid = false;
                doneVerifying = true;
                throw new Error("Verification failed!");
            })
            .then(_ => {
                valid = true;
                doneVerifying = true;
            });
    });

    $effect(() => {
        if (valid) redirectToLogin(200, 2, true);
    });
</script>

<Holder>
    <h1 class="text-2xl font-semibold">Email verification</h1>
    <br />
    <h2 class="text-xl font-semibold">
        {#if !doneVerifying}
            Checking verification validity...
        {:else if !valid}
            Invalid code
        {:else if valid}
            Verification complete!
        {/if}
    </h2>
    {#if doneVerifying}
        <p>
            {#if valid}
                Redirecting to login...
            {:else}
                This code has either expired, or is invalid.
            {/if}
        </p>
    {/if}
</Holder>
