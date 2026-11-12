<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import {
        AccountDisabledError,
        AuthError,
        CaptchaError,
        ConflictError,
        getAuthToken,
        InviteError,
        login,
        MFAError,
        PermissionError,
        RateLimitError,
        register,
        resendEmail,
        setAuthToken,
        UserError,
    } from "$lib";
    import { t } from "$lib/i18n";
    import favicon from "$lib/assets/favicon.svg";
    import { Button } from "$lib/components/ui/button/index";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    import { Input } from "$lib/components/ui/input/index";
    import { Label } from "$lib/components/ui/label/index";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { REGEXP_ONLY_DIGITS } from "bits-ui";
    import consola from "consola";
    import Cookies from "js-cookie";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { turnstile, type TurnstileEventAttributes } from "@svelte-put/cloudflare-turnstile";
    import { activeTheme } from "$lib/store";
    import MaterialSymbolsVisibility from "~icons/material-symbols/visibility";
    import MaterialSymbolsVisibilityOff from "~icons/material-symbols/visibility-off";
    import Zxcvbn from "$lib/components/Zxcvbn.svelte";
    import EmailDomainChecker from "$lib/components/EmailDomainChecker.svelte";

    const TURNSTILE_DISABLED = true;

    let { data } = $props();

    let isLoggingIn: boolean = $state(true);
    let lastRegisterMode: boolean | null = $state(null);
    let username: string = $state("");
    let email: string = $state("");
    let password: string = $state("");
    let repeatPassword: string = $state("");
    let showPassword: boolean = $state(false);
    let showRepeatPassword: boolean = $state(false);
    let agreementsChecked: boolean = $state(false);

    let emailInvalid: boolean = $derived(email.length > 0 && validateEmail(email));
    let usernameInvalid: boolean = $derived(!isLoggingIn && username.length > 0 && validateUsername(username));
    let passwordScore = $state(-1);
    let passwordTooWeak = $state(false);

    let actionButtonDisabled: boolean = $state(false);
    let buttonLoadingState: boolean = $state(false);

    let errorTitle: string = $state("");
    let errorDescription: string = $state("");

    let alertTitle: string = $state("");
    let alertDescription: string = $state("");

    let requiresMfa: boolean = $state(false);
    let mfaInvalid: boolean = $state(false);
    let mfaCode: string = $state("");

    let currentWidgetId: string = "";

    let captchaToken: string = "";
    let captchaDone: boolean = $state(false);

    let turnstileInstance: any = null;

    const handleTurnstile: TurnstileEventAttributes["onturnstile"] = (e) => {
        const { token, turnstile, widgetId } = e.detail;
        captchaToken = token;
        captchaDone = true;
        turnstileInstance = turnstile;
        currentWidgetId = widgetId;
    };

    function resetTurnstile() {
        if (TURNSTILE_DISABLED) return;
        if (turnstileInstance && currentWidgetId) {
            captchaDone = false;
            turnstileInstance.reset(currentWidgetId);
        }
    }

    let accountNeedsEmailVerification: boolean = $state(false);
    let resendEmailClicked: boolean = $state(false);

    function validateUsername(username: string) {
        return !/^[a-zA-Z0-9_-]{3,32}$/.test(username);
    }

    function validateEmail(email: string) {
        return !String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }

    function clearAuthFeedback() {
        errorTitle = "";
        errorDescription = "";
        alertTitle = "";
        alertDescription = "";
        accountNeedsEmailVerification = false;
    }

    function switchAuthMode() {
        clearAuthFeedback();
        requiresMfa = false;
        mfaInvalid = false;
        mfaCode = "";
        buttonLoadingState = false;
        showPassword = false;
        showRepeatPassword = false;
        isLoggingIn = !isLoggingIn;
    }

    function logIn() {
        clearAuthFeedback();
        login(username, password, captchaToken, mfaCode ? mfaCode : undefined)
            .catch((error) => {
                buttonLoadingState = false;
                errorTitle = t("auth.alerts.loginFailed");
                if (error instanceof AuthError || error instanceof UserError)
                    errorDescription = t("auth.alerts.credentialsMismatch");
                else if (error instanceof AccountDisabledError) {
                    errorDescription = error.message;
                } else if (error instanceof PermissionError) {
                    errorDescription = t("auth.alerts.verifyAccountNotice");
                    accountNeedsEmailVerification = true;
                } else if (error instanceof MFAError) {
                    if (!requiresMfa) {
                        errorTitle = "";
                        errorDescription = "";
                        requiresMfa = true;
                        resetTurnstile();
                        return;
                    } else {
                        errorDescription = t("auth.alerts.invalidMfa");
                    }
                } else if (error instanceof CaptchaError) errorDescription = error.message;
                else if (error instanceof RateLimitError) errorDescription = error.message;
                else
                    errorDescription = t("auth.alerts.genericLoginError");
                consola.warn(errorDescription);

                resetTurnstile();
                throw new Error("Login failed");
            })
            .then((session) => {
                // @ts-expect-error: no types implemented for this
                const sessionId: string = session["auth-token"];
                window.gtag?.("event", "log_in");

                setAuthToken(sessionId);
                Cookies.set("logged-in", "yes");
                if (username) {
                    try {
                        localStorage.setItem("navbarAuthState", JSON.stringify({ username }));
                    } catch {}
                }

                if (!getAuthToken()) {
                    console.error("Browser did not accept cookies...");
                }

                setTimeout(() => {
                    // fix localstorage bug, i'm not sure if this is
                    // necessary anymore but it was here before and
                    // i'll just keep it with a shortened 750ms delay
                    // to be safe lol
                    window.location.href = data.redirectURL ?? "/";
                }, 750);
            });
    }

    function signUp() {
        clearAuthFeedback();
        register(username, password, email, captchaToken)
            .catch((error) => {
                buttonLoadingState = false;
                errorTitle = t("auth.alerts.signUpFailed");
                if (error instanceof ConflictError) errorDescription = t("auth.alerts.usernameTaken");
                else if (
                    error instanceof UserError ||
                    error instanceof InviteError ||
                    error instanceof CaptchaError ||
                    error instanceof RateLimitError
                )
                    errorDescription = error.message;
                else
                    errorDescription = t("auth.alerts.genericSignUpError");

                resetTurnstile();
                consola.warn(errorDescription);
                throw new Error("Signup failed");
            })
            .then((_) => {
                buttonLoadingState = false;
                window.gtag?.("event", "sign_up");
                alertTitle = t("auth.alerts.registeredTitle");
                alertDescription = t("auth.alerts.registeredDesc");

                isLoggingIn = true;
                resetTurnstile();
            });
    }

    onMount(() => {
        if (data.referrerCode) {
            Cookies.set("referrer", data.referrerCode, { expires: 14 });
        }

        if (Number(data.statusCode) && Number(data.statusCode) !== 200) {
            consola.warn(`Login error ${data.statusCode}`);
            switch (Number(data.statusCode)) {
                case 460:
                case 465: {
                    alertTitle = t("auth.alerts.loginFailed");
                    alertDescription = t("auth.alerts.signedOut");
                    break;
                }

                case 469: {
                    errorTitle = t("auth.alerts.loginFailed");
                    errorDescription = t("auth.alerts.emailLinked");
                    break;
                }
                default: {
                    errorTitle = t("auth.alerts.unhandledError");
                    errorDescription = t("auth.alerts.genericLoginError");
                    break;
                }
            }

            const url = page.url;
            url.searchParams.delete("c");
            history.pushState({ data }, "", url.href);
        }
    });

    $effect(() => {
        if (!TURNSTILE_DISABLED && !captchaDone) {
            consola.warn("Captcha not done...");
            actionButtonDisabled = true;
            return;
        }

        if (isLoggingIn) {
            if (!username || !password) actionButtonDisabled = true;
            else actionButtonDisabled = false;

            consola.debug(`Checking login...: ${actionButtonDisabled}`);
        } else {
            if (
                repeatPassword !== password ||
                !username ||
                usernameInvalid ||
                !email ||
                emailInvalid ||
                !agreementsChecked ||
                passwordTooWeak ||
                !password
            )
                actionButtonDisabled = true;
            else actionButtonDisabled = false;
        }
    });

    $effect(() => {
        if (!password) showPassword = false;
        if (!repeatPassword) showRepeatPassword = false;
    });

    $effect(() => {
        const registerMode = data.registerMode;

        if (registerMode !== lastRegisterMode) {
            lastRegisterMode = registerMode;
            clearAuthFeedback();
            requiresMfa = false;
            mfaInvalid = false;
            mfaCode = "";
            buttonLoadingState = false;
            showPassword = false;
            showRepeatPassword = false;
            isLoggingIn = !registerMode;
        }
    });

    function randomLogin() {
        return t("auth.titles.login");
    }

    function randomSignup() {
        const signups = [
            t("auth.titles.signup1"),
            t("auth.titles.signup2"),
            t("auth.titles.signup3")
        ];
        return signups[Math.floor(Math.random() * signups.length)];
    }
