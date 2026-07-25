<script lang="ts">
    import Holder from "$lib/components/Holder.svelte";
</script>

<svelte:head>
    <title>Privacy Policy | eepy.page</title>
</svelte:head>

<Holder>
    <h1>Privacy Policy</h1>
    <p>Last updated: July 25, 2026</p>

    <p>
        This Privacy Policy explains how eepy.page collects, uses, stores, and shares information when you use
        eepy.page, the eepy.page API, canary or development deployments, and other official eepy.page services that link
        to this Policy.
    </p>

    <p>
        eepy.page is operated as an independent project by
        <a href="https://github.com/PowerPCFan" rel="external noopener noreferrer" target="_blank"> PowerPCFan </a>. For
        privacy questions, contact
        <a href="mailto:support@eepy.page">support@eepy.page</a>. For abuse or vulnerability reports, contact
        <a href="mailto:report@eepy.page">report@eepy.page</a>.
    </p>

    <h2>Information We Collect</h2>
    <p>We collect information you provide directly, including:</p>
    <ul>
        <li>Account username, email address, password, and browser language.</li>
        <li>Login, signup, password recovery, email verification, and account deletion codes.</li>
        <li>Domain names, DNS record types, DNS record values, registration timestamps, and TLD access.</li>
        <li>
            Tunnel configuration data, including the selected eepy.page hostname, subdomain, local port, SSH public-key
            fingerprint, Serveo authorization record, generated SSH command, and tunnel timestamps.
        </li>
        <li>API key comments, API key permissions, and domain scopes.</li>
        <li>Two-factor authentication setup data, including TOTP secrets and backup recovery codes.</li>
        <li>Invite codes, referral codes, referral relationships, and reward code redemptions.</li>
        <li>Messages or report details you send to support or abuse reporting addresses.</li>
    </ul>

    <p>We also collect information automatically when you use the service, including:</p>
    <ul>
        <li>IP address, user-agent, login timestamps, session creation and expiration timestamps.</li>
        <li>
            IP-derived location and network information from ipinfo, such as country, region, city, approximate
            coordinates, ISP or organization, timezone, postal code, and EU status.
        </li>
        <li>Application logs, security events, error reports, performance traces, and diagnostic data.</li>
        <li>Pageview and usage analytics through Google Analytics and Vercel Speed Insights.</li>
        <li>
            Sentry error, replay, logging, and tracing data. Sentry may receive request and browser details, error
            context, and other diagnostic information needed to debug the service.
        </li>
    </ul>

    <h2>How We Use Information</h2>
    <p>We use information to:</p>
    <ul>
        <li>Create, verify, authenticate, secure, and manage accounts.</li>
        <li>
            Provide subdomain registration, DNS record management, API access, invites, referrals, rewards, and optional
            TLD benefits.
        </li>
        <li>
            Provision, display, update, and remove tunnel DNS records and generate the SSH command needed to use the
            optional Serveo-based tunneling feature.
        </li>
        <li>
            Send account emails, including verification, password recovery, deletion, purchase, abuse, ban, domain
            removal, and administrative-action notices.
        </li>
        <li>
            Detect abuse, enforce the Terms of Service, investigate reports, prevent fraud, and protect eepy.page
            infrastructure.
        </li>
        <li>
            Debug errors, measure reliability, understand aggregate usage, improve features, and maintain the service.
        </li>
        <li>Comply with legal obligations and respond to valid legal, security, or abuse requests.</li>
    </ul>

    <h2>Cookies and Local Storage</h2>
    <p>eepy.page uses cookies and browser storage for login, security, and basic site behavior.</p>

    <p>
        The cookie banner lets you accept all optional categories, decline optional categories, or manage individual
        settings. eepy.page uses opt-in consent by default and may use opt-out consent in regions where the site can
        identify that this is appropriate. Declining optional categories keeps only necessary cookies and storage,
        including browser-only settings used for basic site behavior.
    </p>

    <ul>
        <li>
            <strong>Necessary:</strong> login/session cookies, authentication state, security checks, the consent choice
            itself, browser-only settings such as theme and donation prompt state, and similar required site behavior.
            These are required for the service and cannot be disabled.
        </li>
        <li>
            <strong>Analytics:</strong> Google Analytics and Vercel Speed Insights for pageview, usage, and frontend performance
            measurement.
        </li>
        <li>
            <strong>Necessary error monitoring:</strong> Sentry frontend error monitoring, logs, tracing, and replay sampling
            used to debug problems and keep the service reliable.
        </li>
    </ul>

    <p>
        You can reopen the cookie settings from the "Cookie settings" button at the bottom of the page. Some browser
        storage may also be cleared manually in your browser.
    </p>

    <h2>Third-Party Services</h2>
    <p>eepy.page uses third-party providers to operate the service:</p>
    <ul>
        <li><strong>MongoDB</strong> for database storage.</li>
        <li><strong>Vercel</strong> for frontend hosting and speed insights.</li>
        <li><strong>Sentry</strong> for error monitoring and debug logs.</li>
        <li><strong>Google Analytics</strong> for website analytics.</li>
        <li><strong>Cloudflare Turnstile</strong> for bot and abuse prevention during login and signup.</li>
        <li><strong>ipinfo</strong> for IP-based location and network metadata used during signup and abuse review.</li>
        <li><strong>Resend</strong> for transactional email delivery.</li>
        <li>
            <strong>Ko-fi</strong> for optional donations and digital purchases. Ko-fi sends eepy.page purchase webhook data
            such as purchase type, purchased item data, and email address so we can issue reward codes.
        </li>
        <li>
            <strong>Discord</strong> for internal signup notifications containing minimal information for debugging.
        </li>
        <li>
            <strong>DNS infrastructure providers</strong>, including PowerDNS-compatible APIs, to publish and manage DNS
            records.
        </li>
        <li>
            <strong>Serveo</strong> as the third-party provider used for optional SSH reverse tunneling. You create and
            manage the Serveo account, SSH key, and domain directly with Serveo. eepy.page does not receive or store
            your Serveo password or private SSH key, but Serveo may process information under its own policies when you
            use its dashboard or tunnel service. Serveo's Terms of Service can be found
            <a href="https://serveo.net/terms" target="_blank" rel="noopener noreferrer">here</a>.
        </li>
    </ul>

    <p>
        These providers process information under their own terms and privacy policies. eepy.page is not responsible for
        websites, services, or payment platforms that are not controlled by eepy.page.
    </p>

    <h2>How We Store and Protect Information</h2>
    <p>
        Email addresses, display names, API key strings, TOTP secrets, backup codes, and verification or recovery code
        account links are encrypted before storage where supported by the backend. Passwords are stored as Argon2
        hashes. API keys and some lookup values are stored or indexed using hashes. Session tokens are JWTs and active
        sessions are tracked in the database with expiration timestamps.
    </p>

    <p>
        No method of transmission or storage is perfectly secure. We use technical and operational safeguards intended
        to protect the service, but we cannot guarantee absolute security.
    </p>

    <p>
        Tunnel SSH fingerprints and authorization TXT records are intended to be public verification data. Do not submit
        private SSH keys, passwords, access tokens, or other confidential credentials to eepy.page. Protect private keys
        and Serveo account credentials on your own devices and in your Serveo account.
    </p>

    <h2>How Long We Keep Information</h2>
    <p>
        Account data is kept while your account exists. Session records and login tokens expire automatically.
        Verification, recovery, and deletion codes are short-lived. If an account is banned or marked for deletion after
        abuse action, related records may be retained for up to one year before automatic deletion.
    </p>

    <p>
        Some logs, analytics, backups, provider records, email delivery records, DNS records, and security records may
        remain for longer where needed for operations, security, abuse prevention, legal compliance, or provider
        retention schedules.
    </p>

    <p>
        Tunnel configuration data is retained while the tunnel or account remains active and may be removed when you
        delete the tunnel or account, subject to backups, logs, legal obligations, abuse investigations, and provider
        retention schedules. Deleting a tunnel from eepy.page does not delete your separate Serveo account, SSH key,
        domain, or Serveo-side records; you must remove those from Serveo directly.
    </p>

    <h2>Sharing and Disclosure</h2>
    <p>We do not sell your personal information. We may share information:</p>
    <ul>
        <li>
            With the third-party providers listed above so they can provide hosting, analytics, email, payment, DNS,
            abuse-prevention, and monitoring services.
        </li>
        <li>
            With administrators or trusted maintainers who need access to operate, secure, debug, or enforce the
            service.
        </li>
        <li>When needed to investigate abuse, security incidents, fraud, or Terms of Service violations.</li>
        <li>When required by law, legal process, or a valid request from an appropriate authority.</li>
        <li>
            If eepy.page is transferred, reorganized, or replaced by another operator, subject to this Policy or a
            successor policy.
        </li>
    </ul>

    <h2>Public DNS Records and User Subdomains</h2>
    <p>
        DNS records you create are public by design. Domain names, DNS record types, and DNS record values may be
        visible to anyone querying DNS, using public DNS datasets, or visiting services connected to your subdomain. Do
        not put private or sensitive information in DNS records.
    </p>

    <h2>Your Choices and Rights</h2>
    <p>
        You can review account details in the account page and request an export of selected account data through the
        GDPR/account data feature. You can delete your account through the account deletion flow, which sends a
        confirmation email before deletion.
    </p>

    <p>
        Depending on where you live, you may have rights to access, correct, export, delete, or object to certain uses
        of your personal information. To make a privacy request, contact
        <a href="mailto:support@eepy.page">support@eepy.page</a>. We may need to verify your identity before acting on a
        request.
    </p>

    <h2>Children</h2>
    <p>
        eepy.page is not intended for children under 13. If you believe a child has provided personal information to
        eepy.page, contact
        <a href="mailto:support@eepy.page">support@eepy.page</a>.
    </p>

    <h2>International Use</h2>
    <p>
        eepy.page and its providers may process information in the United States and other countries. By using the
        service, you understand that information may be transferred to and processed in countries other than where you
        live.
    </p>

    <h2>Do Not Track</h2>
    <p>
        Some browsers send Do Not Track signals. eepy.page does not currently respond to those signals because there is
        no common technical standard for them.
    </p>

    <h2>Changes to This Policy</h2>
    <p>
        We may update this Policy when the service, providers, legal requirements, or data practices change. The updated
        version will show a new "Last updated" date. If a change is major, we will try to provide reasonable notice
        through the website, email, or another appropriate method.
    </p>

    <h2>Contact</h2>
    <p>
        Privacy and support requests:
        <a href="mailto:support@eepy.page">support@eepy.page</a>
    </p>
    <p>
        Abuse and vulnerability reports:
        <a href="mailto:report@eepy.page">report@eepy.page</a>
    </p>
</Holder>

<style>
    h1 {
        font-size: 1.5rem;
        font-weight: 600;
    }

    h2 {
        margin-top: 1.25rem;
        margin-bottom: 0.25rem;
        font-size: 1.25rem;
        font-weight: 600;
    }

    ul {
        list-style: disc;
        margin-left: 2rem;
        margin-bottom: 1rem;
    }

    ul li {
        margin-top: 0.5rem;
    }

    p {
        margin-bottom: 0.5rem;
    }
</style>
