<script lang="ts">
    import { browser } from "$app/environment";
    import consola from "consola";
    import MaterialSymbolsInfo from "~icons/material-symbols/info";
    import MaterialSymbolsClose from "~icons/material-symbols/close";
    import { getStatus } from "../../serverContactor";

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
        });
    loaded = true;

    let hidden: boolean = $state(false);

    function setHidden() {
        localStorage.setItem("notification-hidden", "true");
        localStorage.setItem("notification-hidden-message", message);
        hidden = true;
    }

    function calcIsHidden(): boolean {
        if (!browser) return false;
        return (
            ((localStorage.getItem("notification-hidden") ?? false) as boolean)
            && localStorage.getItem("notification-hidden-message") === message
        );
    }

    calcIsHidden();
</script>

{#if loaded && danger && !hidden}
    <div class="flex items-center bg-primary gap-2 min-w-0 w-full py-2 px-3 top-0 left-0 h-min [&_*]:text-foreground">
        <MaterialSymbolsInfo class="h-6 w-6 flex-none" />
        <p class="text-sm sm:text-base min-w-0 wrap-anywhere">{message}</p>

        <button
            onclick={setHidden}
            class="flex-none cursor-pointer ml-auto mr-0 text-4xl h-min w-min my-0 py-0"
        >
            <MaterialSymbolsClose class="h-6 w-6" />
        </button>
    </div>
{/if}
