<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import {
        AuthError,
        CaptchaError,
        ConflictError,
        getAuthToken,
        login,
        MFAError,
        PermissionError,
        RateLimitError,
        register,
        resendEmail,
        setAuthToken,
        UserError,
    } from "$lib";
    import favicon from "$lib/assets/favicon.svg";
    import { Button } from "$lib/components/ui/button/index";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import InlineAlert from "$lib/components/ui/inline-alert/inline-alert.svelte";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    import { Input } from "$lib/components/ui/input/index";
    import { Label } from "$lib/components/ui/label/index";
    import { REGEXP_ONLY_DIGITS } from "bits-ui";
    import consola from "consola";
    import Cookies from "js-cookie";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { turnstile, type TurnstileEventAttributes } from '@svelte-put/cloudflare-turnstile';
    import { activeTheme } from "$lib/store";
    import MaterialSymbolsVisibility from "~icons/material-symbols/visibility";
    import MaterialSymbolsVisibilityOff from "~icons/material-symbols/visibility-off";

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

    let emailInvalid: boolean = $derived(validateEmail(email));
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

    const handleTurnstile: TurnstileEventAttributes['onturnstile'] = (e) => {
        const { token, turnstile, widgetId } = e.detail;
        captchaToken = token;
        captchaDone = true;
        turnstileInstance = turnstile;
        currentWidgetId = widgetId;
    };

    function resetTurnstile() {
        if (turnstileInstance && currentWidgetId) {
            captchaDone = false;
            turnstileInstance.reset(currentWidgetId);
        }
    }

    let accountNeedsEmailVerification: boolean = $state(false);
    let resendEmailClicked: boolean = $state(false);

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
            .catch(error => {
                buttonLoadingState = false;
                errorTitle = "Login failed";
                if (error instanceof AuthError || error instanceof UserError)
                    errorDescription = "Username and password do not match.";
                else if (error instanceof PermissionError) {
                    errorDescription = "Please verify your account. You should have received an email with a verification link.";
                    accountNeedsEmailVerification = true;
                } else if (error instanceof MFAError) {
                    if (!requiresMfa) {
                        errorTitle = "";
                        errorDescription = "";
                        requiresMfa = true;
                        resetTurnstile();
                        return;
                    } else {
                        errorDescription = "Invalid two-factor authentication code.";
                    }
                } else if (error instanceof CaptchaError)
                    errorDescription = error.message;
                else if (error instanceof RateLimitError)
                    errorDescription = error.message;
                else
                    errorDescription =
                        "There was an error while logging in. If this continues, please contact support.";
                consola.warn(errorDescription);

                resetTurnstile();
                throw new Error("Login failed");
            })
            .then(session => {
                // @ts-expect-error: no types implemented for this
                const sessionId: string = session["auth-token"];
                window.gtag?.("event", "log_in");

                setAuthToken(sessionId);
                Cookies.set("logged-in", "yes");
                localStorage.setItem("logged-in", "y");

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
            .catch(error => {
                buttonLoadingState = false;
                errorTitle = "Sign up failed";
                if (error instanceof ConflictError) errorDescription = "Username is taken";
                if (error instanceof UserError) errorDescription = error.message;
                if (error instanceof CaptchaError) errorDescription = error.message;
                if (error instanceof RateLimitError) errorDescription = error.message;

                resetTurnstile();
                consola.warn(errorDescription);
                throw new Error("Signup failed");
            })
            .then(_ => {
                buttonLoadingState = false;
                window.gtag?.("event", "sign_up");
                alertTitle = "Successfully registered!";
                alertDescription = "Check your email and verify your account before signing in.";

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
                    alertTitle = "Login failed";
                    alertDescription = "Looks like you were signed out";
                    break;
                }

                case 469: {
                    errorTitle = "Login failed";
                    errorDescription =
                        "This email has already been linked to an existing account! Please connect your account in settings.";
                    break;
                }
                default: {
                    errorTitle = "An unhandled error occurred.";
                    errorDescription =
                        "There was an error while logging in. If this continues, please contact support.";
                    break;
                }
            }

            const url = page.url;
            url.searchParams.delete("c");
            history.pushState({ data }, "", url.href);
        }
    });

    $effect(() => {
        if (!captchaDone) {
            consola.warn("Captcha not done...");
            actionButtonDisabled = true;
            return;
        }

        if (isLoggingIn) {
            if (!username || !password) actionButtonDisabled = true;
            else actionButtonDisabled = false;

            consola.debug(`Checking login...: ${actionButtonDisabled}`);
        } else {
            if (repeatPassword !== password || !username || !email || emailInvalid || !agreementsChecked)
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
</script>

<div class="login-holder bg-card m-auto mt-8 w-[calc(100%-1rem)] max-w-[500px] rounded-2xl border border-border/60 p-6 sm:p-8 shadow-xs">
    <div class="flex flex-col">
        <img class="w-8" src={favicon} alt="logo" />
        <h1 class="text-3xl font-bold mt-2 tracking-tight">
            {#if isLoggingIn}
                Log in to your eepy.page account
            {:else}
                Sign up for an eepy.page account
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
            onclick={_ => {
                resendEmailClicked = true;
                resendEmail(username)
                    .catch(error => {
                        resendEmailClicked = false;
                        errorTitle = "Failed to send verification";
                        errorDescription = error instanceof RateLimitError
                            ? error.message
                            : "Please try again later.";
                        throw new Error("Failed to send resend email");
                    })
                    .then(_ => {
                        resendEmailClicked = false;
                        alertTitle = "Please verify your account";
                        alertDescription = "An email has been sent to your inbox. Please check your spam folder.";
                    });
            }}>Resend email verification</Button>
    {/if}
    {#if requiresMfa}
        <div class="mfa-screen mt-8 space-y-2">
            <h2 class="text-2xl font-semibold">Two-factor authentication</h2>
            <p class="text-sm text-muted-foreground">Enter the verification code from your authenticator app.</p>
            <form onsubmit={(e) => { e.preventDefault(); if (captchaDone && mfaCode.length === 6) { buttonLoadingState = true; logIn(); } }}>
                <InputOTP.Root
                    bind:value={mfaCode}
                    class="m-auto mt-6 w-fit"
                    maxlength={6}
                    pattern={REGEXP_ONLY_DIGITS}>
                    {#snippet children({ cells })}
                        <InputOTP.Group>
                            {#each cells as cell (cell)}
                                <InputOTP.Slot class="h-14 text-2xl font-mono" aria-invalid={mfaInvalid} cell={cell} />
                            {/each}
                        </InputOTP.Group>
                    {/snippet}
                </InputOTP.Root>

                <Button
                    loading={buttonLoadingState}
                    disabled={!captchaDone || mfaCode.length != 6}
                    type="submit"
                    class="mt-6 w-full">Sign in</Button>
            </form>

            <div class="pt-2 text-center">
                <a class="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/account/recover/2fa">Disable two-factor authentication with a backup code</a>
            </div>
        </div>
    {:else}
        <form onsubmit={(e) => { e.preventDefault(); if (browser && !actionButtonDisabled) { buttonLoadingState = true; isLoggingIn ? logIn() : signUp(); } }} class="mt-6">
            <div class="flex flex-col gap-6">
                <div class="grid gap-3">
                    <div class="space-y-1.5">
                        <Label for="username">Username</Label>
                        <Input
                            bind:value={username}
                            id="username"
                            type="text"
                            placeholder="username"
                            autocomplete="username"
                            autocapitalize="none"
                            autocorrect="off"
                            required />
                    </div>

                    {#if !isLoggingIn}
                        <div class="space-y-1.5">
                            <Label for="email">Email</Label>
                            <Input
                                aria-invalid={emailInvalid}
                                bind:value={email}
                                id="email"
                                type="email"
                                inputmode="email"
                                autocomplete="email"
                                autocapitalize="none"
                                autocorrect="off"
                                placeholder="user@gmail.com"
                                required />
                        </div>
                    {/if}
                    <div class="space-y-1.5">
                        <div class="flex h-4 items-center justify-between">
                            <Label for="password">Password</Label>
                            {#if isLoggingIn}
                                <a
                                    tabindex="-1"
                                    transition:fade={{ duration: 100 }}
                                    href="/account/recover/"
                                    class="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Forgot your password?
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
                                disabled={!password}
                                onclick={() => (showPassword = !showPassword)}
                                tabindex="-1"
                                class="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center focus:outline-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                title={showPassword ? "Hide password" : "Show password"}>
                                {#if showPassword}
                                    <MaterialSymbolsVisibilityOff class="size-4" />
                                {:else}
                                    <MaterialSymbolsVisibility class="size-4" />
                                {/if}
                            </button>
                        </div>
                    </div>
                    {#if !isLoggingIn}
                        <div class="space-y-1.5">
                            <Label for="repeat-password">Confirm password</Label>
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
                                    disabled={!repeatPassword}
                                    onclick={() => (showRepeatPassword = !showRepeatPassword)}
                                    tabindex="-1"
                                    class="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center focus:outline-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
                                    aria-label={showRepeatPassword ? "Hide password" : "Show password"}
                                    title={showRepeatPassword ? "Hide password" : "Show password"}>
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
                            <Label class="gap-1 text-xs cursor-pointer font-normal text-muted-foreground" for="agreements">
                                I agree to the <a href="/terms" class="text-foreground hover:underline font-medium">Terms of Service</a> and <a href="/privacy" class="text-foreground hover:underline font-medium">Privacy Policy</a>
                            </Label>
                        </div>
                    {/if}
                </div>
            </div>

            <Button
                loading={buttonLoadingState}
                disabled={!browser || actionButtonDisabled}
                type="submit"
                class="mt-6 w-full">{isLoggingIn ? "Sign in" : "Sign up"}</Button>
        </form>

        <div class="mt-4 text-center">
            <Button variant="ghost" onclick={switchAuthMode} class="w-full">
                {isLoggingIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
        </div>
    {/if}

    <div
        use:turnstile
        turnstile-sitekey="0x4AAAAAADviUbGPh--ynweX"
        turnstile-theme={$activeTheme}
        turnstile-size="normal"
        turnstile-language="en"
        turnstile-response-field-name="turnstile"
        turnstile-response-field
        onturnstile={handleTurnstile}
        class="mx-auto mt-6 w-fit"
    ></div>
</div>

