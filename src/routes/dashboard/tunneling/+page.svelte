<script lang="ts">
    import { getAuthToken, redirectToLogin } from "$lib";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { AuthError, ServerContactor } from "../../../serverContactor";

    type Tunnel = { id: string; hostname: string; service: string; cloudflare_tunnel_id: string };
    let client: ServerContactor;
    let connected = $state(false);
    let accountId = $state("");
    let tunnels: Tunnel[] = $state([]);
    let loading = $state(true);
    let provisioning = $state(false);
    let dialogOpen = $state(false);
    let disconnectDialogOpen = $state(false);
    let disconnecting = $state(false);
    let subdomain = $state("");
    let service = $state("");
    let command = $state("");

    async function load() {
        try {
            const data = await client.cloudflareTunnels();
            connected = data.connected;
            accountId = data.account_id ?? "";
            tunnels = data.tunnels ?? [];
        } catch (error) {
            if (error instanceof AuthError) redirectToLogin(460);
            else toast.error("Could not load Cloudflare tunnels");
        } finally {
            loading = false;
        }
    }

    async function connect() {
        try {
            window.location.href = await client.cloudflareConnect();
        } catch (_) {
            toast.error("Could not start Cloudflare connection");
        }
    }

    async function create() {
        provisioning = true;
        try {
            const result = await client.createCloudflareTunnel(subdomain, service);
            tunnels = [...tunnels, result.tunnel];
            command = `cloudflared tunnel run --token ${result.token}`;
            dialogOpen = false;
            subdomain = "";
            toast.success("Tunnel provisioned", { description: "Your DNS record is being published." });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create tunnel");
        } finally {
            provisioning = false;
        }
    }

    async function disconnect() {
        disconnecting = true;
        try {
            await client.disconnectCloudflare();
            connected = false;
            accountId = "";
            tunnels = [];
            command = "";
            disconnectDialogOpen = false;
            toast.success("Cloudflare disconnected");
        } catch (_) {
            toast.error("Could not disconnect Cloudflare");
        } finally {
            disconnecting = false;
        }
    }

    async function remove(tunnel: Tunnel) {
        try {
            await client.deleteCloudflareTunnel(tunnel.id);
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

<section class="mx-auto mt-16 w-11/12 max-w-6xl">
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
            <h1 class="text-4xl font-semibold">eepy.page tunneling</h1>
            {#if connected}<p class="text-muted-foreground mt-2 text-sm">connected account: <code>{accountId}</code></p>{/if}
        </div>
        {#if connected}
            <div class="flex flex-wrap justify-end gap-2">
                <Button onclick={() => (dialogOpen = true)}>Create Tunnel</Button>
                <Button variant="destructive" onclick={() => (disconnectDialogOpen = true)}>Disconnect Cloudflare</Button>
            </div>
        {:else}
            <Button onclick={connect}>Connect Cloudflare</Button>
        {/if}
    </div>

    {#if loading}
        <Skeleton class="mt-8 h-32 rounded-lg" />
    {:else if !connected}
        <div class="border-border bg-card mt-8 rounded-lg border p-8">
            <h2 class="text-2xl font-semibold">Connect your Cloudflare account</h2>
            <p class="text-muted-foreground mt-2 max-w-xl">
                Create and manage secure routes to local services without copying tunnel IDs or configuring DNS by hand.
            </p>
        </div>
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
                        <span class="text-sm text-emerald-600">Provisioned</span>
                    </div>
                    {#if command}<div class="mt-5 flex gap-2">
                            <Input readonly value={command} /><Button variant="ghost" onclick={() => copy(command)}
                                >Copy</Button>
                        </div>{/if}
                    <Button class="mt-5" variant="destructive" onclick={() => remove(tunnel)}>Delete Tunnel</Button>
                </article>
            {/each}
        </div>
    {/if}
</section>

<Dialog.Root bind:open={disconnectDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Disconnect Cloudflare?</Dialog.Title>
            <Dialog.Description>
                This disconnects your Cloudflare account from eepy.page. Your existing tunnels and domains will not be deleted.
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Dialog.Close><Button variant="ghost">Cancel</Button></Dialog.Close>
            <Button variant="destructive" loading={disconnecting} onclick={disconnect}>Disconnect</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content>
        <Dialog.Header
            ><Dialog.Title>Create Tunnel</Dialog.Title><Dialog.Description
                >Enter the subdomain you'd like to use, and the local URL of the service you're tunneling.</Dialog.Description
            ></Dialog.Header>
        <div class="space-y-4 py-4">
            <div>
                <Label for="subdomain">Subdomain</Label><Input
                    id="subdomain"
                    bind:value={subdomain}
                    placeholder="Subdomain to use for the tunnel" />
            </div>
            <div>
                <Label for="service">Local service URL</Label><Input
                    id="service"
                    bind:value={service}
                    placeholder="URL for the service being tunneled, e.g. http://localhost:8080" />
            </div>
        </div>
        <Dialog.Footer
            ><Button variant="ghost" onclick={() => (dialogOpen = false)}>Cancel</Button><Button
                disabled={provisioning || !subdomain || !service}
                onclick={create}>{provisioning ? "Provisioning..." : "Create Tunnel"}</Button
            ></Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
