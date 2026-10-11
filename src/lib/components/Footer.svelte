<script lang="ts">
    import Separator from "./ui/separator/separator.svelte";
</script>

<!-- todo: use an app.css color instead of indigo-950 -->
<footer class="footer bg-indigo-950/50 sentry-unmask border-t border-border/40 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-sm">
    <div class="footer-col">
        <h3 class="text-base font-semibold text-foreground mb-2">Contact</h3>
        <Separator class="mb-3 opacity-60" />
        <p class="text-muted-foreground">Support: <a class="text-foreground hover:text-primary transition-colors" href="mailto:support@eepy.page">support@eepy.page</a></p>
        <p class="text-muted-foreground">Report sites or vulnerabilities &lpar;read <a class="text-foreground hover:text-primary transition-colors underline underline-offset-4" href="https://github.com/PowerPCFan/eepy.page-frontend/blob/master/SECURITY.md">this</a> before reporting&rpar;&colon; <a class="text-foreground hover:text-primary transition-colors" href="mailto:report@eepy.page">report@eepy.page</a></p>
    </div>
    <div class="footer-col">
        <h3 class="text-base font-semibold text-foreground mb-2">Legal</h3>
        <Separator class="mb-3 opacity-60" />
        <p><a class="text-muted-foreground hover:text-foreground transition-colors" href="/privacy">Privacy Policy</a></p>
        <p><a class="text-muted-foreground hover:text-foreground transition-colors" href="/terms">Terms of Service</a></p>
        <p><a class="text-muted-foreground hover:text-foreground transition-colors" href="/faq">FAQ</a></p>
    </div>
</footer>

<style>
    .footer {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        max-width: 100%;
        width: 100%;
        text-align: center;
        overflow-wrap: anywhere;
        gap: 2rem;
    }
    .footer-col {
        padding-inline: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
    }

    @media (max-width: 640px), (orientation: portrait) {
        .footer {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
        }
    }
</style>
