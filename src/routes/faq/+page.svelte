<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import { Codeblock } from "$lib/components/ui/codeblock";
</script>

<svelte:head>
    <title>FAQ | eepy.page</title>
</svelte:head>

<div class="bg-card max-w-8xl sentry-unmask mt-8 mr-auto ml-auto w-11/12 rounded-2xl p-6 sm:p-8 border border-border/60">
    <div class="flex w-full flex-col gap-8 p-[clamp(1.25rem,4vw,3.5rem)] max-sm:p-2">
        <h1 class="text-3xl text-center sm:text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>

        <Accordion.Root type="multiple" class="w-full space-y-3">
            <Accordion.Item value="https" class="rounded-xl border border-border bg-background/40 px-6 py-2">
                <Accordion.Trigger class="text-lg font-semibold text-foreground hover:no-underline text-left">
                    Why does my eepy.page domain use HTTPS?
                </Accordion.Trigger>
                <Accordion.Content class="text-muted-foreground text-base leading-7 space-y-4 pt-2">
                    <p>
                        Unfortunately, Google started forcing HTTPS for all <code>.page</code> domains, including eepy.page.
                        We know this is not ideal, but this is a registry-level requirement, so there's nothing we can do about it.
                        However, if you would like to expose a local HTTP-only service to the internet with eepy.page, it's still possible.
                        We recommend using Caddy, a super simple reverse proxy that automatically handles HTTPS for you.
                    </p>

                    <Accordion.Root type="multiple" size="sm" class="mt-4 w-full">
                        <Accordion.Item value="caddy" class="rounded-lg border border-border/70 bg-background/60 px-4 py-1">
                            <Accordion.Trigger class="text-sm font-medium text-foreground hover:no-underline text-left">
                                How do I set up Caddy?
                            </Accordion.Trigger>
                            <Accordion.Content class="text-muted-foreground text-sm leading-6 space-y-3 pt-1">
                                <p>
                                    Install Caddy using the instructions for your operating system at
                                    <a href="https://caddyserver.com/docs/install" target="_blank" rel="noreferrer" class="text-primary underline">caddyserver.com</a>.
                                    Then create a <code>Caddyfile</code> &lpar;no extension&rpar; with your eepy.page hostname and the local port where your app runs:
                                </p>
                                <Codeblock class="w-full" text={'your-subdomain.eepy.page {\n    reverse_proxy localhost:3000\n}'} scrollbar="none" />
                                <p>
                                    Replace <code>your-subdomain.eepy.page</code> with your hostname and <code>3000</code> with your app's local port. Start Caddy from the directory containing the file:
                                </p>
                                <Codeblock class="w-full" text="caddy run" />
                                <p class="text-xs text-muted-foreground">
                                    Caddy can obtain and renew certificates automatically when the hostname points to the machine running Caddy and ports 80 and 443 are reachable. For a local-only service behind the eepy.page tunneling feature, follow the tunnel setup steps on the tunneling page as well.
                                </p>
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="tunneling" class="rounded-xl border border-border bg-background/40 px-6 py-2">
                <Accordion.Trigger class="text-lg font-semibold text-foreground hover:no-underline text-left">
                    eepy.page tunneling
                </Accordion.Trigger>
                <Accordion.Content class="text-muted-foreground text-base leading-7 pt-2">
                    <Accordion.Root type="multiple" size="sm" class="w-full space-y-2.5">
                        <Accordion.Item value="tunneling-how" class="rounded-lg border border-border/70 bg-background/60 px-4 py-1">
                            <Accordion.Trigger class="text-sm font-medium text-foreground hover:no-underline text-left">
                                How does eepy.page tunneling work?
                            </Accordion.Trigger>
                            <Accordion.Content class="text-muted-foreground text-sm leading-6 pt-1">
                                <p>
                                    eepy.page tunneling uses Serveo. We provision the DNS records needed for a Serveo tunnel, then you create and
                                    configure your SSH key and domain in your Serveo dashboard before running the generated SSH command from eepy.page.
                                </p>
                            </Accordion.Content>
                        </Accordion.Item>

                        <Accordion.Item value="tunneling-issues" class="rounded-lg border border-border/70 bg-background/60 px-4 py-1">
                            <Accordion.Trigger class="text-sm font-medium text-foreground hover:no-underline text-left">
                                Help, I'm having some issues with my tunnel!
                            </Accordion.Trigger>
                            <Accordion.Content class="text-muted-foreground text-sm leading-6 space-y-3 pt-1">
                                <p>
                                    Serveo typically works well, but it's also not the best option for eepy.page. The setup process is more complicated than we'd like, and it doesn't always work as smoothly as we hoped for.
                                    You may experience subpar uptime, TLS/SSL issues, or interstitial warning pages that require a paid subscription to remove.
                                </p>
                                <p>
                                    If you were meaningfully impacted by an issue with your tunnel, please reach out to <a href="mailto:support@eepy.page" class="text-primary underline">support@eepy.page</a> for potential compensation, however, we cannot help you if your issue is on Serveo's side or if it's caused by a limitation of their service.
                                </p>
                                <p>
                                    We don't want to fearmonger though, as tunneling can work flawlessly once you get it set up. Don't let this scare you away from giving it a try!
                                </p>
                                <p>
                                    We are actively working on finding a better solution that makes tunneling easier, more user-friendly, and more stable. Until then, contact <a href="mailto:support@eepy.page" class="text-primary underline">support@eepy.page</a> if you encounter any issues. We are more than happy to help!
                                </p>
                            </Accordion.Content>
                        </Accordion.Item>

                        <Accordion.Item value="tunneling-delete" class="rounded-lg border border-border/70 bg-background/60 px-4 py-1">
                            <Accordion.Trigger class="text-sm font-medium text-foreground hover:no-underline text-left">
                                What should I remove when deleting a tunnel?
                            </Accordion.Trigger>
                            <Accordion.Content class="text-muted-foreground text-sm leading-6 pt-1">
                                <p>
                                    Delete the tunnel from eepy.page first. Then open your Serveo dashboard and remove the SSH key and domain
                                    associated with it. This prevents unused Serveo configuration from remaining on your account.
                                </p>
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="help" class="rounded-xl border border-border bg-background/40 px-6 py-2">
                <Accordion.Trigger class="text-lg font-semibold text-foreground hover:no-underline text-left">
                    Where can I get help?
                </Accordion.Trigger>
                <Accordion.Content class="text-muted-foreground text-base leading-7 pt-2">
                    <p>
                        If you have any questions not answered by the FAQs above, visit our <a href="/support">Support Center</a> for assistance.
                    </p>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    </div>
</div>
