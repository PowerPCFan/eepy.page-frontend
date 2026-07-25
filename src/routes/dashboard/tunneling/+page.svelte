<script lang="ts">
    import { getAuthToken, redirectToLogin } from "$lib";
    import { Button } from "$lib/components/ui/button";
    import Settings from "~icons/material-symbols/settings"
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { Codeblock } from "$lib/components/ui/codeblock";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { AuthError, ServerContactor } from "../../../serverContactor";

    type Tunnel = { id: string; hostname: string; subdomain: string; service: string; local_port: number; ssh_fingerprint: string; command: string };
    let client: ServerContactor;
    let connected = $state(false);
    let tunnels: Tunnel[] = $state([]);
    let loading = $state(true);
    let provisioning = $state(false);
    let dialogOpen = $state(false);
    let subdomain = $state("");
    let localPort = $state("");
    let sshFingerprint = $state("");
    let subdomainError = $state("");
    let subdomainNote = $state("");
    let alertUpdate = $state(0);
    let settingsOpen = $state(false);
    let settingsTunnel: Tunnel | null = $state(null);
    let settingsSubdomain = $state("");
    let settingsSubdomainNote = $state("");
    let settingsPort = $state("");
    let settingsFingerprint = $state("");
    let settingsError = $state("");
    let settingsSaving = $state(false);
    let validLocalPort = $derived(
        localPort.trim() !== "" && /^\d+$/.test(localPort.trim()) && Number(localPort) >= 1 && Number(localPort) <= 65535,
    );
    let validSettingsPort = $derived(
        settingsPort.trim() !== "" && /^\d+$/.test(settingsPort.trim()) && Number(settingsPort) >= 1 && Number(settingsPort) <= 65535,
    );
    let settingsChanged = $derived(
        settingsTunnel !== null &&
        (settingsSubdomain !== settingsTunnel.subdomain ||
            Number(settingsPort) !== settingsTunnel.local_port ||
            settingsFingerprint !== settingsTunnel.ssh_fingerprint),
    );

    function openSettings(tunnel: Tunnel) {
        settingsTunnel = tunnel;
        settingsSubdomain = tunnel.subdomain;
        settingsPort = String(tunnel.local_port);
        settingsFingerprint = tunnel.ssh_fingerprint;
        settingsSubdomainNote = getSubdomainNote(tunnel.subdomain);
        settingsError = "";
        settingsOpen = true;
    }

    function getSubdomainNote(value: string) {
        return value.toLowerCase().includes(".eepy.page")
            ? 'eepy.page automatically adds the ".eepy.page" portion of your domain.'
            : "";
    }

    async function saveSettings() {
        if (!settingsTunnel || !validSettingsPort) return;
        settingsError = "";
        settingsSaving = true;
        try {
            const result = await client.updateServeoTunnel(
                settingsTunnel.id,
                settingsSubdomain,
                Number(settingsPort),
                settingsFingerprint,
            );
            tunnels = tunnels.map(tunnel => tunnel.id === settingsTunnel?.id ? result.tunnel : tunnel);
            settingsOpen = false;
            toast.success("Tunnel settings updated", { description: "Restart the SSH process with the updated command." });
        } catch (error) {
            settingsError = error instanceof Error ? error.message : "Could not update tunnel";
        } finally {
            settingsSaving = false;
        }
    }

    $effect(() => {
        const nextDescription = getSubdomainNote(subdomain);
        if (subdomainNote !== nextDescription) {
            subdomainNote = nextDescription;
            alertUpdate++;
        }
    });

    $effect(() => {
        settingsSubdomainNote = getSubdomainNote(settingsSubdomain);
    });

    async function load() {
        try {
            const data = await client.serveoTunnels();
            connected = data.connected;
            tunnels = data.tunnels ?? [];
        } catch (error) {
            if (error instanceof AuthError) redirectToLogin(460);
            else toast.error("Could not load tunnels");
        } finally {
            loading = false;
        }
    }

    async function create() {
        if (!validLocalPort) {
            return;
        }
        subdomainError = "";
        subdomainNote = "";
        alertUpdate++;
        provisioning = true;
        try {
            const result = await client.createServeoTunnel(subdomain, Number(localPort), sshFingerprint);
            tunnels = [...tunnels, { ...result.tunnel, command: result.command }];
            dialogOpen = false;
            subdomain = "";
            localPort = "";
            sshFingerprint = "";
            subdomainError = "";
            toast.success("Tunnel configured", { description: "Run the generated SSH command to connect to the tunnel." });
        } catch (error) {
            subdomainError = error instanceof Error ? error.message : "Could not create tunnel";
            alertUpdate++;
        } finally {
            provisioning = false;
        }
    }

    async function remove(tunnel: Tunnel) {
        subdomainError = "";
        alertUpdate++;
        try {
            await client.deleteServeoTunnel(tunnel.id);
            tunnels = tunnels.filter((item) => item.id !== tunnel.id);
            toast.success("Tunnel deleted");
        } catch (_) {
            toast.error("Could not delete tunnel");
        }
    }

    function copy(value: string) {
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
    }

    onMount(() => {
        client = new ServerContactor(getAuthToken() ?? null);
        load();
    });
