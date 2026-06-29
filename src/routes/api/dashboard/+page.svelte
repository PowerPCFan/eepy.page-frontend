<script lang="ts">
    import { getAuthToken, redirectToLogin } from "$lib";
    import type { Domain } from "$lib/components/DomainTable.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import Label from "$lib/components/ui/label/label.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import consola from "consola";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import MaterialSymbolsVisibility from "~icons/material-symbols/visibility";
    import MaterialSymbolsVisibilityOff from "~icons/material-symbols/visibility-off";
    import { AuthError, ServerContactor } from "../../../serverContactor";
    interface Key {
        hash: string;
        perms: ("delete" | "register" | "modify" | "list" | "userdetails")[];
        domains: string[];
        comment: string;
        decrypted?: string;
        visible: boolean;
        deletionLoading?: boolean;
        dialogOpen: boolean;
    }

    const Permissions = ["register", "modify", "delete", "list", "userdetails"] as const;
    const PermissionLabels = {
        register: "Register new domains",
        modify: "Modify",
        delete: "Delete",
        list: "View domains",
        userdetails: "View account details"
    } as const;

    let apiKeys: Key[] = $state([]);
    let keysLoaded: boolean = $state(false);

    let domainsLoaded: boolean = $state(false);
    let domains: Domain[] = $state([]);

    let selectedDomains: string[] = $state([]);
    let selectedPermissions: string[] = $state([]);
    let apiCreationLoading: boolean = $state(false);

    let comment: string = $state("");

    let dialogOpen: boolean = $state(false);

    let apiErrorTitle: string = $state("");
    let apiErrorDescription: string = $state("");

    let alertUpdate: number = $state(0);

    let serverContactor: ServerContactor;

    function getKey(key: Key) {
        key.decrypted = "Loading..";
        serverContactor
            .getApiKey(key.hash)
            .catch(error => {
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                }
            })
            .then(data => {
                key.decrypted = data ?? "";
            });
    }

    function deleteKey(key: Key) {
        consola.debug(`Deleting key with command ${key.comment}`);
        key.decrypted = "Loading..";
        serverContactor
            .deleteApiKey(key.hash)
            .catch(error => {
                key.deletionLoading = false;
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                }
            })
            .then(data => {
                key.deletionLoading = false;
                dialogOpen = false;
                apiKeys = apiKeys.filter(apiKey => apiKey.hash !== key.hash);
            });
    }

    function registerKey() {
        serverContactor
            // @ts-expect-error selectedPermissions typed as string[] instead of string literal
            .createApiKey(comment, selectedDomains, selectedPermissions)
            .catch(error => {
                apiCreationLoading = false;

                if (error instanceof AuthError) {
                    redirectToLogin(460);
                }
            })
            .then(data => {
                apiCreationLoading = false;
                toast.success("API key created", {
                    description: "Refreshing..."
                });
                window.location.reload();
            });
    }

    onMount(() => {
        serverContactor = new ServerContactor(getAuthToken() ?? null);
        serverContactor
            .getApiKeys()
            .catch(error => {
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                }
            })
            .then(data => {
                keysLoaded = true;

                if (!data) {
                    return;
                }
                const userKeys = Object.entries(data);
                for (let [key, value] of userKeys) {
                    apiKeys.push({
                        hash: key,
                        comment: value.comment,
                        perms: value.perms,
                        domains: value.domains,
                        visible: false,
                        dialogOpen: false
                    });
                }
            });
        serverContactor
            .getDomains()
            .catch(error => {
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                } else {
                    console.error(error);
                    apiErrorTitle = "Failed to load domains";
                    apiErrorDescription = "Please contact support if this error persists.";
                    throw new Error("Failed to load domains");
                }
            })
            .then(data => {
                domainsLoaded = true;
                // @ts-expect-error
                const userDomains = Object.entries(data["domains"]);
                
                for (let [key, value] of userDomains) {
                    domains.push({
                        type: value.type,
                        domain: key,
                        value: value.ip
                    });
                }
            });
    });
</script>

