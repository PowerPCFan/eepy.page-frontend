<svelte:options runes={true} />

<script lang="ts">
    import { page } from "$app/state";
    import Holder from "$lib/components/Holder.svelte";

    const reason: string = page.url.searchParams.get("reason") ?? "";
    let warningText: string = $state("");

    switch (reason) {
        case "permission":
        case "feature":
            warningText = "Looks like you don't have the necessary permissions to do this.";
            break;
    }
</script>

<Holder>
    <h1 class="text-2xl font-semibold">Uh-oh!</h1>
    <p>{warningText}</p>
</Holder>
