<script lang="ts">
    import { getAuthToken } from "$lib";
    import Loader from "$lib/components/Loader.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import { toast } from "svelte-sonner";
    import MaterialSymbolsAttachMoneyRounded from "~icons/material-symbols/attach-money-rounded";
    import { redirectToLogin } from "../../helperFuncs";
    import { shouldRedirectToLogin } from "../../authGuard";
    import {
        AuthError,
        ConflictError,
        DNSError,
        LimitError,
        PermissionError,
        ServerContactor,
    } from "../../serverContactor";

    import { browser } from "$app/environment";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { AVAILABLE_TLDS } from "$lib/types";
    import consola from "consola";
    import Cookies from "js-cookie";
    import { fade } from "svelte/transition";

    interface Domain {
        type: string;
        domain: string;
        values: string[];
    }

    interface DomainRecord {
        name: string;
        type: string;
        ip: string[];
        registered: number;
        id: string | null;
    }

    interface DashboardDomain extends Domain {
        tld: string;
        name: string;
        originalType: string;
        isLoading: boolean;
        deletionLoading: boolean;
        dialogOpen: boolean;
        serveoTunnel: boolean;
    }

    let { data } = $props();

    let ownedTlds: string[] = $state([]);

    let domains: DashboardDomain[] = $state([]);
    let domainsLoaded: boolean = $state(false);

    let registerNewDomainLoading: boolean = $state(false);
    let newDomain: string = $state("");
    let newDomainType: string = $state("A");
    let newDomainTld: string = $state(".eepy.page");

    let registerErrorTitle: string = $state("");
    let registerErrorDescription: string = $state("");

    let registerNoteTitle: string = $state("");
    let registerNoteDescription: string = $state("");

    let domainErrorTitle: string = $state("");
    let domainErrorDescription: string = $state("");

    let alertUpdate: number = $state(0);

    let serverContactor: ServerContactor;
    let loader: Loader;

    const SupportedTypes = ["A", "AAAA", "CNAME", "TXT"];

    function sortDomains(domainList: DashboardDomain[]): DashboardDomain[] {
        return domainList.map((domain, index) => ({ domain, index })).sort((left, right) => {
            const leftName = left.domain.domain.toLowerCase().replaceAll("_", "");
            const rightName = right.domain.domain.toLowerCase().replaceAll("_", "");
            if (leftName < rightName) {
                return -1;
            } else if (leftName > rightName) {
                return 1;
            }

            const leftType = left.domain.type.toLowerCase();
            const rightType = right.domain.type.toLowerCase();
            if (leftType < rightType) {
                return -1;
            } else if (leftType > rightType) {
                return 1;
            }

            return left.index - right.index;
        }).map(({ domain }) => domain);
    }

    function deleteDomain(domain: string, type: string, button: DashboardDomain) {
        consola.info(`Deleting domain ${domain}`);
        domainErrorTitle = "";
        domainErrorDescription = "";
        alertUpdate++;

        serverContactor
            .deleteDomain(domain, type)
            .catch(error => {
                consola.info(`Failed to delete domain ${domain}`);

                button.deletionLoading = false;
                if (error instanceof AuthError) redirectToLogin(460);

                domainErrorTitle = "Could not delete domain";
                domainErrorDescription = "An unhandled error occurred.";
                alertUpdate++;

                throw new Error("Failed to delete domain");
            })
            .then(() => {
                consola.info(`Deleted domain ${domain} successfully`);

                window.gtag?.("event", "domain_delete");
                button.deletionLoading = false;
                button.dialogOpen = false;
                toast.success(`Successfully deleted ${domain}`, {
                    description: `${domain} was deleted successfully.`,
                });
                removeDomain(domain, type);
            });
    }

    function registerDomain(domain: string, type: string, tld: string) {
        consola.info("Regsitering a domain");
        registerErrorTitle = "";
        registerErrorDescription = "";
        alertUpdate++;

        serverContactor
            .registerDomain(domain + tld, type)
            .catch(error => {
                consola.warn("Failed to register a domain");
                registerNewDomainLoading = false;
                registerErrorTitle = `Failed to register ${domain + tld}`;

                if (error instanceof AuthError) redirectToLogin(460);
                else if (error instanceof DNSError) registerErrorDescription = "The domain is invalid";
                else if (error instanceof PermissionError)
                    registerErrorDescription = "You must own all parts of the requested domain.";
                else if (error instanceof LimitError)
                    registerErrorDescription = "You have reached your domain limit. Delete an existing domain before registering another one.";
                else if (error instanceof ConflictError)
                    registerErrorDescription = "The requested domain has already been registered!";
                else {
                    registerErrorDescription = "An unhandled error occurred.";
                }
                alertUpdate++;
                throw new Error("Failed to register domain!");
            })
            .then(values => {
                consola.info("Registered domain");
                registerNewDomainLoading = false;
                window.gtag?.("event", "domain_register");
                toast.success(`Successfully registered ${domain + tld}!`);
                    domains = sortDomains([
                        ...domains,
                        {
                            type,
                            domain: domain + tld,
                            values,
                            isLoading: false,
                            deletionLoading: false,
                            dialogOpen: false,
                            tld: tld,
                            name: domain,
                            originalType: type,
                            serveoTunnel: false,
                        },
                    ]);
                Cookies.set("domain-amount", domains.length.toString());
            });
    }

    function modifyDomain(domain: DashboardDomain) {
        domainErrorTitle = "";
        domainErrorDescription = "";
        alertUpdate++;
        consola.info(`Modifying domain ${domain.domain}`);

        serverContactor
            .modifyDomain(domain.domain, domain.values, domain.type, domain.originalType)
            .catch(error => {
                consola.warn("Failed to modify domain");
                domain.isLoading = false;
                domainErrorTitle = `Error modifying ${domain.domain}`;

                if (error instanceof AuthError) redirectToLogin(460);
                else if (error instanceof DNSError)
                    domainErrorDescription = "Please ensure the 'value' field is correct.";
                else if (error instanceof PermissionError)
                    domainErrorDescription = "You must own all parts of the requested domain.";
                else {
                    domainErrorDescription = "An unhandled error occurred.";
                }
                alertUpdate++;
                throw Error("Failed to modify domain."); // stops execution to the .then block
            })
            .then(() => {
                consola.warn("Modified domain");

                window.gtag?.("event", "domain_modify");
                domain.isLoading = false;
                domain.originalType = domain.type;
                toast.success(`Successfully modified ${domain.domain}!`);
            });
    }

    function removeDomain(name: string, type: string) {
        consola.debug("Removing domain from frontend");
        domains = domains.filter((domain) => domain.domain !== name || domain.type !== type);
        domains = [...domains];
    }

    function createPlaceholders(amount: number): DashboardDomain[] {
        return new Array(amount) as DashboardDomain[];
    }

    if (browser) {
        const authToken = getAuthToken() ?? null;
        if (shouldRedirectToLogin(authToken, window.location.pathname)) {
            redirectToLogin(460);
        } else {
            serverContactor = new ServerContactor(authToken, localStorage.getItem("server_url") ?? null);
            serverContactor
                .getDomains()
            .catch(error => {
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                } else {
                    console.error(error);
                    domainErrorTitle = "Failed to load domains";
                    domainErrorDescription = "Please contact support if this error persists.";
                    throw new Error("Failed to load domains");
                }
            })
            .then(async data => {
                if (!data) return;
                domainsLoaded = true;
                // @ts-expect-error
                ownedTlds = data["owned-tlds"];

                const userDomains = data["domains"] as unknown as DomainRecord[];

                Cookies.set("domain-amount", userDomains.length.toString());

                let tunnelHosts = new Set<string>();
                let tunnelRecords = new Set<string>();
                try {
                    const tunnelData = await serverContactor.serveoTunnels();
                    for (const tunnel of tunnelData.tunnels ?? []) {
                        tunnelHosts.add(tunnel.hostname);
                        tunnelRecords.add(tunnel.serveo_auth_record);
                        if (!userDomains.some(domain => domain.name === tunnel.serveo_auth_record && domain.type === "TXT")) {
                            userDomains.push({
                                name: tunnel.serveo_auth_record,
                                type: "TXT",
                                ip: [tunnel.ssh_fingerprint],
                                registered: 0,
                                id: null,
                            });
                        }
                    }
                } catch (_) {
                    // Ignore errors; tunneling is not necessary

                    // In the future maybe I want to differentiate between when someone simply
                    // isn't using tunneling vs. when it errors out (real error)
                }

                const dashboardDomains: DashboardDomain[] = [];
                for (let value of userDomains) {
                    const key = value.name;
                    const lastDot = key.lastIndexOf(".");
                    const secondLastDot = key.lastIndexOf(".", lastDot - 1);

                    const name = key.slice(0, secondLastDot);
                    const tld = key.slice(secondLastDot + 1);
                    const domain = {
                        type: value.type,
                        domain: key,
                        values: value.ip as string[],
                        isLoading: false,
                        deletionLoading: false,
                        dialogOpen: false,
                        tld: tld,
                        name: name,
                        originalType: value.type,
                        serveoTunnel: tunnelHosts.has(key) || tunnelRecords.has(key),
                    };
                    dashboardDomains.push(domain);
                }
                domains = sortDomains(dashboardDomains);
            });
        }
    }

    $effect(() => {
        const isEepy = newDomain.includes(".eepy.page");
        const isVercel = newDomain.includes("_vercel");

        let newTitle = null;
        let newDesc = null;

        if (isEepy) {
            newTitle = 'Please remove the ".eepy.page" suffix.';
            newDesc = 'eepy.page automatically adds the ".eepy.page" portion of your domain';
        } else if (isVercel) {
            newTitle = "Trying to verify a Vercel domain?";
            newDesc = `This requires an extra step. Please go to <a href="${window.location.origin}/account/verify/vercel">${window.location.origin}/account/verify/vercel</a> to verify.`;
        }

        const changed = registerNoteTitle !== newTitle || registerNoteDescription !== newDesc;

        if (changed) {
            registerNoteTitle = newTitle!;
            registerNoteDescription = newDesc!;
            alertUpdate++;
        }
    });
