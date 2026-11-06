<script lang="ts">
    import { IconBadge } from "$lib/components/ui/icon-badge";
    import { t } from "$lib/i18n";
    import MaterialSymbolsMailRounded from "~icons/material-symbols/mail-rounded";
</script>

<svelte:head>
    <title>Thanks for your order | eepy.page</title>
</svelte:head>

<main class="flex min-h-[70vh] items-center justify-center px-6 py-20">
    <section class="w-full max-w-xl text-center">
        <IconBadge variant="primary" size="2xl" shape="circle" class="mx-auto mb-6">
            <MaterialSymbolsMailRounded class="size-8" />
        </IconBadge>
        <h1 class="text-4xl font-semibold">{t("common.kofiThanks.title")}</h1>
        <p class="text-muted-foreground mt-4 text-lg">
            {t("common.kofiThanks.lead")}
        </p>
        <p class="text-muted-foreground mt-3">
            {@html t("common.kofiThanks.instructions", { emailLink: '<a href="mailto:support@eepy.page">support@eepy.page</a>' })}
        </p>
    </section>
</main>