</script>

<svelte:head>
    <title>Sign In or Register | eepy.page</title>
    <meta
        name="description"
        content="Sign in to your eepy.page account or create a free account to register and manage your domains." />
    <link rel="canonical" href="https://www.eepy.page/login" />
    <meta property="og:title" content="Sign In or Register | eepy.page" />
    <meta
        property="og:description"
        content="Sign in to your eepy.page account or create a free account to register and manage your domains." />
    <meta property="og:url" content="https://www.eepy.page/login" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="Sign In or Register | eepy.page" />
    <meta
        name="twitter:description"
        content="Sign in to your eepy.page account or create a free account to register and manage your domains." />
    <meta name="twitter:url" content="https://www.eepy.page/login" />
</svelte:head>

<div
    class="login-holder bg-card border-border/60 m-auto mt-8 w-[calc(100%-1rem)] max-w-[500px] overflow-hidden rounded-2xl border shadow-xs">
    <Tabs.Root
        value={isLoggingIn ? "signin" : "signup"}
        onValueChange={(val) => {
            if (val === "signin" && !isLoggingIn) switchAuthMode();
            else if (val === "signup" && isLoggingIn) switchAuthMode();
        }}
        class="w-full">
        <Tabs.List
            variant="line"
            class="border-border/60 bg-muted/20 grid h-12 w-full grid-cols-2 rounded-none border-b p-0">
            <Tabs.Trigger
                value="signin"
                class="text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-card data-[state=active]:text-foreground h-full rounded-none border-b-2 border-transparent text-sm font-medium transition-all after:hidden data-[state=active]:font-semibold data-[state=active]:shadow-none">
                {t("auth.tabs.signIn")}
            </Tabs.Trigger>
            <Tabs.Trigger
                value="signup"
                class="text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-card data-[state=active]:text-foreground h-full rounded-none border-b-2 border-transparent text-sm font-medium transition-all after:hidden data-[state=active]:font-semibold data-[state=active]:shadow-none">
                {t("auth.tabs.signUp")}
            </Tabs.Trigger>
        </Tabs.List>
    </Tabs.Root>

    <div class="p-6 pt-6 sm:p-8 sm:pt-6">
        <div class="flex flex-col space-y-4">
            <div class="flex items-center gap-2">
                <img class="w-8" src={favicon} alt="logo" />
                <span class="text-2xl font-bold tracking-tight">eepy.page</span>
            </div>

            <h1 class="text-2xl font-semibold tracking-tight">
                {#if isLoggingIn}
                    {randomLogin()}
                {:else}
                    {randomSignup()}
                {/if}
            </h1>
        </div>

        <InlineAlert title={errorTitle} description={errorDescription} variant={"error"} className="mt-4" />
        <InlineAlert title={alertTitle} description={alertDescription} variant={"note"} className="mt-4" />
        {#if accountNeedsEmailVerification}
            <Button
                variant={"ghost"}
                class="mt-4"
                loading={resendEmailClicked}
                onclick={(_) => {
                    resendEmailClicked = true;
                    resendEmail(username)
                        .catch((error) => {
                            resendEmailClicked = false;
                            errorTitle = t("auth.resend.failedTitle");
                            errorDescription =
                                error instanceof RateLimitError ? error.message : t("auth.resend.failedGeneric");
                            throw new Error("Failed to send resend email");
                        })
                        .then((_) => {
                            resendEmailClicked = false;
                            alertTitle = t("auth.resend.successTitle");
                            alertDescription = t("auth.resend.successDesc");
                        });
                }}>{t("auth.resend.button")}</Button>
        {/if}
        {#if requiresMfa}
            <div class="mfa-screen mt-8 space-y-2">
                <h2 class="text-2xl font-semibold">{t("auth.mfa.title")}</h2>
                <p class="text-muted-foreground text-sm">{t("auth.mfa.description")}</p>
                <form
                    onsubmit={(e) => {
                        e.preventDefault();
                        if ((TURNSTILE_DISABLED || captchaDone) && mfaCode.length === 6) {
                            buttonLoadingState = true;
                            logIn();
                        }
                    }}>
                    <InputOTP.Root
                        bind:value={mfaCode}
                        class="m-auto mt-6 w-fit"
                        maxlength={6}
                        pattern={REGEXP_ONLY_DIGITS}>
                        {#snippet children({ cells })}
                            <InputOTP.Group>
                                {#each cells as cell (cell)}
                                    <InputOTP.Slot class="h-14 font-mono text-2xl" aria-invalid={mfaInvalid} {cell} />
                                {/each}
                            </InputOTP.Group>
                        {/snippet}
                    </InputOTP.Root>

                    <Button
                        loading={buttonLoadingState}
                        disabled={(!TURNSTILE_DISABLED && !captchaDone) || mfaCode.length != 6}
                        type="submit"
                        class="mt-6 w-full">{t("auth.mfa.submit")}</Button>
                </form>

                <div class="pt-2 text-center">
                    <a
                        class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        href="/account/recover/2fa">{t("auth.mfa.backupCodeLink")}</a>
                </div>
            </div>
        {:else}
            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    if (browser && !actionButtonDisabled) {
                        buttonLoadingState = true;
                        isLoggingIn ? logIn() : signUp();
                    }
                }}
                class="mt-4">
                <div class="flex flex-col gap-6">
                    <div class="grid gap-3">
                        <div class="space-y-1.5">
                            <Label for="username">{isLoggingIn ? t("auth.fields.usernameOrEmail") : t("auth.fields.username")}</Label>
                            <Input
                                aria-invalid={usernameInvalid}
                                bind:value={username}
                                id="username"
                                type="text"
                                placeholder={isLoggingIn ? t("auth.fields.usernameOrEmailPlaceholder") : t("auth.fields.usernamePlaceholder")}
                                autocomplete="username"
                                autocapitalize="none"
                                autocorrect="off"
                                required />
                            {#if usernameInvalid}
                                <p class="text-xs text-destructive">{t("auth.fields.usernameInvalid")}</p>
                            {/if}
                        </div>

                        {#if !isLoggingIn}
                            <div class="space-y-1.5">
                                <Label for="email">{t("auth.fields.email")}</Label>
                                <Input
                                    aria-invalid={emailInvalid}
                                    bind:value={email}
                                    id="email"
                                    type="email"
                                    inputmode="email"
                                    autocomplete="email"
                                    autocapitalize="none"
                                    autocorrect="off"
                                    placeholder={t("auth.fields.emailPlaceholder")}
                                    required />
                                <EmailDomainChecker bind:email />
                            </div>
                        {/if}
                        <div class="space-y-1.5">
                            <div class="flex h-4 items-center justify-between">
                                <Label for="password">{t("auth.fields.password")}</Label>
                                {#if isLoggingIn}
                                    <a
                                        tabindex="-1"
                                        transition:fade={{ duration: 100 }}
                                        href="/account/recover/"
                                        class="text-muted-foreground hover:text-foreground text-xs transition-colors">
                                        {t("auth.fields.forgotPassword")}
                                    </a>
                                {/if}
                            </div>
                            <div class="relative">
                                <Input
                                    bind:value={password}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autocomplete={isLoggingIn ? "current-password" : "new-password"}
                                    placeholder="••••••••••••"
                                    class="pr-10"
                                    required />
                                <button
                                    type="button"
                                    // disabled={!password}
                                    onclick={() => (showPassword = !showPassword)}
                                    tabindex="-1"
                                    class="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground absolute top-0 right-0 flex h-full cursor-pointer items-center justify-center px-3 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label={showPassword ? t("auth.fields.hidePassword") : t("auth.fields.showPassword")}
                                    title={showPassword ? t("auth.fields.hidePassword") : t("auth.fields.showPassword")}>
                                    {#if showPassword}
                                        <MaterialSymbolsVisibilityOff class="size-4" />
                                    {:else}
                                        <MaterialSymbolsVisibility class="size-4" />
                                    {/if}
                                </button>
                            </div>
                            {#if !isLoggingIn}
                                <Zxcvbn {password} bind:score={passwordScore} bind:tooWeak={passwordTooWeak} />
                            {/if}
                        </div>
                        {#if !isLoggingIn}
                            <div class="space-y-1.5">
                                <Label for="repeat-password">{t("auth.fields.confirmPassword")}</Label>
                                <div class="relative">
                                    <Input
                                        aria-invalid={!!repeatPassword && repeatPassword !== password}
                                        bind:value={repeatPassword}
                                        id="repeat-password"
                                        type={showRepeatPassword ? "text" : "password"}
                                        autocomplete="new-password"
                                        placeholder="••••••••••••"
                                        class="pr-10"
                                        required />
                                    <button
                                        type="button"
                                        // disabled={!repeatPassword}
                                        onclick={() => (showRepeatPassword = !showRepeatPassword)}
                                        tabindex="-1"
                                        class="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground absolute top-0 right-0 flex h-full cursor-pointer items-center justify-center px-3 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label={showRepeatPassword ? t("auth.fields.hidePassword") : t("auth.fields.showPassword")}
                                        title={showRepeatPassword ? t("auth.fields.hidePassword") : t("auth.fields.showPassword")}>
                                        {#if showRepeatPassword}
                                            <MaterialSymbolsVisibilityOff class="size-4" />
                                        {:else}
                                            <MaterialSymbolsVisibility class="size-4" />
                                        {/if}
                                    </button>
                                </div>
                            </div>

                            <div class="agreement flex items-center pt-1">
                                <Checkbox bind:checked={agreementsChecked} class="mr-2" id="agreements" />
                                <Label
                                    class="text-muted-foreground cursor-pointer gap-1 text-xs font-normal"
                                    for="agreements"
                                >
                                    <p>
                                        {t("auth.fields.agreement.agreeTo")} <a href="/terms" class="text-foreground font-bold hover:underline">{t("auth.fields.agreement.terms")}</a>
                                        {t("auth.fields.agreement.and")} <a href="/privacy" class="text-foreground font-bold hover:underline">{t("auth.fields.agreement.privacy")}</a>
                                    </p>
                                </Label>
                            </div>
                        {/if}
                    </div>
                </div>

                <Button
                    loading={buttonLoadingState}
                    disabled={!browser || actionButtonDisabled}
                    type="submit"
                    class="mt-6 w-full">{isLoggingIn ? t("auth.buttons.signIn") : t("auth.buttons.signUp")}</Button>
            </form>
        {/if}

        {#if !TURNSTILE_DISABLED}
            <div class="mt-8 mx-auto w-min">
                <div
                    use:turnstile
                    turnstile-sitekey="0x4AAAAAADviUbGPh--ynweX"
                    turnstile-theme={$activeTheme}
                    turnstile-size="normal"
                    turnstile-language="en"
                    turnstile-response-field-name="turnstile"
                    turnstile-response-field
                    onturnstile={handleTurnstile}
                    onturnstileerror={(e) => consola.error("Turnstile error:", e.detail)}
                ></div>
            </div>
        {/if}
    </div>
</div>
