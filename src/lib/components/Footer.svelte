<script lang="ts">
    import { t } from "$lib/i18n";
    import Separator from "./ui/separator/separator.svelte";
</script>

<footer class="sentry-unmask border-t border-border/50 bg-card/40 text-sm backdrop-blur-xs">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            <div class="flex flex-col space-y-3">
                <a href="/" class="flex items-center gap-2 text-foreground! text-base font-bold tracking-snug hover:opacity-90 transition-opacity w-fit">
                    <img src="/favicon.svg" alt="eepy.page" class="size-6 rounded" />
                    <span>eepy.page</span>
                </a>
                <p class="text-xs text-muted-foreground leading-relaxed max-w-xs">
                    A modern, completely free subdomain service for your projects.
                </p>
                <div class="pt-1">
                    <a
                        href="https://github.com/PowerPCFan/eepy.page"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                        <span>GitHub Repository</span>
                        <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </div>

            <div class="flex flex-col space-y-2.5">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground/75">
                    Product
                </h3>
                <ul class="space-y-2 text-xs">
                    <li>
                        <a href="/dashboard">
                            {t("common.nav.dashboard")}
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard/tunneling">
                            {t("common.nav.tunneling")}
                        </a>
                    </li>
                    <li>
                        <a href="/infra">
                            {t("common.footer.officialDomains")}
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://docs.eepy.page/"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                            <span>{t("common.nav.docs")}</span>
                            <span class="text-[10px] opacity-70">&#8599;</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="flex flex-col space-y-2.5">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground/75">
                    {t("common.footer.contact")}
                </h3>
                <ul class="space-y-2 text-xs">
                    <li>
                        <a href="/support">
                            {t("common.nav.support")} Center
                        </a>
                    </li>
                    <li>
                        <a href="/report">
                            {t("common.nav.report")} Abuse
                        </a>
                    </li>
                </ul>
            </div>

            <div class="flex flex-col space-y-2.5">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground/75">
                    {t("common.footer.legal")}
                </h3>
                <ul class="space-y-2 text-xs">
                    <li>
                        <a href="/privacy">
                            {t("common.footer.privacy")}
                        </a>
                    </li>
                    <li>
                        <a href="/terms">
                            {t("common.footer.terms")}
                        </a>
                    </li>
                    <li>
                        <a href="/faq">
                            {t("common.footer.faq")}
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <Separator class="my-5 opacity-40" />

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            &copy; 2026 PowerPCFan
        </div>
    </div>
</footer>
