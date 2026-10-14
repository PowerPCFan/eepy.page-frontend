<script lang="ts">
    import { getAuthToken } from "$lib";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
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
        RateLimitError,
        ServerContactor,
    } from "../../serverContactor";

    import { browser } from "$app/environment";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import { AVAILABLE_TLDS } from "$lib/types";
    import consola from "consola";
    import Cookies from "js-cookie";
    import { slide } from "svelte/transition";
    import Codeblock from "$lib/components/ui/codeblock/codeblock.svelte";

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
        discardDialogOpen: boolean;
        serveoTunnel: boolean;
        isEditing?: boolean;
        draftType?: string;
        draftValues?: string[];
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
                domainErrorDescription = error instanceof RateLimitError
                    ? error.message
                    : "An unhandled error occurred.";
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
                else if (error instanceof RateLimitError)
                    registerErrorDescription = error.message;
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
                            isEditing: false,
                            discardDialogOpen: false,
                            draftType: type,
                            draftValues: [...values],
                        },
                    ]);
                Cookies.set("domain-amount", domains.length.toString());
            });
    }

    function getPlaceholder(type?: string): string {
        switch (type) {
            case "A":
                return "192.0.2.1";
            case "AAAA":
                return "2001:db8::1";
            case "CNAME":
                return "example.com";
            case "TXT":
                return "example-text";
            default:
                return "Enter record value...";
        }
    }

    function isDomainDirty(domain: DashboardDomain): boolean {
        if (!domain.isEditing) return false;
        if (domain.draftType !== domain.type) return true;
        const currentVals = domain.values || [];
        const draftVals = domain.draftValues || [];
        if (currentVals.length !== draftVals.length) return true;
        for (let i = 0; i < currentVals.length; i++) {
            if (currentVals[i] !== draftVals[i]) return true;
        }
        return false;
    }

    function toggleEdit(domain: DashboardDomain) {
        if (domain.serveoTunnel) return;
        if (domain.isEditing) {
            if (isDomainDirty(domain)) {
                domain.discardDialogOpen = true;
            } else {
                cancelEdit(domain);
            }
        } else {
            domain.draftType = domain.type;
            domain.draftValues = [...domain.values];
            domain.discardDialogOpen = false;
            domain.isEditing = true;
        }
    }

    function cancelEdit(domain: DashboardDomain) {
        domain.isEditing = false;
        domain.discardDialogOpen = false;
        domain.draftType = domain.type;
        domain.draftValues = [...domain.values];
    }

    function handleDraftTypeChange(domain: DashboardDomain, newType: string) {
        domain.draftType = newType;
        if (newType === "CNAME" && domain.draftValues && domain.draftValues.length > 1) {
            domain.draftValues = [domain.draftValues[0] ?? ""];
        }
    }

    function addDraftValue(domain: DashboardDomain) {
        if (domain.draftType === "CNAME") return;
        if (!domain.draftValues) domain.draftValues = [];
        let val = "";
        if (domain.draftType === "A") val = "0.0.0.0";
        else if (domain.draftType === "AAAA") val = "::1";
        domain.draftValues = [...domain.draftValues, val];
    }

    function removeDraftValue(domain: DashboardDomain, index: number) {
        if (!domain.draftValues || domain.draftValues.length <= 1) return;
        domain.draftValues = domain.draftValues.filter((_, i) => i !== index);
    }

    async function saveDomainEdit(domain: DashboardDomain) {
        if (!domain.draftValues || domain.draftValues.length === 0) {
            domainErrorTitle = "Validation Error";
            domainErrorDescription = "At least one record value is required.";
            alertUpdate++;
            return;
        }

        const cleanValues = domain.draftValues.map(v => v.trim()).filter(v => v.length > 0);
        if (cleanValues.length === 0) {
            domainErrorTitle = "Validation Error";
            domainErrorDescription = "Record value cannot be empty.";
            alertUpdate++;
            return;
        }

        domain.isLoading = true;
        domainErrorTitle = "";
        domainErrorDescription = "";
        alertUpdate++;

        const newType = domain.draftType || domain.type;

        try {
            await serverContactor.modifyDomain(
                domain.domain,
                cleanValues,
                newType,
                domain.originalType
            );

            window.gtag?.("event", "domain_modify");
            domain.values = cleanValues;
            domain.type = newType;
            domain.originalType = newType;
            domain.isEditing = false;
            domain.isLoading = false;
            domains = sortDomains(domains);
            toast.success(`Successfully updated ${domain.domain}!`);
        } catch (error) {
            domain.isLoading = false;
            domainErrorTitle = `Error modifying ${domain.domain}`;
            if (error instanceof AuthError) redirectToLogin(460);
            else if (error instanceof DNSError)
                domainErrorDescription = "Please ensure the DNS values and record types are valid.";
            else if (error instanceof PermissionError)
                domainErrorDescription = "You must own all parts of the requested domain.";
            else if (error instanceof RateLimitError)
                domainErrorDescription = error.message;
            else {
                domainErrorDescription = "An unhandled error occurred.";
            }
            alertUpdate++;
        }
    }

    function removeDomain(name: string, type: string) {
        consola.debug("Removing domain from frontend");
        domains = domains.filter((domain) => domain.domain !== name || domain.type !== type);
        domains = [...domains];
    }

    function createPlaceholders(amount: number): DashboardDomain[] {
        const count = Math.max(1, Number(amount) || 2);
        return Array.from({ length: count }, () => ({
            type: "A",
            domain: "",
            values: [],
            tld: "",
            name: "",
            originalType: "A",
            isLoading: false,
            deletionLoading: false,
            dialogOpen: false,
            serveoTunnel: false,
            isEditing: false,
            discardDialogOpen: false,
            draftType: "A",
            draftValues: [],
        }));
    }

    if (browser) {
        const authToken = getAuthToken() ?? null;
        if (shouldRedirectToLogin(authToken, window.location.pathname)) {
            redirectToLogin(460);
        } else {
            serverContactor = new ServerContactor(authToken);
            serverContactor
                .getDomains()
            .catch(error => {
                if (error instanceof AuthError) {
                    redirectToLogin(460);
                } else if (error instanceof RateLimitError) {
                    domainErrorTitle = "Failed to load domains";
                    domainErrorDescription = error.message;
                } else {
                    console.error(error);
                    domainErrorTitle = "Failed to load domains";
                    domainErrorDescription = "Please contact support if this error persists.";
                    throw new Error("Failed to load domains");
                }
            })
            .then(async data => {
                if (!data) return;
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
                        isEditing: false,
                        discardDialogOpen: false,
                        draftType: value.type,
                        draftValues: [...((value.ip as string[]) || [])],
                    };
                    dashboardDomains.push(domain);
                }
                domains = sortDomains(dashboardDomains);

                // set this at the end so all of the processing is finished when the dashboard contents show
                domainsLoaded = true;
            });
        }
    }

    $effect(() => {
        const isEepy = newDomain.includes(".eepy.page");

        let newTitle = null;
        let newDesc = null;

        if (isEepy) {
            newTitle = 'Please remove the ".eepy.page" suffix.';
            newDesc = 'eepy.page automatically adds the ".eepy.page" portion of your domain';
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
    <meta content="Manage all of your domains here!" name="description" />
    <meta content="https://eepy.page/dashboard" property="og:url" />
</svelte:head>

<div class="domain-holder bg-card/90 backdrop-blur-md border border-border/70 shadow-sm max-w-8xl sentry-unmask mt-8 mr-auto ml-auto w-11/12 rounded-2xl p-6 sm:p-8">
    <h1 class="text-3xl font-semibold tracking-tight">Your domains</h1>
    <p class="mb-4 text-muted-foreground">These are all of your domains. Click "Edit" on any domain to modify its record type or target values.</p>

    <InlineAlert
        variant={"error"}
        title={domainErrorTitle}
        description={domainErrorDescription}
        className="mb-6 mt-6"
        trigger={alertUpdate} />

    {#if domainsLoaded && domains.length === 0}
        <div class="rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/20">
            <h2 class="text-xl font-semibold">No domains registered</h2>
            <p class="text-muted-foreground mt-1 text-sm">You don't have any domains yet.<br>Register one below to get started!</p>
        </div>
    {:else}
        <div>
            <Table.Root>
                <Table.TableHeader class="bg-secondary/10">
                    <Table.TableRow class="hover:bg-secondary/0">
                        <Table.TableHead>Type</Table.TableHead>
                        <Table.TableHead>Name</Table.TableHead>
                        <Table.TableHead>Value</Table.TableHead>
                        <Table.TableHead class="w-24">Action</Table.TableHead>
                    </Table.TableRow>
                </Table.TableHeader>
                <Table.TableBody>
                    {#each domainsLoaded ? domains : createPlaceholders(data.domainAmount) as domain}
                        <Table.TableRow class={"hover:bg-secondary/20 " + (domain?.isEditing ? "bg-secondary/20" : "")}>
                            <Table.TableCell class="font-mono text-xs font-semibold align-middle py-2.5">
                                {#if domainsLoaded}
                                    <Badge variant="outline" class="font-semibold!">
                                        {domain.type}
                                    </Badge>
                                {:else}
                                    <Skeleton class="h-6 w-16" />
                                {/if}
                            </Table.TableCell>

                            <Table.TableCell class="font-mono text-sm align-middle py-2.5">
                                {#if domainsLoaded}
                                    <span class="font-[450] text-foreground">{domain.name}</span><span class="font-normal text-muted-foreground">.{domain.tld}</span>
                                {:else}
                                    <Skeleton class="h-5 w-72" />
                                {/if}
                            </Table.TableCell>

                            <Table.TableCell class="font-mono! text-xs text-muted-foreground align-middle py-2.5">
                                {#if domainsLoaded && domain.values}
                                    <div class="space-y-0.5 max-w-xl">
                                        {#each domain.values as val}
                                            <!-- <div class="truncate border border-border/40 rounded px-2 py-0.5 text-xs text-foreground/90 font-mono!">
                                                {val || "(empty)"}
                                            </div> -->
                                            <Codeblock
                                                variant="inline"
                                                scrollbar="none"
                                                class="bg-popover block w-full px-1.5 border border-border"
                                                text={val || "(empty)"}
                                            />
                                        {/each}
                                    </div>
                                {:else}
                                    <Skeleton class="h-5 w-56" />
                                {/if}
                            </Table.TableCell>

                            <Table.TableCell class="text-right align-middle py-2.5">
                                {#if domainsLoaded}
                                    <Button
                                        variant={domain.isEditing ? "secondary" : "outline"}
                                        size="sm"
                                        class="h-8 px-3 font-medium text-xs w-full"
                                        disabled={domain.serveoTunnel}
                                        onclick={() => toggleEdit(domain)}>
                                        {domain.isEditing ? "Close" : "Edit"}
                                    </Button>
                                {:else}
                                    <Skeleton class="h-8 w-full" />
                                {/if}
                            </Table.TableCell>
                        </Table.TableRow>

                        {#if domainsLoaded && domain?.isEditing}
                            <Table.TableRow class="bg-card-foreground/2 hover:bg-card-foreground/2 border-b">
                                <Table.TableCell colspan={4} class="p-3 sm:p-4">
                                    <div transition:slide={{ duration: 160 }} class="space-y-3">
                                        <div class="flex flex-col md:flex-row gap-3 items-start">
                                            <div class="w-full md:w-32 shrink-0 space-y-1">
                                                <Label class="text-xs text-muted-foreground font-medium">Record Type</Label>
                                                <Select.Root
                                                    type="single"
                                                    name="domain"
                                                    bind:value={domain.draftType}
                                                    onValueChange={(val) => val && handleDraftTypeChange(domain, val)}>
                                                    <Select.Trigger class="w-full h-9 font-mono! font-medium">{domain.draftType}</Select.Trigger>
                                                    <Select.Content>
                                                        {#each SupportedTypes as type}
                                                            <Select.Item class="font-mono!" value={type} label={type}>{type}</Select.Item>
                                                        {/each}
                                                    </Select.Content>
                                                </Select.Root>
                                            </div>

                                            <div class="w-full flex-1 space-y-1">
                                                <Label class="text-xs text-muted-foreground font-medium">Record Values</Label>
                                                <div class="space-y-1.5">
                                                    {#if domain.draftValues}
                                                        {#each domain.draftValues as _, i}
                                                            <div class="flex min-w-0 gap-0">
                                                                <Input
                                                                    class="min-w-0 flex-1 {domain.draftType !== 'CNAME' ? 'rounded-r-none' : ''} font-mono! text-sm h-9 bg-background"
                                                                    placeholder={getPlaceholder(domain.draftType)}
                                                                    bind:value={domain.draftValues[i]}
                                                                />
                                                                {#if domain.draftType !== "CNAME"}
                                                                    <div class="flex h-9 w-16 shrink-0">
                                                                        <Button
                                                                            class="text-base hover:brightness-125 font-semibold w-1/2 min-w-0 rounded-none px-0 transition-all!"
                                                                            onclick={() => addDraftValue(domain)}
                                                                            variant="secondary"
                                                                            title="Add record">+</Button>
                                                                        <Button
                                                                            class="text-base font-semibold bg-destructive/65 text-white hover:bg-destructive/90 w-1/2 min-w-0 rounded-l-none px-0 transition-all!"
                                                                            onclick={() => removeDraftValue(domain, i)}
                                                                            disabled={domain.draftValues.length <= 1}
                                                                            variant="ghost"
                                                                            title="Remove record">–</Button>
                                                                    </div>
                                                                {/if}
                                                            </div>
                                                        {/each}
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex items-center justify-between pt-2 border-t border-border/40">
                                            {#if domain.serveoTunnel}
                                                <Tooltip.Provider>
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger class="cursor-not-allowed">
                                                            <Button size="sm" disabled={true} variant="destructive">Delete</Button>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Content class="max-w-xs text-xs">
                                                            Delete the {domain.name.startsWith("_serveo") ? domain.name.replaceAll("_serveo-authkey.", "") : domain.name}.eepy.page tunnel first to remove this domain
                                                        </Tooltip.Content>
                                                    </Tooltip.Root>
                                                </Tooltip.Provider>
                                            {:else}
                                                <AlertDialog.Root bind:open={domain.dialogOpen}>
                                                    <AlertDialog.Trigger>
                                                        <Button size="sm" variant="destructive">Delete</Button>
                                                    </AlertDialog.Trigger>
                                                    <AlertDialog.Content>
                                                        <AlertDialog.Header>
                                                            <AlertDialog.Title>Delete {domain.domain}?</AlertDialog.Title>
                                                            <AlertDialog.Description>
                                                                This will permanently delete this {domain.type} record. This action cannot be undone.
                                                            </AlertDialog.Description>
                                                        </AlertDialog.Header>
                                                        <AlertDialog.Footer>
                                                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                                            <AlertDialog.Action
                                                                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                onclick={_ => {
                                                                    domain.deletionLoading = true;
                                                                    deleteDomain(domain.domain, domain.type, domain);
                                                                }}>
                                                                Delete
                                                            </AlertDialog.Action>
                                                        </AlertDialog.Footer>
                                                    </AlertDialog.Content>
                                                </AlertDialog.Root>
                                            {/if}

                                            <div class="flex items-center gap-2">
                                                {#if isDomainDirty(domain)}
                                                    <AlertDialog.Root bind:open={domain.discardDialogOpen}>
                                                        <AlertDialog.Trigger>
                                                            <Button variant="destructive" class="w-20" size="sm">
                                                                Discard
                                                            </Button>
                                                        </AlertDialog.Trigger>
                                                        <AlertDialog.Content>
                                                            <AlertDialog.Header>
                                                                <AlertDialog.Title>Discard unsaved changes?</AlertDialog.Title>
                                                                <AlertDialog.Description>
                                                                    You have unsaved changes to this record. Discarding will revert the record back to its saved state.
                                                                </AlertDialog.Description>
                                                            </AlertDialog.Header>
                                                            <AlertDialog.Footer>
                                                                <AlertDialog.Cancel>Keep Editing</AlertDialog.Cancel>
                                                                <AlertDialog.Action
                                                                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onclick={() => cancelEdit(domain)}>
                                                                    Discard Changes
                                                                </AlertDialog.Action>
                                                            </AlertDialog.Footer>
                                                        </AlertDialog.Content>
                                                    </AlertDialog.Root>
                                                {:else}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        class="w-20"
                                                        onclick={() => cancelEdit(domain)}>
                                                        Cancel
                                                    </Button>
                                                {/if}

                                                <Button
                                                    size="sm"
                                                    class="w-36"
                                                    disabled={!isDomainDirty(domain)}
                                                    loading={domain.isLoading}
                                                    onclick={() => saveDomainEdit(domain)}
                                                >
                                                    {isDomainDirty(domain) ? "Save Changes" : "All Changes Saved"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Table.TableCell>
                            </Table.TableRow>
                        {/if}
                    {/each}
                </Table.TableBody>
            </Table.Root>
        </div>
    {/if}
</div>

<div class="registrar bg-card/90 backdrop-blur-md border border-border/70 shadow-sm max-w-8xl sentry-unmask mt-8 mr-auto mb-8 ml-auto w-11/12 rounded-2xl p-6 sm:p-8">
    <h1 class="text-3xl font-semibold tracking-tight">Register a domain</h1>
    <p class="mb-4 text-muted-foreground">You can register a new domain here. <em>Tip: Pick something short, memorable, and easy to type.</em></p>
    <div class="content flex gap-2 items-center">
        <Select.Root bind:value={newDomainType} type="single" name="domain">
            <Select.Trigger class="w-20 shrink-0 font-mono font-medium">{newDomainType}</Select.Trigger>
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
                class="max-w-2xl min-w-0 rounded-r-none font-mono"
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
                    class="w-min max-w-[40ch] shrink-0 rounded-l-none font-mono">
                    {newDomainTld}
                </Select.Trigger>
                <Select.Content>
                    {#each AVAILABLE_TLDS.filter(tld => !(tld.hidden && !ownedTlds.includes(tld.tld.slice(1)))) as tld}
                        <Select.Item value={tld.tld} label={tld.tld}>
                            <div class="flex flex-row items-center font-mono">
                                {tld.tld}
                                {#if tld.purchaseLink && !ownedTlds.includes(tld.tld.slice(1))}
                                    <MaterialSymbolsAttachMoneyRounded class="text-primary" />
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
            class="w-28 font-medium">Register</Button>
    </div>

    <InlineAlert
        variant={"error"}
        title={registerErrorTitle}
        description={registerErrorDescription}
        className="mt-4"
        trigger={alertUpdate} />
    <InlineAlert
        variant={"note"}
        title={registerNoteTitle}
        description={registerNoteDescription}
        className="mt-4"
        trigger={alertUpdate}
        renderDescriptionAsHTML />
</div>

<style>
    @media (orientation: portrait), (max-width: 700px) {
        .domain-holder,
        .registrar {
            margin-top: 1.5rem;
            width: calc(100% - 1rem);
            border-radius: 0.75rem;
            padding: 0.75rem;
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