</script>

<svelte:head>
    <title>eepy.page tunneling | eepy.page</title>
</svelte:head>

<div class="domain-holder bg-card max-w-8xl sentry-unmask mt-8 mr-auto ml-auto w-11/12 rounded-2xl p-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
            <h1 class="text-4xl font-semibold">eepy.page tunneling</h1>
        </div>
        <Button onclick={() => (dialogOpen = true)}>Create Tunnel</Button>
    </div>

    {#if loading}
        <Skeleton class="mt-8 h-32 rounded-lg" />
    {:else if tunnels.length === 0}
        <div class="border-border text-muted-foreground mt-8 rounded-lg border border-dashed p-8">
            No tunnels yet. Create one to publish a local service.
        </div>
    {:else}
        <div class="mt-8 grid gap-4 md:grid-cols-2">
            {#each tunnels as tunnel}
                <article class="border-border bg-card rounded-lg border p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h2 class="text-xl font-semibold">{tunnel.hostname}</h2>
                            <p class="text-muted-foreground mt-1 text-sm">{tunnel.service}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Tunnel settings"
                            title="Tunnel settings"
                            onclick={() => openSettings(tunnel)}><Settings /></Button>
                    </div>
                    <div class="mt-5">
                        <Codeblock class="w-full" text={tunnel.command} />
                    </div>
                    <Button class="mt-5" variant="destructive" onclick={() => remove(tunnel)}>Delete Tunnel</Button>
                </article>
            {/each}
        </div>
    {/if}
</div>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[calc(100vh-2rem)] min-h-0 overflow-hidden">
        <Dialog.Header>
            <Dialog.Title>Create Tunnel</Dialog.Title>
            <Dialog.Description>
                Add your SSH public key fingerprint and local port. Then, we will set up DNS and generate the SSH
                command that creates the tunnel.
            </Dialog.Description>
        </Dialog.Header>
        <div class="tunnel-dialog-scrollbar min-h-0 overflow-y-auto space-y-4 pb-4">
            <Accordion.Root type="single">
                <Accordion.Item>
                    <Accordion.Trigger>Need help finding your SSH key?</Accordion.Trigger>
                    <Accordion.Content>
                        <div class="space-y-4 ml-3 pb-2 text-sm">
                            <p>
                                An SSH key is usually already on your computer. To set up tunneling, you'll need your
                                public key's fingerprint. Do not share or upload your private key anywhere.
                            </p>
                            <Accordion.Root type="multiple">
                                <Accordion.Item>
                                    <Accordion.Trigger>Windows</Accordion.Trigger>
                                    <Accordion.Content>
                                        <div class="space-y-3 ml-3">
                                            <p>
                                                Open PowerShell and check for an existing key:
                                                <Codeblock text='Test-Path $HOME\\.ssh\\id_ed25519.pub' />
                                            </p>
                                            <p>
                                                If it prints <Codeblock variant="inline" text="True" />, print the fingerprint with:
                                                <Codeblock text='ssh-keygen -lf $HOME\\.ssh\\id_ed25519.pub' />
                                            </p>
                                            <p>
                                                If it prints <Codeblock variant="inline" text="False" />, create a key first:
                                                <Codeblock text="ssh-keygen -t ed25519" />
                                            </p>
                                            <p>Press Enter to accept the suggested file location, then run the fingerprint command above.</p>
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                                <Accordion.Item>
                                    <Accordion.Trigger>macOS</Accordion.Trigger>
                                    <Accordion.Content>
                                        <div class="space-y-3 ml-3">
                                            <p>Open Terminal and check for an existing key:</p>
                                            <Codeblock text={'test -f ~/.ssh/id_ed25519.pub && echo "Found a key" || echo "No key found"'} />
                                            <p>If a key exists, print the fingerprint with:</p>
                                            <Codeblock text="ssh-keygen -lf ~/.ssh/id_ed25519.pub" />
                                            <p>If no key exists, create one first:</p>
                                            <Codeblock text="ssh-keygen -t ed25519" />
                                            <p>Press Enter to accept the suggested file location, then run the fingerprint command above.</p>
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                                <Accordion.Item>
                                    <Accordion.Trigger>Linux</Accordion.Trigger>
                                    <Accordion.Content>
                                        <div class="space-y-3 ml-3">
                                            <p>Open a terminal and check for an existing key:</p>
                                            <Codeblock text={'test -f ~/.ssh/id_ed25519.pub && echo "Found a key" || echo "No key found"'} />
                                            <p>If a key exists, print the fingerprint with:</p>
                                            <Codeblock text="ssh-keygen -lf ~/.ssh/id_ed25519.pub" />
                                            <p>If no key exists, create one first:</p>
                                            <Codeblock text="ssh-keygen -t ed25519" />
                                            <p>Press Enter to accept the suggested file location, then run the fingerprint command above.</p>
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            </Accordion.Root>
                            <p>
                                Copy the <Codeblock variant="inline" text="SHA256:..." /> portion printed by
                                <Codeblock variant="inline" text="ssh-keygen" /> into the field below. If you paste the
                                entire output line, we will extract the fingerprint automatically.
                            </p>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
            <div class="flex flex-col gap-1.5">
                <Label for="subdomain">Subdomain</Label>
                <Input id="subdomain" bind:value={subdomain} placeholder="Subdomain to use for the tunnel" />
                <InlineAlert
                    variant="note"
                    title="Remove the eepy.page suffix"
                    description={subdomainNote}
                    trigger={alertUpdate} />
            </div>
            <div class="flex flex-col gap-1.5">
                <Label for="local-port">Local port</Label>
                <Input
                    id="local-port"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    spellcheck="false"
                    aria-invalid={localPort !== "" && !validLocalPort}
                    bind:value={localPort}
                    placeholder="Enter your local service's port" />
                {#if localPort !== "" && !validLocalPort}
                    <p class="text-destructive text-sm">Enter a whole number from 1 to 65535.</p>
                {/if}
            </div>
            <div class="flex flex-col gap-1.5">
                <Label for="ssh-fingerprint">SSH public key fingerprint</Label>
                <Input id="ssh-fingerprint" bind:value={sshFingerprint} placeholder="SHA256:..." />
            </div>
        </div>
        <InlineAlert
            variant="error"
            title="Could not create tunnel"
            description={subdomainError}
            trigger={alertUpdate} />
        <Dialog.Footer
            ><Button variant="ghost" onclick={() => (dialogOpen = false)}>Cancel</Button><Button
                disabled={provisioning || !subdomain || !validLocalPort || !sshFingerprint}
                onclick={create}>{provisioning ? "Provisioning..." : "Create Tunnel"}</Button
            ></Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={settingsOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Tunnel settings</Dialog.Title>
            <Dialog.Description>Change the hostname, local port, or SSH key used by this tunnel.</Dialog.Description>
        </Dialog.Header>
        <div class="space-y-4 py-4">
            <div class="flex flex-col gap-1.5">
                <Label for="settings-subdomain">Subdomain</Label>
                <Input id="settings-subdomain" bind:value={settingsSubdomain} placeholder="Subdomain to use for the tunnel" />
                <InlineAlert
                    variant="note"
                    title="Remove the eepy.page suffix"
                    description={settingsSubdomainNote} />
            </div>
            <div class="flex flex-col gap-1.5">
                <Label for="settings-port">Local port</Label>
                <Input
                    id="settings-port"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    spellcheck="false"
                    aria-invalid={settingsPort !== "" && !validSettingsPort}
                    bind:value={settingsPort}
                    placeholder="Enter your local service's port" />
                {#if settingsPort !== "" && !validSettingsPort}
                    <p class="text-destructive text-sm">Enter a whole number from 1 to 65535.</p>
                {/if}
            </div>
            <div class="flex flex-col gap-1.5">
                <Label for="settings-fingerprint">SSH public key fingerprint</Label>
                <Input id="settings-fingerprint" bind:value={settingsFingerprint} placeholder="SHA256:..." />
            </div>
            <InlineAlert variant="error" title="Could not update tunnel" description={settingsError} />
            {#if settingsChanged}
                <InlineAlert
                    variant="note"
                    title="Restart SSH after saving"
                    description="You need to restart the SSH process for the tunnel to work again. Use the updated command shown on the tunnel card." />
            {/if}
        </div>
        <Dialog.Footer>
            <Button variant="ghost" onclick={() => (settingsOpen = false)}>Cancel</Button>
            <Button disabled={settingsSaving || !settingsChanged || !settingsSubdomain || !validSettingsPort || !settingsFingerprint} onclick={saveSettings}>
                {settingsSaving ? "Saving..." : (settingsChanged ? "Save changes" : "All changes saved")}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<style>
    .tunnel-dialog-scrollbar {
        scrollbar-color: color-mix(in srgb, var(--muted-foreground) 45%, transparent) transparent;
        scrollbar-width: thin;
    }

    .tunnel-dialog-scrollbar::-webkit-scrollbar {
        width: 8px;
    }

    .tunnel-dialog-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }

    .tunnel-dialog-scrollbar::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--muted-foreground) 45%, transparent);
        border: 2px solid transparent;
        border-radius: 999px;
        background-clip: padding-box;
    }

    .tunnel-dialog-scrollbar::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--muted-foreground) 70%, transparent);
        background-clip: padding-box;
    }
</style>
