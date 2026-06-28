<script lang="ts">
    import Separator from "./ui/separator/separator.svelte";
</script>

<div class="footer bg-footer space-y-3 pt-8 sentry-unmask">
    <div class="contact">
        <h3 class="text-lg font-medium">Contact</h3>
        <Separator />
        Support: <a href="mailto:support@eepy.page">support@eepy.page</a>
        Report sites or vulnerabilities &lpar;<a href="https://github.com/PowerPCFan/eepy.page-frontend/blob/master/SECURITY.md">read this before reporting</a>&rpar;&colon; <a href="mailto:report@eepy.page">report@eepy.page</a>
    </div>
</div>

<style>
    .footer {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(auto, 1fr);
        max-width: 100vw;
        width: 100%;
        padding-bottom: 2em;
        text-align: center;
    }
    .footer * {
        display: flex;
        flex-direction: column;
    }
    a {
        color: var(--color-foreground);
        text-decoration: underline;
        width: fit-content;
        margin-right: auto;
        margin-left: auto;
    }

    @media (orientation: portrait) {
        .footer {
            display: flex;
            flex-direction: column;
        }
    }
</style>
