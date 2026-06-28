<script lang="ts">
    import { goto } from "$app/navigation";
    import { domainAvailable } from "$lib";
    import Github from "$lib/assets/github.svg";
    import Footer from "$lib/components/Footer.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Loader from "$lib/components/ui/loader/loader.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import { fade } from "svelte/transition";
    import MaterialSymbolsCheckCircleRounded from "~icons/material-symbols/check-circle-rounded";
    import MaterialSymbolsKeyboardArrowDownRounded from "~icons/material-symbols/keyboard-arrow-down-rounded";

    let placeholderMessages = ["project", "username", "cool-website", "important", "personal", "blog"];

    let testDomain: string = $state("");
    let placeholderInputFocused: boolean = $state(false);
    let testPlaceholder: string = $state(placeholderMessages[0]!);
    let placeholderIndex = 1;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isTestAvailable: boolean = $state(false);
    let checkingDomainAvailability: boolean = $state(false);
    let latestCheckedDomain = $state("");

    let scrollY: number = $state(0);

    setInterval(() => {
        if (placeholderIndex > placeholderMessages.length - 1) {
            placeholderIndex = 0;
        }
        testPlaceholder = placeholderMessages[placeholderIndex]!;

        placeholderIndex++;
    }, 1500);

    function getDomainAvailability() {
        if (latestCheckedDomain === testDomain || !testDomain) return;
        checkingDomainAvailability = true;

        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(async () => {
            isTestAvailable = await domainAvailable(testDomain + ".eepy.page");
            checkingDomainAvailability = false;
            latestCheckedDomain = testDomain;
        }, 600);
    }
</script>

<svelte:head>
    <title>eepy.page - Register subdomains for free!</title>
</svelte:head>

<svelte:window bind:scrollY={scrollY} />

