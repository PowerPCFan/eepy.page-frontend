<script lang="ts">
    import Separator from "./ui/separator/separator.svelte";
</script>

<div class="footer bg-footer sentry-unmask space-y-3 pt-8">
    <div>
        <h3 class="text-lg font-medium">Contact</h3>
        <Separator />
        <p>Support: <a href="mailto:support@eepy.page">support@eepy.page</a></p>
        <p>Report sites or vulnerabilities &lpar;read <a href="https://github.com/PowerPCFan/eepy.page-frontend/blob/master/SECURITY.md">this</a> before reporting&rpar;&colon; <a href="mailto:report@eepy.page">report@eepy.page</a></p>
    </div>
    <div>
        <h3 class="text-lg font-medium">Legal</h3>
        <Separator />
        <p><a href="/privacy">Privacy Policy</a></p>
        <p><a href="/terms">Terms of Service</a></p>
        <p><a href="/faq">FAQ</a></p>
    </div>
</div>

<style>
    .footer {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(auto, 1fr);
        max-width: 100%;
        width: 100%;
        padding-bottom: 2em;
        text-align: center;
        overflow-wrap: anywhere;

        gap: 2vw;
    }
    .footer div {
        padding-inline: 1rem;
    }
    a {
        color: var(--color-foreground);
        text-decoration: underline;
    }

    @media (orientation: portrait) {
        .footer {
            display: flex;
            flex-direction: column;
        }
    }
</style>
