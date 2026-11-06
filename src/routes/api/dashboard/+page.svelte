<script lang="ts">
    import { getAuthToken, redirectToLogin } from "$lib";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import copy from "clipboard-copy";
    import consola from "consola";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import MaterialSymbolsArrowBackRounded from "~icons/material-symbols/arrow-back-rounded";
    import MaterialSymbolsCheckRounded from "~icons/material-symbols/check-rounded";
    import MaterialSymbolsContentCopy from "~icons/material-symbols/content-copy";
    import MaterialSymbolsDeleteOutlineRounded from "~icons/material-symbols/delete-outline-rounded";
    import MaterialSymbolsKeyRounded from "~icons/material-symbols/key-rounded";
    import MaterialSymbolsLanguage from "~icons/material-symbols/language";
    import MaterialSymbolsShieldOutline from "~icons/material-symbols/shield-outline";
    import MaterialSymbolsVisibility from "~icons/material-symbols/visibility";
    import MaterialSymbolsVisibilityOff from "~icons/material-symbols/visibility-off";
    import {
        AuthError,
        ConflictError,
        PermissionError,
        RateLimitError,
        ServerContactor
    } from "../../../serverContactor";
    import { t } from "$lib/i18n";

    interface Domain {
        type: string;
        domain: string;
        value: string[];
    }

    interface DomainRecord {
        name: string;
        type: string;
        ip: string[];
        registered: number;
        id: string | null;
    }

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
    const PermissionLabels: Record<string, string> = {
        register: t("dashboard.api.permissions.register"),
        modify: t("dashboard.api.permissions.modify"),
        delete: t("dashboard.api.permissions.delete"),
        list: t("dashboard.api.permissions.list"),
        userdetails: t("dashboard.api.permissions.userdetails")
    };

    let apiKeys: Key[] = $state([]);
    let keysLoaded: boolean = $state(false);

    let domainsLoaded: boolean = $state(false);
    let domains: Domain[] = $state([]);

    let selectedDomains: string[] = $state([]);
    let selectedPermissions: string[] = $state([]);
    let apiCreationLoading: boolean = $state(false);

    let comment: string = $state("");
    let copiedKeyHash: string | null = $state(null);

    let pageErrorTitle: string = $state("");
    let pageErrorDescription: string = $state("");
    let pageAlertUpdate: number = $state(0);

    let creationErrorTitle: string = $state("");
    let creationErrorDescription: string = $state("");
    let creationAlertUpdate: number = $state(0);

    let serverContactor: ServerContactor;

    function showPageRateLimitError(error: unknown) {
        if (!(error instanceof RateLimitError)) return false;

        pageErrorTitle = error.title;
        pageErrorDescription = error.message;
        pageAlertUpdate++;
        return true;
    }

    function showCreationRateLimitError(error: unknown) {
        if (!(error instanceof RateLimitError)) return false;

        creationErrorTitle = error.title;
        creationErrorDescription = error.message;
        creationAlertUpdate++;
        return true;
    }

    async function getKey(key: Key): Promise<string> {
        if (key.decrypted && key.decrypted !== "Loading..") {
            return key.decrypted;
        }
        key.decrypted = "Loading..";
        try {
            const data = await serverContactor.getApiKey(key.hash);
            key.decrypted = data ?? "";
            return key.decrypted;
        } catch (error) {
            key.decrypted = "";
            if (showPageRateLimitError(error)) throw error;
            if (error instanceof AuthError) {
                redirectToLogin(460);
            }
            return "";
        }
    }

    async function copyApiKey(key: Key) {
        try {
            let secret = key.decrypted;
            if (!secret || secret === "Loading..") {
                secret = await getKey(key);
            }
            if (secret) {
                await copy(secret);
                copiedKeyHash = key.hash;
                toast.success(t("dashboard.api.messages.copied"));
                setTimeout(() => {
                    if (copiedKeyHash === key.hash) {
                        copiedKeyHash = null;
                    }
                }, 2000);
            }
        } catch (e) {
            toast.error(t("dashboard.api.messages.copyFailed"));
        }
    }

    async function toggleKeyVisibility(key: Key) {
        if (!key.visible && (!key.decrypted || key.decrypted === "Loading..")) {
            await getKey(key);
        }
        key.visible = !key.visible;
    }

    function deleteKey(key: Key) {
        consola.debug(`Deleting key with comment ${key.comment}`);
        key.deletionLoading = true;
        serverContactor
            .deleteApiKey(key.hash)
            .catch(error => {
                key.deletionLoading = false;
                if (showPageRateLimitError(error)) throw error;
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                }
                toast.error(t("dashboard.api.messages.deleteFailed"));
            })
            .then(data => {
                key.deletionLoading = false;
                key.dialogOpen = false;
                apiKeys = apiKeys.filter(apiKey => apiKey.hash !== key.hash);
                toast.success(t("dashboard.api.messages.deleted"));
            });
    }

    async function registerKey() {
        if (!comment.trim()) {
            toast.error(t("dashboard.api.messages.enterName"));
            return;
        }
        if (selectedDomains.length === 0) {
            toast.error(t("dashboard.api.messages.selectDomain"));
            return;
        }
        if (selectedPermissions.length === 0) {
            toast.error(t("dashboard.api.messages.selectPermission"));
            return;
        }

        apiCreationLoading = true;
        try {
            await serverContactor.createApiKey(
                comment.trim(),
                selectedDomains,
                // @ts-expect-error selectedPermissions typed as string[] instead of string literal
                selectedPermissions
            );
            apiCreationLoading = false;
            toast.success(t("dashboard.api.messages.created"), {
                description: t("dashboard.api.messages.refreshing")
            });
            window.location.reload();
        } catch (error) {
            apiCreationLoading = false;
            if (showCreationRateLimitError(error)) return;
            if (error instanceof AuthError) {
                redirectToLogin(460);
                return;
            }
            if (error instanceof ConflictError) {
                creationErrorTitle = t("dashboard.api.messages.limitReachedTitle");
                creationErrorDescription =
                    error.message ||
                    t("dashboard.api.messages.limitReachedDesc");
                creationAlertUpdate++;
                return;
            }
            if (error instanceof PermissionError) {
                creationErrorTitle = t("dashboard.api.messages.permissionErrorTitle");
                creationErrorDescription = error.message || t("dashboard.api.messages.permissionErrorDesc");
                creationAlertUpdate++;
                return;
            }
            creationErrorTitle = t("dashboard.api.messages.createFailedTitle");
            creationErrorDescription =
                error instanceof Error && error.message
                    ? error.message
                    : t("errors.general.unhandledTitle");
            creationAlertUpdate++;
        }
    }

    function getHiddenDots(decryptedKey?: string) {
        return "•".repeat(decryptedKey?.length || 0);
    }

    function getKeyValue(key: Key): string {
        if (key.visible) {
            return key.decrypted || t("common.actions.loading");
        }
        return getHiddenDots(key.decrypted);
    }

    function getDomainsLabel(selected: string[]): string {
        if (selected.length === 0) {
            return t("dashboard.api.labels.selectDomains");
        }

        if (selected.includes("*")) {
            return t("dashboard.api.labels.allDomains");
        }

        if (selected.length < 3) {
            return selected.join(", ");
        }

        return `${selected[0]}, ${selected[1]}, ${t("dashboard.api.labels.moreDomains", { count: selected.slice(2).length })}`;
    }

    function getPermissionsLabel(selected: string[]): string {
        if (selected.length === 0) return t("dashboard.api.labels.selectPermissions");
        return selected.map(p => PermissionLabels[p] || p).join(", ");
    }

    onMount(() => {
        const authToken = getAuthToken() ?? null;
        if (!authToken) {
            redirectToLogin(460);
            return;
        }

        serverContactor = new ServerContactor(authToken);
        serverContactor
            .getApiKeys()
            .catch(error => {
                keysLoaded = true;
                if (showPageRateLimitError(error)) throw error;
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                }
            })
            .then(async data => {
                if (!data) {
                    keysLoaded = true;
                    return;
                }
                const userKeys = Object.entries(data);
                const loaded: Key[] = await Promise.all(
                    userKeys.map(async ([keyHash, value]) => {
                        let decrypted = "";
                        try {
                            decrypted = (await serverContactor.getApiKey(keyHash)) ?? "";
                        } catch (e) {
                            consola.error("Failed to load api key secret", e);
                        }
                        return {
                            hash: keyHash,
                            comment: value.comment,
                            perms: value.perms,
                            domains: value.domains,
                            decrypted,
                            visible: false,
                            dialogOpen: false
                        };
                    })
                );
                apiKeys = loaded;
                keysLoaded = true;
            });

        serverContactor
            .getDomains()
            .catch(error => {
                domainsLoaded = true;
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                } else if (showPageRateLimitError(error)) {
                    return;
                } else {
                    console.error(error);
                    pageErrorTitle = "Failed to load domains";
                    pageErrorDescription = "Please contact support if this error persists.";
                    pageAlertUpdate++;
                }
            })
            .then(data => {
                domainsLoaded = true;
                if (!data) return;
                const userDomains = data["domains"] as unknown as DomainRecord[];
                const domainList: Domain[] = [];
                for (let value of userDomains) {
                    domainList.push({
                        type: value.type,
                        domain: value.name,
                        value: value.ip
                    });
                }
                domains = domainList;
            });
    });

    $effect(() => {
        if (selectedDomains.includes('*') && selectedDomains.length > 1) selectedDomains = ['*'];
    });
