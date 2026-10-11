<svelte:options runes={true} />

<script lang="ts">
    import { page } from "$app/state";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import MaterialSymbolsWarning from "~icons/material-symbols/warning-outline-rounded";

    const reason: string = page.url.searchParams.get("reason") ?? "";
    let warningText: string = $state("");

    switch (reason) {
        case "permission":
        case "feature":
            warningText = "Looks like you don't have the necessary permissions to access this feature.";
            break;
        case "suspended":
            warningText = "Your account does not have permission to perform this action.";
            break;
        default:
            warningText = "Looks like you don't have access to this resource or action.";
            break;
    }
</script>

<svelte:head>
    <title>Notice | eepy.page</title>
</svelte:head>

<Holder>
    <div class="flex flex-col items-center py-6 text-center space-y-4">
        <IconBadge variant="destructive" size="lg" shape="circle">
            <MaterialSymbolsWarning class="size-6" />
        </IconBadge>
        <h1 class="text-2xl font-bold tracking-tight">Access Restricted</h1>
        <p class="text-muted-foreground max-w-md text-sm">{warningText}</p>
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button href="/dashboard">Return to Dashboard</Button>
            <Button variant="ghost" href="/">Home</Button>
        </div>
    </div>
</Holder>
