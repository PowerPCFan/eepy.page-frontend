<script lang="ts">
    import { Codeblock } from "$lib/components/ui/codeblock";
</script>

<svelte:head>
    <title>FAQ | eepy.page</title>
</svelte:head>

<div class="bg-card max-w-8xl sentry-unmask mt-8 mr-auto ml-auto w-11/12 rounded-2xl p-6">
    <div class="flex w-full flex-col gap-10 p-[clamp(1.25rem,4vw,3.5rem)] max-sm:gap-7 max-sm:p-4">
        <h1 class="text-4xl font-bold leading-tight text-center">Frequently Asked Questions</h1>

        <div class="flex w-full flex-col gap-4">
            <section class="flex w-full flex-col gap-4 rounded-xl border border-border bg-background/30 p-6 max-sm:p-5">
                <h2 class="text-card-foreground text-2xl font-bold leading-tight">Why does my eepy.page domain use HTTPS?</h2>
                <p class="text-muted-foreground text-base leading-7">
                    Unfortunately, Google started forcing HTTPS for all <code>.page</code> domains, including eepy.page.
                    We know this is not ideal, but this is a registry-level requirement, so there's nothing we can do about it.
                    However, if you would like to expose a local HTTP-only service to the internet with eepy.page, it's still possible.
                    We recommend using Caddy, a super simple reverse proxy that automatically handles HTTPS for you.
                </p>
                <section class="flex w-full flex-col gap-4 rounded-xl border border-border bg-background/30 p-6 max-sm:p-5">
                    <h3 class="text-card-foreground text-xl font-bold leading-tight">How do I set up Caddy?</h3>
                    <p class="text-muted-foreground text-base leading-7">
                        Install Caddy using the instructions for your operating system at
                        <a href="https://caddyserver.com/docs/install" target="_blank" rel="noreferrer">caddyserver.com</a>.
                        Then create a <code>Caddyfile</code> &lpar;no extension&rpar; with your eepy.page hostname and the local port where your app runs:
                    </p>
                    <Codeblock class="w-full" text={'your-subdomain.eepy.page {\n    reverse_proxy localhost:3000\n}'} scrollbar="none" />
                    <p class="text-muted-foreground text-base leading-7">
                        Replace <code>your-subdomain.eepy.page</code> with your hostname and <code>3000</code> with your app's local
                        port. Start Caddy from the directory containing the file:
                    </p>
                    <Codeblock class="w-full" text="caddy run" />
                    <p class="text-muted-foreground text-base leading-7">
                        Caddy can obtain and renew certificates automatically when the hostname points to the machine running
                        Caddy and ports 80 and 443 are reachable. For a local-only service behind the eepy.page tunneling
                        feature, follow the tunnel setup steps on the tunneling page as well.
                    </p>
                </section>
            </section>

            <section class="flex w-full flex-col gap-4 rounded-xl border border-border bg-background/30 p-6 max-sm:p-5">
                <h2 class="text-card-foreground text-2xl font-bold leading-tight">eepy.page tunneling</h2>
                <section class="flex w-full flex-col gap-4 rounded-xl border border-border bg-background/30 p-6 max-sm:p-5">
                    <h2 class="text-card-foreground text-xl font-bold leading-tight">How does eepy.page tunneling work?</h2>
                    <p class="text-muted-foreground text-base leading-7">
                        eepy.page tunneling uses Serveo. We provision the DNS records needed for a Serveo tunnel, then you create and
                        configure your SSH key and domain in your Serveo dashboard before running the generated SSH command from eepy.page.
                    </p>
                </section>

                <section class="flex w-full flex-col gap-4 rounded-xl border border-border bg-background/30 p-6 max-sm:p-5">
                    <h2 class="text-card-foreground text-xl font-bold leading-tight">Help, I'm having some issues with my tunnel!</h2>
                    <p class="text-muted-foreground text-base leading-7">
                        Serveo typically works well, but it's also not the best option for eepy.page. The setup process is more complicated than we'd like, and it doesn't always work as smoothly as we hoped for.
                        You may experience subpar uptime, TLS/SSL issues, or interstitial warning pages that require a paid subscription to remove.
                    </p>
                    <p class="text-muted-foreground text-base leading-7">
                        If you were meaningfully impacted by an issue with your tunnel, please reach out to <a href="mailto:support@eepy.page">support@eepy.page</a> for potential compensation,
                        however, we cannot help you if your issue is on Serveo's side or if it's caused by a limitation of their service.
                    </p>
                    <p class="text-muted-foreground text-base leading-7">
                        We don't want to fearmonger though, as tunneling can work flawlessly once you get it set up. Don't let this scare you away from giving it a try!
                    </p>
                    <p class="text-muted-foreground text-base leading-7">
                        We are actively working on finding a better solution that makes tunneling easier, more user-friendly, and more
                        stable. Until then, contact <a href="mailto:support@eepy.page">support@eepy.page</a> if you encounter any issues. We are more than happy to help!
                    </p>
                </section>

                <section class="flex w-full flex-col gap-4 rounded-xl border border-border bg-background/30 p-6 max-sm:p-5">
                    <h2 class="text-card-foreground text-xl font-bold leading-tight">What should I remove when deleting a tunnel?</h2>
                    <p class="text-muted-foreground text-base leading-7">
                        Delete the tunnel from eepy.page first. Then open your Serveo dashboard and remove the SSH key and domain
                        associated with it. This prevents unused Serveo configuration from remaining on your account.
                    </p>
                </section>
            </section>

            <section class="flex w-full flex-col gap-4 rounded-xl border border-border bg-background/30 p-6 max-sm:p-5">
                <h2 class="text-card-foreground text-2xl font-bold leading-tight">Where can I get help?</h2>
                <p class="text-muted-foreground text-base leading-7">
                    If you have any questions not answered by the FAQs above, contact
                    <a href="mailto:support@eepy.page">support@eepy.page</a> and we will get back to you shortly.
                </p>
            </section>
        </div>
    </div>
</div>
