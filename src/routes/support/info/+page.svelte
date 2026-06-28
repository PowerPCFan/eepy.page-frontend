<script lang="ts">
    import { browser } from "$app/environment";
    import { getAuthToken, ServerContactor, serverURL } from "$lib";
    import Holder from "$lib/components/Holder.svelte";
    import { Button } from "$lib/components/ui/button";
    import copy from "clipboard-copy";

    // @ts-expect-error | defined in vite.config.ts
    const commit = __BUILD_COMMIT__;

    let deviceWidth: number = $state(0);
    let deviceHeight: number = $state(0);
    let useragent: string = $state("unknown");
    let userId: string = $state("unknown");

    let code: HTMLElement;

    if (browser) {
        deviceHeight = window.innerHeight;
        deviceWidth = window.innerWidth;
        useragent = navigator.userAgent;

        const serverContactor = new ServerContactor(
            getAuthToken() ?? null,
            localStorage.getItem("server_url")
        );

        serverContactor.getAccountSettings().catch(error => { throw new Error("User not logged in") }).then(data => { userId = data.username });
    }
</script>

<Holder>
    <h1 class="text-2xl font-semibold">Technical information:</h1>
    <code class="font-mono" bind:this={code}>
        commit: {commit}<br>
        server: {serverURL}<br>
        width: {deviceWidth}<br>
        height: {deviceHeight}<br>
        user agent: {useragent}<br>
        username: {userId}<br>
    </code>
    <Button onclick={_ => copy(code.innerText)}>Copy to clipboard</Button>
</Holder>