<div class="domain-holder bg-card max-w-8xl mt-16 mr-auto ml-auto w-10/12 rounded-2xl p-6">
    <h1 class="text-3xl font-semibold">Your API keys</h1>

    {#key apiKeys}
        {#if !keysLoaded}
            <Skeleton class="mt-8 mb-8 h-48 items-center space-x-3 rounded-lg p-8" />
        {/if}
        <div transition:fade={{ duration: 100 }} class="keys">
            {#each apiKeys as key}
                <div class="key bg-popover mt-8 mb-8 items-center space-x-3 rounded-lg p-8">
                    <Label class="text-2xl font-semibold">{key.comment}</Label>

                    <div class="key flex w-full">
                        <Input
                            disabled={true}
                            id="key"
                            type={key.visible ? "text" : "password"}
                            value={key.decrypted ?? "X".repeat(39)} />
                        <Button
                            onclick={_ => {
                                if (!key.decrypted) {
                                    getKey(key);
                                }
                                key.visible = !key.visible;
                            }}
                            class="ml-1"
                            variant={"ghost"}>
                            {#if key.visible}
                                <MaterialSymbolsVisibilityOff />
                            {:else}
                                <MaterialSymbolsVisibility />
                            {/if}
                        </Button>
                    </div>
                    <p class="font-semibold">Permissions:</p>
                    <ul class="list-disc [&>li]:ml-8">
                        {#each key.perms as permission}
                            {#if permission === "modify"}
                                <li>Modify</li>
                            {/if}
                            {#if permission === "register"}
                                <li>Register new domains</li>
                            {/if}
                            {#if permission === "delete"}
                                <li>Delete</li>
                            {/if}
                            {#if permission === "list"}
                                <li>View domains</li>
                            {/if}
                            {#if permission === "userdetails"}
                                <li>View account details</li>
                            {/if}
                        {/each}
                    </ul>
                    <p class="font-semibold">Domains:</p>
                    <ul class="list-disc [&>li]:ml-8">
                        {#each key.domains as domain}
                            <li>{domain}.eepy.page</li>
                        {/each}
                    </ul>

                    <Dialog.Root
                        onOpenChange={open => (key.dialogOpen = open)}
                        open={key.dialogOpen}>
                        <Dialog.Trigger>
                            <Button variant={"destructive"}
                                >Delete</Button>
                        </Dialog.Trigger>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Are you sure you would like to delete this key?</Dialog.Title>
                                <Dialog.Description>
                                    Deleting an API key immediately stops all services using this key from
                                    having access to your domains. This is a destructive action that cannot be
                                    undone.
                                </Dialog.Description>
                            </Dialog.Header>
                            <Dialog.Footer>
                                <Button
                                    onclick={_ => {
                                        deleteKey(key);
                                        key.deletionLoading = true;
                                    }}
                                    loading={key.deletionLoading}
                                    variant={"destructive"}
                                    >Delete</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Root>
                </div>
            {/each}
        </div>
    {/key}

    <InlineAlert
        variant={"error"}
        title={apiErrorTitle}
        description={apiErrorDescription}
        className="mb-6 mt-6"
        trigger={alertUpdate} />
</div>

<div class="create bg-card max-w-8xl mt-16 mr-auto ml-auto w-10/12 rounded-2xl p-6">
    <h1 class="text-2xl font-semibold">Create an API key</h1>
    <form class="mt-4 items-center space-y-4 space-x-2">
        <div class="w-full max-w-96 space-y-2">
            <Label for="comment">Comment</Label>
            <Input
                placeholder="For testing my super cool app"
                aria-required={true}
                bind:value={comment}
                id="comment" />
        </div>
        <div class="space-y-2">
            <Label>Domains</Label>
            <Select.Root bind:value={selectedDomains} type="multiple">
                <Select.Trigger class="w-96"
                    >{selectedDomains.join(", ").slice(0, 45)}...</Select.Trigger>
                <Select.Content>
                    <Select.Item value="*">Any domain</Select.Item>
                    {#each domains as domain}
                        <Select.Item value={domain.domain}>{domain.domain}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <div class="space-y-2">
            <Label>Permissions</Label>
            <Select.Root bind:value={selectedPermissions} type="multiple">
                <Select.Trigger class="w-96"
                    >{selectedPermissions.join(", ").slice(0, 45)}...</Select.Trigger>
                <Select.Content>
                    {#each Permissions as permission}
                        <Select.Item value={permission}>{PermissionLabels[permission]}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>

        {#if selectedPermissions.includes("userdetails")}
            <h2>
                <span class="text-red-500">WARNING:</span>
                Giving the API key the "View account details" permission is extremely dangerous, as it
                can expose your IP-address, email, username, list of sessions, list of devices, and
                other sensitive data. It is advised to turn this off unless you absolutely know what
                you are doing.
            </h2>
        {/if}

        <Button
            disabled={!comment}
            onclick={_ => {
                apiCreationLoading = true;
                registerKey();
            }}
            loading={apiCreationLoading}>Create</Button>
    </form>
</div>