</script>

<svelte:head>
    <title>{t("dashboard.api.title")} | eepy.page</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
    <div class="flex items-center justify-between">
        <Button
            href="/account/manage"
            variant="ghost"
            size="sm"
            class="gap-1.5 text-muted-foreground hover:text-foreground">
            <MaterialSymbolsArrowBackRounded class="size-4" />
            {t("dashboard.api.backToAccount")}
        </Button>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
            <div class="flex items-center gap-3">
                <IconBadge size="lg" variant="primary">
                    <MaterialSymbolsKeyRounded class="size-6" />
                </IconBadge>
                <div>
                    <h1 class="text-3xl font-bold">{t("dashboard.api.title")}</h1>
                    <p class="text-muted-foreground text-sm">
                        {t("dashboard.api.subtitle")}
                    </p>
                </div>
            </div>
        </div>

        {#if keysLoaded && apiKeys.length > 0}
            <Button
                onclick={() => {
                    document.getElementById("create-key-section")?.scrollIntoView({ behavior: "smooth" });
                    document.getElementById("key-comment")?.focus();
                }}
                variant="default"
                size="sm"
            >
                {t("dashboard.api.createButton")}
            </Button>
        {/if}
    </div>

    <InlineAlert
        variant="error"
        title={pageErrorTitle}
        description={pageErrorDescription}
        trigger={pageAlertUpdate} />

    <section class="space-y-4">
        <h2 class="text-lg font-semibold">{t("dashboard.api.yourKeys")}</h2>

        {#if !keysLoaded}
            <div class="space-y-4">
                {#each [1, 2] as _}
                    <Card.Root class="p-6 space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <Skeleton class="size-10 rounded-xl" />
                                <div class="space-y-1.5">
                                    <Skeleton class="h-5 w-40" />
                                    <Skeleton class="h-3.5 w-24" />
                                </div>
                            </div>
                            <Skeleton class="h-9 w-20 rounded-md" />
                        </div>
                        <Skeleton class="h-10 w-full rounded-md" />
                        <div class="flex gap-2 pt-2">
                            <Skeleton class="h-6 w-20 rounded-md" />
                            <Skeleton class="h-6 w-28 rounded-md" />
                        </div>
                    </Card.Root>
                {/each}
            </div>
        {:else if apiKeys.length === 0}
            <Card.Root class="border-dashed py-12 text-center">
                <Card.Content class="flex flex-col items-center justify-center space-y-3">
                    <IconBadge variant="muted" size="xl" shape="circle">
                        <MaterialSymbolsKeyRounded class="size-7" />
                    </IconBadge>
                    <div class="space-y-1 max-w-md">
                        <h3 class="text-base font-semibold">{t("dashboard.api.emptyTitle")}</h3>
                        <p class="text-muted-foreground text-sm">
                            {t("dashboard.api.emptyDesc")}
                        </p>
                    </div>
                </Card.Content>
            </Card.Root>
        {:else}
            <div transition:fade={{ duration: 100 }} class="space-y-4">
                {#each apiKeys as key (key.hash)}
                    <Card.Root class="overflow-hidden transition-all duration-200 hover:border-border/80 gap-4">
                        <Card.Header class="flex flex-row items-start justify-between gap-4 pb-3">
                            <div class="flex items-start gap-3 min-w-0">
                                <IconBadge size="md" variant="secondary" class="mt-0.5">
                                    <MaterialSymbolsKeyRounded class="size-5" />
                                </IconBadge>
                                <div class="min-w-0">
                                    <Card.Title class="text-lg font-semibold truncate">
                                        {key.comment || "Unnamed Key"}
                                    </Card.Title>
                                    <p class="text-muted-foreground font-mono text-xs truncate mt-0.5">
                                        ID/Hash: <span class="font-mono! text-[0.7rem]">{key.hash}</span>
                                    </p>
                                </div>
                            </div>

                            <Dialog.Root
                                onOpenChange={open => (key.dialogOpen = open)}
                                open={key.dialogOpen}>
                                <Dialog.Trigger>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5">
                                        <MaterialSymbolsDeleteOutlineRounded class="size-4" />
                                        <span class="hidden sm:inline">{t("common.actions.delete")}</span>
                                    </Button>
                                </Dialog.Trigger>
                                <Dialog.Content>
                                    <Dialog.Header>
                                        <Dialog.Title>{t("dashboard.api.deleteDialog.title")}</Dialog.Title>
                                        <Dialog.Description>
                                            {t("dashboard.api.deleteDialog.description", { name: key.comment || "this key" })}
                                        </Dialog.Description>
                                    </Dialog.Header>
                                    <Dialog.Footer class="gap-2 sm:gap-0">
                                        <Button
                                            variant="outline"
                                            onclick={() => (key.dialogOpen = false)}>
                                            {t("common.actions.cancel")}
                                        </Button>
                                        <Button
                                            onclick={() => deleteKey(key)}
                                            loading={key.deletionLoading}
                                            variant="destructive">
                                            {t("dashboard.api.deleteDialog.confirm")}
                                        </Button>
                                    </Dialog.Footer>
                                </Dialog.Content>
                            </Dialog.Root>
                        </Card.Header>

                        <Card.Content class="space-y-4">
                            <div class="space-y-1.5">
                                <Label class="text-xs font-medium text-muted-foreground">{t("dashboard.api.labels.key")}</Label>
                                <div class="flex items-center gap-2">
                                    <div class="relative flex-1">
                                        <Input
                                            disabled={true}
                                            type={key.visible ? "text" : "password"}
                                            value={getKeyValue(key)}
                                            class="font-mono! text-xs pr-10 bg-muted/40 cursor-text select-all" />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onclick={() => toggleKeyVisibility(key)}
                                        aria-label={key.visible ? "Hide API Key" : "Reveal API Key"}
                                        title={key.visible ? "Hide API Key" : "Reveal API Key"}
                                        class="shrink-0">
                                        {#if key.visible}
                                            <MaterialSymbolsVisibilityOff class="size-4" />
                                        {:else}
                                            <MaterialSymbolsVisibility class="size-4" />
                                        {/if}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onclick={() => copyApiKey(key)}
                                        aria-label="Copy API Key"
                                        title="Copy API Key"
                                        class="shrink-0">
                                        {#if copiedKeyHash === key.hash}
                                            <MaterialSymbolsCheckRounded class="size-4 text-green-500" />
                                        {:else}
                                            <MaterialSymbolsContentCopy class="size-4" />
                                        {/if}
                                    </Button>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50 text-sm">
                                <div class="space-y-1.5">
                                    <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <MaterialSymbolsShieldOutline class="size-3.5" />
                                        <span>{t("dashboard.api.labels.permissions")}</span>
                                    </div>
                                    <div class="flex flex-wrap gap-1.5">
                                        {#if key.perms && key.perms.length > 0}
                                            {#each key.perms as perm}
                                                <span
                                                    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-secondary/70 text-secondary-foreground border-border/50">
                                                    {PermissionLabels[perm] || perm}
                                                </span>
                                            {/each}
                                        {:else}
                                            <span class="text-xs text-muted-foreground italic">{t("dashboard.api.labels.none")}</span>
                                        {/if}
                                    </div>
                                </div>

                                <div class="space-y-1.5">
                                    <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <MaterialSymbolsLanguage class="size-3.5" />
                                        <span>{t("dashboard.api.labels.domains")}</span>
                                    </div>
                                    <div class="flex flex-wrap gap-1.5">
                                        {#if key.domains && key.domains.length > 0}
                                            {#each key.domains as domain}
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-muted text-muted-foreground border border-border/50">
                                                    {domain === "*" ? t("dashboard.api.labels.allDomains") : domain}
                                                </span>
                                            {/each}
                                        {:else}
                                            <span class="text-xs text-muted-foreground italic">{t("dashboard.api.labels.none")}</span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </section>

    <section id="create-key-section" class="pt-4">
        <Card.Root>
            <Card.Header>
                <div class="flex items-center gap-2.5">
                    <Card.Title class="text-lg font-semibold">{t("dashboard.api.createForm.title")}</Card.Title>
                </div>
            </Card.Header>

            <Card.Content class="space-y-5">
                <form
                    onsubmit={e => {
                        e.preventDefault();
                        registerKey();
                    }}
                    class="space-y-5">
                    <div class="space-y-2">
                        <Label for="key-comment" class="text-sm font-medium">{t("dashboard.api.createForm.nameLabel")}</Label>
                        <Input
                            id="key-comment"
                            placeholder={t("dashboard.api.createForm.namePlaceholder")}
                            bind:value={comment}
                            class="w-full max-w-xl" />
                        <p class="text-muted-foreground text-xs">
                            {t("dashboard.api.createForm.nameHint")}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label class="text-sm font-medium">{t("dashboard.api.createForm.domainsLabel")}</Label>
                        <div class="w-full max-w-xl">
                            <Select.Root bind:value={selectedDomains} type="multiple">
                                <Select.Trigger class="w-full">
                                    <span class={selectedDomains.length === 0 ? "text-muted-foreground" : "font-medium truncate"}>
                                        {getDomainsLabel(selectedDomains)}
                                    </span>
                                </Select.Trigger>
                                <Select.Content class="max-h-60 overflow-y-auto">
                                    <Select.Item value="*">{t("dashboard.api.labels.allDomains")}</Select.Item>
                                    {#each domains as domain}
                                        <Select.Item value={domain.domain} disabled={selectedDomains.includes('*')}>
                                            {domain.domain}
                                        </Select.Item>
                                    {/each}
                                </Select.Content>
                            </Select.Root>
                        </div>
                        <p class="text-muted-foreground text-xs">
                            {t("dashboard.api.createForm.domainsHint")}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label class="text-sm font-medium">{t("dashboard.api.createForm.permissionsLabel")}</Label>
                        <div class="w-full max-w-xl">
                            <Select.Root bind:value={selectedPermissions} type="multiple">
                                <Select.Trigger class="w-full">
                                    <span class={selectedPermissions.length === 0 ? "text-muted-foreground" : "font-medium truncate"}>
                                        {getPermissionsLabel(selectedPermissions)}
                                    </span>
                                </Select.Trigger>
                                <Select.Content class="max-h-60 overflow-y-auto">
                                    {#each Permissions as permission}
                                        <Select.Item value={permission}>
                                            {PermissionLabels[permission]}
                                        </Select.Item>
                                    {/each}
                                </Select.Content>
                            </Select.Root>
                        </div>
                        <p class="text-muted-foreground text-xs">
                            {t("dashboard.api.createForm.permissionsHint")}
                        </p>
                    </div>

                    <InlineAlert
                        variant="error"
                        title={creationErrorTitle}
                        description={creationErrorDescription}
                        trigger={creationAlertUpdate}
                        className="max-w-xl" />

                    <div class="pt-2">
                        <Button
                            type="submit"
                            disabled={!comment.trim() || selectedDomains.length === 0 || selectedPermissions.length === 0}
                            loading={apiCreationLoading}
                        >{t("dashboard.api.createForm.submit")}</Button>
                    </div>
                </form>
            </Card.Content>
        </Card.Root>
    </section>
</div>
