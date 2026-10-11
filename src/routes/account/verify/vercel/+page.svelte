<script lang="ts">
    import { browser } from "$app/environment";
    import {
        AuthError,
        CodeError,
        getAuthToken,
        redirectToLogin,
        ServerContactor,
        UserError
    } from "$lib";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Select from "$lib/components/ui/select/index.js";
    import { AVAILABLE_TLDS } from "$lib/types";

    let value = $state("");
    let tld = $state(".eepy.page");
    let currentPosition: number = $state(-1);
    let userHasConencted: boolean = $state(false);
    let userWasVerified: boolean = $state(false);
    let loading: boolean = $state(false);
    let errorTitle: string = $state("");
    let errorDescription: string = $state("");

    let serverContactor: ServerContactor;
    let intervalId: number = 0;

    if (browser) {
        serverContactor = new ServerContactor(getAuthToken() ?? null);
    }

    function fetchQueueData() {
        serverContactor
            .getVercelQueue()
            .catch(err => {
                if (err instanceof AuthError) redirectToLogin(460);
                if (err instanceof CodeError) {
                    userHasConencted = false;
                    userWasVerified = true;
                    loading = false;
                    clearInterval(intervalId);
                }
                if (err instanceof UserError) connectToQueue();
                throw new Error("Failed to get queue data");
            })
            .then(position => {
                currentPosition = Number(position);
            });
    }

    function connectToQueue() {
        if (!value.trim()) {
            errorTitle = "Verification record required";
            errorDescription = "Please enter the vc-domain-verify TXT value provided by Vercel.";
            return;
        }

        errorTitle = "";
        errorDescription = "";
        loading = true;

        serverContactor.joinVercelQueue(value, tld)
            .then(() => {
                userHasConencted = true;
                //@ts-ignore
                intervalId = setInterval(() => fetchQueueData(), 3000);
            })
            .catch(err => {
                loading = false;
                errorTitle = "Failed to join queue";
                errorDescription = err instanceof Error ? err.message : "Unable to join the verification queue. Please try again.";
            });
    }
</script>

<Holder>
    <div class="space-y-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Vercel Verification</h1>
            <p class="text-sm text-muted-foreground mt-1">
                Verify your eepy.page subdomain with Vercel by queueing your verification TXT challenge.
            </p>
        </div>

        <InlineAlert title={errorTitle} description={errorDescription} variant="error" />

        {#if userHasConencted}
            <div class="rounded-xl border border-border/70 bg-background/50 p-6 text-center space-y-2">
                {#if currentPosition === -1}
                    <h2 class="text-lg font-semibold">Joining verification queue...</h2>
                    <p class="text-sm text-muted-foreground">Preparing your verification request.</p>
                {:else if currentPosition === 0}
                    <h2 class="text-lg font-semibold text-primary">Completing verification...</h2>
                    <p class="text-sm text-muted-foreground">Deploying DNS record to authoritative servers.</p>
                {:else}
                    <h2 class="text-lg font-semibold">Queue Position: #{currentPosition}</h2>
                    <p class="text-sm text-muted-foreground">Please keep this tab open while your verification is processed.</p>
                {/if}
            </div>
        {:else if userWasVerified}
            <div class="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center space-y-2">
                <h2 class="text-lg font-semibold text-emerald-500">Successfully verified!</h2>
                <p class="text-sm text-muted-foreground">You can now return to your Vercel Project Dashboard and click <strong>Refresh</strong>.</p>
            </div>
        {:else}
            <form onsubmit={(e) => { e.preventDefault(); connectToQueue(); }} class="space-y-4 pt-2">
                <div class="space-y-1.5">
                    <Label for="verify-val">Verification Value</Label>
                    <div class="flex items-center gap-2">
                        <Input
                            id="verify-val"
                            bind:value={value}
                            class="font-mono text-sm flex-1"
                            placeholder="Enter your Vercel verification string"
                            required />

                        <Select.Root bind:value={tld} type="single" name="domain">
                            <Select.Trigger class="w-32 shrink-0 font-mono font-medium">{tld}</Select.Trigger>
                            <Select.Content>
                                {#each AVAILABLE_TLDS as item}
                                    <Select.Item value={item.tld} label={item.tld}>
                                        <span class="font-mono">{item.tld}</span>
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                <Button {loading} type="submit" class="w-full">
                    Join Verification Queue
                </Button>
            </form>
        {/if}
    </div>
</Holder>
