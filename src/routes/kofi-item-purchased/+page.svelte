<script lang="ts">
    import MaterialSymbolsMailRounded from "~icons/material-symbols/mail-rounded";
</script>

<svelte:head>
    <title>Thanks for your order | eepy.page</title>
</svelte:head>

<main class="flex min-h-[70vh] items-center justify-center px-6 py-20">
    <section class="w-full max-w-xl text-center">
        <MaterialSymbolsMailRounded class="text-primary mx-auto mb-6 size-16" />
        <h1 class="text-4xl font-semibold">Thanks for your order</h1>
        <p class="text-muted-foreground mt-4 text-lg">
            Check the email address you used at checkout. Your redeem link should arrive there shortly!
        </p>
        <p class="text-muted-foreground mt-3">
            Before opening the link, please make sure you are signed into eepy.page and that you are using the correct account.
            If you encounter any issues, don't hesitate to reach us at <a href="mailto:support@eepy.page">support@eepy.page</a>.
        </p>
    </section>
</main>
