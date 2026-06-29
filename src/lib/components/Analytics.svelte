<script lang="ts">
    import { page } from "$app/state";
    import { browser } from "$app/environment";

    $effect(() => {
        if (!browser || !window.gtag) return;

        window.gtag("config", "G-69P19PMX2R", {
            page_title: document.title,
            page_path: page.url.pathname
        });
    });
</script>

<svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-69P19PMX2R"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag("js", new Date());
        gtag("config", "G-69P19PMX2R");
        window.gtag = gtag;
    </script>
</svelte:head>
