<script lang="ts">
    import { browser } from "$app/environment";
    import consola from "consola";
    // import MaterialSymbolsLock from "~icons/material-symbols/lock";
    import MaterialSymbolsInfo from "~icons/material-symbols/info";
    import { getStatus } from "../../serverContactor";

    let height: number = $state(0);
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
                consola.info("Recieved message on server");
                hidden = false;
                danger = true;
                // @ts-ignore
                message = status["message"];
            }
        });
    loaded = true;

    let hidden: boolean = $state(false);

    function calcIsHidden(): boolean {
        if (!browser) {
            return false;
        }
        hidden =
            ((localStorage.getItem("notification-hidden") ?? false) as boolean) &&
            localStorage.getItem("notification-hidden-message") === message;
        return hidden;
    }

    calcIsHidden();
</script>

{#if loaded && danger && !hidden}
    <div bind:clientHeight={height} class="bar">
        <!-- <MaterialSymbolsLock /> -->
        <MaterialSymbolsInfo />
        <p>{message}</p>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_missing_attribute -->
        <a onclick={() => {
            localStorage.setItem("notification-hidden", "true");
            localStorage.setItem("notification-hidden-message", message);
            hidden = true;
        }}>&times;</a>
    </div>
{/if}

<style>
    .bar {
        display: flex;
        align-items: center;
        background-color: var(--primary);
        gap: 0.5rem;
        min-width: 0;
        width: 100%;
        padding: 0.5rem 0.75rem;
        top: 0px;
        left: 0px;
    }
    .bar * {
        color: white;
    }
    a {
        flex: none;
        cursor: pointer;
        margin-left: auto;
        margin-right: 0;
        font-size: 1em;
    }

    p {
        min-width: 0;
        overflow-wrap: anywhere;
    }
</style>