</script>

<svelte:head>
    <title>Dashboard | eepy.page</title>
    <meta content="eepy.page dashboard" property="og:title" />
    <meta content="Manage all of your domains here!" property="og:description" />
    <meta content="Manage all of your domains here!" name="description" />
    <meta content="https://eepy.page/dashboard" property="og:url" />
    <meta content="https://eepy.page/fse1.webp" property="og:image" />
    <meta content="#007be1" data-react-helmet="true" name="theme-color" />
</svelte:head>

<Loader bind:this={loader} />

<div class="domain-holder bg-card max-w-8xl sentry-unmask mt-8 mr-auto ml-auto w-11/12 rounded-2xl p-6">
    <h1 class="text-3xl font-semibold">Your domains</h1>
    <p class="mb-3">These are all of your domains. Modify them by using the dropdowns, fields, and buttons provided for each domain.</p>

    <InlineAlert
        variant={"error"}
        title={domainErrorTitle}
        description={domainErrorDescription}
        className="mb-6 mt-6"
        trigger={alertUpdate} />

    <div class="domains space-y-4">
        {#if domainsLoaded && domains.length === 0}
            <div class="rounded-xl border border-dashed p-6 text-center">
                <h2 class="text-xl font-semibold">No domains</h2>
                <p class="text-muted-foreground">You don't have any domains &colon;&lpar;<br>Register one below to get started!</p>
            </div>
        {:else}
            {#each domainsLoaded ? domains : createPlaceholders(data.domainAmount) as domain}
                <div transition:fade class="domain mt-1 mb-1 flex min-h-10 gap-1 space-y-0.5">
                    <div class="basic-controls flex w-2/5 gap-1">
                        {#if domainsLoaded}
                            <Select.Root type="single" name="domain" bind:value={domain.type} disabled={domain.serveoTunnel}>
                                <Select.Trigger class="w-1/8 min-w-24">{domain.type}</Select.Trigger>
                                <Select.Content>
                                    {#each SupportedTypes as type}
                                        <Select.Item value={type} label={type}>
                                            {type}
                                        </Select.Item>
                                    {/each}
                                </Select.Content>
                            </Select.Root>
                        {:else}
                            <Skeleton class="w-1/8 min-w-24" />
                        {/if}
                        <div class="domain-name flex w-full">
                            {#if domainsLoaded}
                                <Input class="rounded-r-none" value={domain.name} disabled={true} />
                                <Input
                                    class="w-min max-w-[15ch] shrink-0 rounded-l-none border-l-0"
                                    value={domain.tld}
                                    disabled={true} />
                            {:else}
                                <Skeleton class="w-full" />
                            {/if}
                        </div>
                    </div>
                    <div class="value min-w-0 w-2/5">
                        {#if domainsLoaded && domain.values}
                            {#each domain.values as _, i}
                                <div class="flex min-w-0 gap-0">
                                    <Input class="mb-1 min-w-0 flex-1 rounded-r-none" bind:value={domain.values[i]} disabled={domain.serveoTunnel} />
                                    <div class="flex h-9 w-16 shrink-0">
                                        <Button
                                            class="text-xl w-1/2 min-w-0 rounded-none px-0"
                                            onclick={_ => domain.values.push("0.0.0.0")}
                                            disabled={domain.serveoTunnel}
                                            variant="secondary">+</Button>

                                        <Button
                                            class="text-xl bg-destructive/30! w-1/2 min-w-0 rounded-l-none px-0"
                                            onclick={_ => {
                                                domain.values = domain.values.filter((val, idx) => idx != i);
                                            }}
                                            disabled={domain.serveoTunnel || domain.values.length <= 1}
                                            variant="destructive">-</Button>
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <Skeleton class="h-10 w-full" />
                        {/if}
                    </div>
                    <div class="actions flex h-full min-w-0 w-1/4 gap-0.5">
                        {#if domainsLoaded}
                            <Button
                                loading={domain.isLoading}
                                onclick={_ => {
                                    domain.isLoading = true;
                                    modifyDomain(domain);
                                }}
                                disabled={domain.serveoTunnel}
                                class="h-full min-h-8 w-1/2 max-w-40">Save</Button>
                            <Separator orientation={"vertical"} />
                            {#if domain.serveoTunnel}
                                <span
                                    class="domain-delete-tooltip relative flex h-full min-h-8 w-1/2 max-w-40 cursor-not-allowed"
                                    data-tooltip={`Delete the ${domain.name.startsWith("_serveo") ? domain.name.replaceAll("_serveo-authkey.", "") : domain.name}.eepy.page tunnel first to remove this domain`}
                                    aria-label="Delete tunnel first to remove domain">
                                    <Button class="h-full w-full" disabled={true} variant="destructive">Delete</Button>
                                </span>
                            {:else}
                                <Dialog.Root bind:open={domain.dialogOpen}>
                                    <Dialog.Trigger class="h-full min-h-8 w-1/2 max-w-40">
                                        <Button
                                            class="h-full min-h-8 w-full"
                                            variant="destructive">Delete</Button>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                        <Dialog.Header>
                                            <Dialog.Title>Delete {domain.domain}?</Dialog.Title>
                                            <Dialog.Description>
                                                This will permanently delete this {domain.type} record. This action cannot be undone.
                                            </Dialog.Description>
                                        </Dialog.Header>
                                        <Dialog.Footer>
                                            <Dialog.Close>
                                                <Button variant="secondary">Cancel</Button>
                                            </Dialog.Close>
                                            <Button
                                                loading={domain.deletionLoading}
                                                onclick={_ => {
                                                    domain.deletionLoading = true;
                                                    deleteDomain(domain.domain, domain.type, domain);
                                                }}
                                                variant="destructive">Delete</Button>
                                        </Dialog.Footer>
                                    </Dialog.Content>
                                </Dialog.Root>
                            {/if}
                        {:else}
                            <Skeleton class="h-full min-h-10 w-1/2 max-w-40"></Skeleton>
                            <Skeleton class="h-full min-h-10 w-1/2 max-w-40"></Skeleton>
                        {/if}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<div class="registrar bg-card max-w-8xl sentry-unmask mt-8 mr-auto mb-8 ml-auto w-11/12 rounded-2xl p-6">
    <h1 class="text-3xl font-semibold">Register a domain</h1>
    <p class="mb-3">You can register a new domain here. <em>Tip: Pick something short, memorable, and easy to type.</em></p>
    <div class="content flex gap-2 space-y-2">
        <Select.Root bind:value={newDomainType} type="single" name="domain">
            <Select.Trigger class="w-1/8 min-w-24">{newDomainType}</Select.Trigger>
            <Select.Content>
                {#each SupportedTypes as type}
                    <Select.Item value={type} label={type}>
                        {type}
                    </Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
        <div class="domain-bar flex min-w-0 flex-1">
            <Input
                bind:value={newDomain}
                class="max-w-2xl min-w-0 rounded-r-none"
                placeholder="enter a domain..." />
            <Select.Root
                onValueChange={val => {
                    if (!ownedTlds.includes(val.slice(1))) {
                        let link = AVAILABLE_TLDS.find(v => val === v.tld)?.purchaseLink;
                        consola.log(`Opening ${link}`);
                        newDomainTld = ".eepy.page";
                        window.open(link, "_blank")?.focus();
                    }
                }}
                bind:value={newDomainTld}
                type="single"
                name="domain">
                <Select.Trigger
                    class="w-min max-w-[40ch] shrink-0 rounded-l-none">
                    {newDomainTld}
                </Select.Trigger>
                <Select.Content>
                    {#each AVAILABLE_TLDS.filter(tld => !(tld.hidden && !ownedTlds.includes(tld.tld.slice(1)))) as tld}
                        <Select.Item value={tld.tld} label={tld.tld}>
                            <div class="flex flex-row items-center">
                                {tld.tld}
                                {#if tld.purchaseLink && !ownedTlds.includes(tld.tld.slice(1))}
                                    <MaterialSymbolsAttachMoneyRounded class="text-primary-secondary" />
                                {/if}
                            </div>
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <Button
            loading={registerNewDomainLoading}
            onclick={_ => {
                registerNewDomainLoading = true;
                registerDomain(newDomain, newDomainType, newDomainTld);
            }}
            disabled={!newDomain}
            class="w-24">Register</Button>
    </div>

    <InlineAlert
        variant={"error"}
        title={registerErrorTitle}
        description={registerErrorDescription}
        className="mt-3"
        trigger={alertUpdate} />
    <InlineAlert
        variant={"note"}
        title={registerNoteTitle}
        description={registerNoteDescription}
        className="mt-3"
        trigger={alertUpdate}
        renderDescriptionAsHTML />
</div>

<style>
    .domain-delete-tooltip::after {
        position: absolute;
        z-index: 10;
        right: 0;
        bottom: calc(100% + 0.5rem);
        width: max-content;
        max-width: 18rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        background: var(--foreground);
        color: var(--background);
        content: attr(data-tooltip);
        font-size: 0.875rem;
        line-height: 1.25rem;
        opacity: 0;
        pointer-events: none;
        transform: translateY(0.25rem);
        transition: opacity 150ms ease, transform 150ms ease;
    }

    .domain-delete-tooltip:hover::after,
    .domain-delete-tooltip:focus-visible::after {
        opacity: 1;
        transform: translateY(0);
    }

    @media (orientation: portrait), (max-width: 700px) {
        .domain-holder,
        .registrar {
            margin-top: 1.5rem;
            width: calc(100% - 1rem);
            border-radius: 0.75rem;
            padding: 0.75rem;
        }

        .basic-controls {
            width: 100%;
        }
        .domains {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        .domain {
            flex-direction: column;
            min-height: 0;
            gap: 0.4rem;
        }
        .domain div {
            min-height: 2.5em;
        }
        .value {
            width: 100%;
        }
        .actions {
            width: 100%;
            justify-content: space-between;
        }
        .actions :global(button) {
            max-width: none;
        }

        .content {
            flex-direction: column;
            gap: 0.5rem;
        }
        :global(.registrar .content button) {
            width: 100%;
        }
        .domain-bar {
            width: 100%;
        }
        .domain-bar :global(input) {
            min-width: 0;
        }
    }
</style>
