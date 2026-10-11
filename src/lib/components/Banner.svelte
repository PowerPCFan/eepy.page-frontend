<script lang="ts">
    import { browser } from "$app/environment";
    import consola from "consola";
    import MaterialSymbolsInfo from "~icons/material-symbols/info";
    import MaterialSymbolsClose from "~icons/material-symbols/close";
    import { getStatus } from "../../serverContactor";
    import { cyrb53 } from "../../helperFuncs";
    import { slide } from "svelte/transition";

    let loaded: boolean = $state(false);
    let danger: boolean = $state(false);
    let message: string = $state("");

    getStatus()
        .catch(err => {
            consola.error(err);
            danger = true;
            message = "We are experiencing server difficulties.";
            return;
        })
        .then(status => {
            //@ts-ignore
            if (status && status["message"]) {
                hidden = false;
                danger = true;
                // @ts-ignore
                message = status["message"];
            }

            hidden = calcIsHidden();
            loaded = true;
        });

    let hidden: boolean = $state(false);

    function setHidden() {
        localStorage.setItem("notification-hidden", "true");
        localStorage.setItem("notification-hidden-message", cyrb53(message).toString());
        hidden = true;
    }

    function calcIsHidden(): boolean {
        if (!browser) return false;
        return (
            (localStorage.getItem("notification-hidden") ?? "false").toLowerCase() === "true"
            && localStorage.getItem("notification-hidden-message") === cyrb53(message).toString()
        );
    }
</script>

{#if loaded && danger && !hidden}
    <div
        transition:slide={{ duration: 180 }}
        class="banner flex items-center justify-between gap-3 bg-primary text-primary-foreground px-4 py-1.5 w-full">
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <MaterialSymbolsInfo class="size-5 shrink-0" />
            <p class="text-xs sm:text-sm font-medium leading-normal break-words">{message}</p>
        </div>

        <button
            type="button"
            aria-label="Dismiss banner"
            onclick={setHidden}
            class="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-black/10 active:scale-95 transition-transform cursor-pointer">
            <MaterialSymbolsClose class="size-4" />
        </button>
    </div>
{/if}