<div class="content pb-44">
    <div
        class="introduction mr-auto ml-auto flex min-h-screen w-screen max-w-screen items-center p-10 lg:w-11/12">
        <div class="description w-3/5">
            <h1 class="ml-8 w-fit text-9xl font-bold">eepy.page</h1>
        </div>
        <div class="right-side mr-8 h-fit w-2/5 items-center">
            <p class="about-us text-3xl leading-10 font-semibold">
                A modern, free subdomain service for developers, project managers, and regular people.
            </p>

            <div
                class="details mt-12 mb-12 flex w-full justify-between text-3xl [&>div]:items-center">
                <div class="item flex">
                    <MaterialSymbolsCheckCircleRounded class=" h-8 text-blue-600" />
                    <Label class="text-lg">100% free</Label>
                </div>
                <div class="item flex">
                    <MaterialSymbolsCheckCircleRounded class="h-8 text-blue-600" />
                    <Label class="text-lg">Modern UI</Label>
                </div>
                <div class="item flex">
                    <MaterialSymbolsCheckCircleRounded class="h-8 text-blue-600" />
                    <Label class="text-lg">Independent control</Label>
                </div>
            </div>
            <div class="actions mt-auto mb-0 flex justify-between">
                <Button onclick={_ => goto("/login?register=true")} class="w-[49%]"
                    >Sign up now</Button>
                <Button
                    variant={"secondary"}
                    onclick={_ => goto("/dashboard")}
                    class="w-[49%]">Go to the dashboard</Button>
            </div>
        </div>
    </div>

    <div class="selling-points mt-16">
        <div class="services flex">
            <div class="visual ml-32 w-2/5"></div>
            <div class="text bg-primary/10 mr-32 w-3/5 rounded-2xl border-2 p-4 dark:bg-black/30">
                <h1 class="mb-2 text-5xl font-semibold">Claim yourself a piece of the internet</h1>
                <p class="text-lg">Let's start from the basics. <b>Try out a domain you'd like to own!</b></p>

                <div class="flex items-center pt-2 pb-2">
                    <div class="absolute">
                        <Input
                            onkeyup={_ => getDomainAvailability()}
                            onfocus={_ => (placeholderInputFocused = true)}
                            onfocusout={_ => (placeholderInputFocused = false)}
                            bind:value={testDomain}
                            type="text"
                            class="w-[12rem]" />
                    </div>
                    {#if !testDomain && !placeholderInputFocused}
                        {#key testPlaceholder}
                            <span
                                transition:fade={{ duration: 500 }}
                                class="pointer-events-none absolute ml-4 w-48 opacity-90">
                                {testPlaceholder}
                            </span>
                        {/key}
                    {/if}
                    <span class="ml-[12.3rem] text-lg">.eepy.page</span>
                </div>

                {#if checkingDomainAvailability}
                    <Loader className="w-8" asForeground={true} />
                {:else if testDomain && latestCheckedDomain === testDomain}
                    <div class="domain-results">
                        {#if isTestAvailable}
                            <h1 class="mt-4 text-2xl font-semibold">
                                The domain {testDomain}.eepy.page is <span class="text-blue-400">available!</span>
                            </h1>
                            <Button
                                class="mt-2 w-full"
                                onclick={_ => goto("/login?register=true")}
                                >Sign up now</Button>
                        {:else}
                            <h1>
                                Unfortunately, the domain {testDomain}.eepy.page <b>has already been registered</b>, or is invalid.
                            </h1>
                            <p class="text-lg">Try something else!</p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="selling-points mt-64">
        <div class="free flex">
            <div class="text ml-32 w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Always free</h2>
                <p class="mt-4 text-xl">eepy.page will always be completely free for anyone to use. Our main goal is to provide free domains to users who are unable to buy their own domains. However, even if you do own a domain, you're welcome to use our service!</p>
            </div>
            <div class="visual w-2/5"></div>
        </div>
    </div>

    <div class="selling-points mt-64">
        <div class="services flex">
            <div class="visual ml-32 w-2/5"></div>
            <div class="text mr-32 w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Support for many services</h2>
                <p class="mt-4 text-xl">Since you have full control over DNS records, most services that simply require a domain are supported! Unfortunately, certain services such as Cloudflare DNS require you to register your own domain.</p>
            </div>
        </div>
    </div>

    <div class="selling-points mt-64">
        <div class="management flex">
            <div class="text ml-32 w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Independent domain management</h2>
                <p class="mt-4 text-xl">
                    You can register, delete, and modify domains straight from our dashboard. There is no need to use a convoluted CLI or a request form, and you don't have to wait for any domain verification as domain registrations are done immediately.
                </p>
            </div>
            <div class="visual mr-32 w-2/5"></div>
        </div>
    </div>

    <div class="selling-points mt-64">
        <div class="support flex">
            <div class="visual ml-32 w-2/5">
                <img class="w-3/5" alt="github logo" src={Github} />
            </div>
            <div class="text mr-32 w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Completely open-source</h2>
                <p class="mt-4 text-xl">Our frontend and backend are both completely open-source and open to contributions. Our backend is written in Python, and our frontend is written in SvelteKit.</p>

                <Separator class="mt-4 mb-4" />
                <p>See more:</p>
                <Button href="https://github.com/PowerPCFan/eepy.page-frontend" variant={"ghost"}
                    >Our frontend repo (PowerPCFan/eepy.page-frontend)</Button>
                <Button href="https://github.com/PowerPCFan/eepy.page-backend" variant={"ghost"}
                    >Our backend repo (PowerPCFan/eepy.page-backend)</Button>
            </div>
        </div>
    </div>
</div>

<Footer />

{#if scrollY < 50}
    <div transition:fade={{ duration: 100 }}>
        <MaterialSymbolsKeyboardArrowDownRounded class="absolute top-11/12 left-1/2 text-xl" />
    </div>
{/if}

<style>
    .content {
        background-color: var(--color-background);
        background:
            radial-gradient(circle at -25% -25%, var(--gradient-start) 0%, var(--gradient-end) 85%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 362 362' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='10' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    @media (max-width: 1250px) {
        .description {
            width: 40%;
            margin-left: 0px;
        }
        .description h1 {
            margin-left: 0px;
        }
        .right-side {
            width: 50%;
            margin-left: auto;
            margin-right: 24px;
        }
    }

    @media (max-width: 900px), (orientation: portrait) {
        .right-side {
            margin-right: 0px;
        }
        .about-us {
            margin-top: 2rem;
            width: 100%;
            max-width: 38rem;
            text-align: center;
            margin-right: auto;
            margin-left: auto;
        }
        .introduction {
            padding: 0px;
            margin-left: auto;
            margin-right: auto;
            width: 90%;
            padding-top: 30vh;
            flex-direction: column;
        }
        .introduction div {
            width: 100%;
        }
        .description h1 {
            margin-left: auto;
            margin-right: auto;
        }

        .visual {
            display: none;
        }

        .text {
            width: 90%;
            margin-left: auto;
            margin-right: auto;
        }

        h2 {
            font-size: 2.75em;
        }
    }

    @media (max-width: 600px) {
        .description h1 {
            font-size: 6em;
        }
        .about-us {
            font-size: 1.5em;
            line-height: normal;
        }

        .details {
            margin-left: 12px;
            width: fit-content;
            flex-direction: column;
        }
    }
</style>
