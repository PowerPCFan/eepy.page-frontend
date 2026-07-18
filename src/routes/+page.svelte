<script lang="ts">
    import { goto } from "$app/navigation";
    import { domainAvailable } from "$lib";
    import GitHub from "$lib/assets/github.svg";
    import Gift from "$lib/assets/gift.svg";
    import Globe from "$lib/assets/click-globe.svg";
    import Dashboard from "$lib/assets/dash.svg";
    import Services from "$lib/assets/services.svg";
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
    <title>Home | eepy.page</title>
</svelte:head>

<svelte:window bind:scrollY={scrollY} />

<div class="content pb-44">
    <div class="introduction mr-auto ml-auto flex min-h-screen w-full max-w-screen items-center p-10 lg:w-11/12">
        <div class="description w-3/5">
            <h1 class="w-fit text-9xl font-bold">
                <img alt="" aria-hidden="true" src="/favicon.svg" />
                <span>eepy.page</span>
            </h1>
        </div>
        <div class="right-side mr-8 h-fit w-2/5 items-center">
            <p class="about-us text-3xl leading-10 font-semibold">
                A modern, free subdomain service for everyone—whether you're a developer, hobbyist, or somewhere in between.
            </p>

            <div class="details mt-12 mb-12 flex w-full justify-between gap-3 text-3xl [&>div]:items-center">
                <div class="item flex">
                    <MaterialSymbolsCheckCircleRounded class="h-8 text-purple-600" />
                    <Label class="text-lg">100% free</Label>
                </div>
                <div class="item flex">
                    <MaterialSymbolsCheckCircleRounded class="h-8 text-purple-600" />
                    <Label class="text-lg">Modern UI</Label>
                </div>
                <div class="item flex">
                    <MaterialSymbolsCheckCircleRounded class="h-8 text-purple-600" />
                    <Label class="text-lg">User-friendly dashboard</Label>
                </div>
            </div>
            <div class="actions mt-auto mb-0 flex justify-between gap-2">
                <Button onclick={_ => goto("/login?register=true")} class="w-[49%]">Sign up now</Button>
                <Button variant={"secondary"} onclick={_ => goto("/dashboard")} class="w-[49%]"
                    >Go to the dashboard</Button>
            </div>
        </div>
    </div>

    <div class="selling-points mt-8 px-32">
        <div class="flex">
            <div class="visual w-2/5">
                <img class="w-3/5" alt="Icon depicting a user's mouse clicking on a globe, symbolizing a website" src={Globe} />
            </div>
            <div class="text bg-primary/10 w-3/5 rounded-2xl border-2 p-4 dark:bg-black/30">
                <h1 class="mb-2 text-5xl font-semibold">Claim a piece of the internet</h1>
                <p class="text-lg">Let's start from the basics. <b>Try out a domain you'd like to own!</b></p>

                <div class="domain-tester flex items-center pt-2 pb-2">
                    <div class="domain-input relative">
                        <Input
                            onkeyup={_ => getDomainAvailability()}
                            onfocus={_ => (placeholderInputFocused = true)}
                            onfocusout={_ => (placeholderInputFocused = false)}
                            bind:value={testDomain}
                            type="text"
                            class="w-[12rem] max-w-full h-[1.75rem] rounded-sm" />
                        {#if !testDomain && !placeholderInputFocused}
                            {#key testPlaceholder}
                                <span
                                    transition:fade={{ duration: 500 }}
                                    class="pointer-events-none absolute top-1/2 left-4 w-48 max-w-[calc(100%-1rem)] -translate-y-1/2 opacity-90">
                                    {testPlaceholder}
                                </span>
                            {/key}
                        {/if}
                    </div>
                    <span class="domain-suffix text-lg ml-[0.1rem]">.eepy.page</span>
                </div>

                {#if checkingDomainAvailability}
                    <Loader className="w-8" asForeground={true} />
                {:else if testDomain && latestCheckedDomain === testDomain}
                    <div class="domain-results">
                        {#if isTestAvailable}
                            <h1 class="mt-4 text-2xl font-semibold">
                                The domain {testDomain}.eepy.page is <span class="text-purple-400">available!</span>
                            </h1>
                            <Button class="mt-2 w-full" onclick={_ => goto("/login?register=true")}>Sign up now</Button>
                        {:else}
                            <h1>
                                Unfortunately, the domain {testDomain}.eepy.page <b>has already been registered</b>, or
                                is invalid.
                            </h1>
                            <p class="text-lg">Try something else!</p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="selling-points mt-32 px-32">
        <div class="flex">
            <div class="text w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Always free</h2>
                <p class="mt-4 text-xl">
                    eepy.page will always be completely free for anyone to use.<br><br>
                    Our goal is to provide a reliable, convenient service to anyone,
                    which means that regardless of whether you own a domain or not,
                    you are more than welcome to use our service!
                </p>
            </div>
            <div class="visual flex w-2/5 items-center justify-end">
                <img class="w-3/5" alt="Icon representing two people exchanging something" src={Gift} />
            </div>
        </div>
    </div>

    <div class="selling-points mt-32 px-32">
        <div class="flex">
            <div class="visual flex w-2/5 items-center justify-start">
                <img class="w-3/5" alt="Icon representing multiple services, in a tree-like format" src={Services} />
            </div>
            <div class="text w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Support for many services</h2>
                <p class="mt-4 text-xl">
                    Since you have full control over DNS records, most services that simply require a domain are supported!
                </p>
                <p class="mt-4 text-xl">eepy.page supports:</p>
                <ul class="mt-4 list-disc space-y-3 pl-6 text-xl">
                    <li><strong>Vercel</strong> projects &lpar;via some extra steps&rpar;</li>
                    <li><strong>Netlify</strong> projects</li>
                    <li><strong>GitHub Pages</strong> sites</li>
                    <li><strong>Neocities</strong> sites &lpar;requires <em class="mr-0.5">Supporter</em> tier&rpar;</li>
                    <li><strong>Nekoweb</strong> sites &lpar;requires <em class="mr-0.5">Cute kitty</em> tier&rpar;</li>
                    <li>
                        ...and more! Most services that only require a <strong>standard DNS record</strong> are supported, and even services that require TXT records work as long as they are scoped to your subdomain.
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="selling-points mt-32 px-32">
        <div class="flex">
            <div class="text w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Independent domain management</h2>
                <p class="mt-4 text-xl">
                    You can register, delete, and modify domains straight from our dashboard, designed to be convenient and user-friendly.<br><br>
                    There is no need to use a convoluted CLI or a request form, and you don't have to wait for any domain verification.<br><br>
                    Subdomain registrations are seamlessly added to our database and DNS servers the second you register them.
                </p>
            </div>
            <div class="visual flex w-2/5 items-center justify-end">
                <img class="w-3/5" alt="Icon representing a configurable dashboard" src={Dashboard} />
            </div>
        </div>
    </div>

    <div class="selling-points mt-32 px-32">
        <div class="flex">
            <div class="visual flex w-2/5 items-center justify-start">
                <img class="w-3/5" alt="GitHub's logo" src={GitHub} />
            </div>
            <div class="text w-3/5">
                <h2 class="w-fit text-5xl font-semibold">Completely open-source</h2>
                <p class="mt-4 text-xl">
                    Our frontend and backend are both completely open-source and open to contributions. Our backend is
                    written in Python, and our frontend is written in SvelteKit.<br><br>
                    Our authoritative nameservers are powered by PowerDNS, which is also open-source.
                </p>

                <Separator class="mt-4 mb-4" />
                <p>Check out our repositories on GitHub:</p>
                <Button href="https://github.com/PowerPCFan/eepy.page-frontend" variant={"ghost"}
                    >Our frontend (PowerPCFan/eepy.page-frontend)</Button>
                <br>
                <Button href="https://github.com/PowerPCFan/eepy.page-backend" variant={"ghost"}
                    >Our backend (PowerPCFan/eepy.page-backend)</Button>
            </div>
        </div>
    </div>
</div>

<Footer />

{#if scrollY < 50}
    <div transition:fade={{ duration: 175 }}>
        <MaterialSymbolsKeyboardArrowDownRounded class="absolute top-11/12 left-1/2 text-3xl" />
    </div>
{/if}

<style>
    .content {
        background-color: var(--color-background);
        background:
            radial-gradient(circle at -25% -25%, var(--gradient-start) 0%, var(--gradient-end) 85%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .introduction {
        align-items: center;
        gap: clamp(2rem, 5vw, 5rem);
        justify-content: center;
    }

    .description {
        display: flex;
        flex: 1 1 0;
        justify-content: center;
        min-width: 0;
    }

    .description h1 {
        align-items: center;
        display: flex;
        font-size: clamp(4.5rem, 7.4vw, 7.25rem);
        gap: 0.14em;
        line-height: 0.95;
        white-space: nowrap;
    }

    .description h1 img {
        flex: none;
        height: 0.84em;
        transform: translateY(0.05em);
        width: auto;
    }

    .right-side {
        flex: 1 1 0;
        max-width: 34rem;
        min-width: 0;
    }

    @media (max-width: 1420px) and (min-width: 1025px) {
        .description h1 {
            font-size: clamp(4rem, 6.4vw, 5.75rem);
        }
    }

    @media (max-width: 1024px) {
        .introduction {
            align-items: center;
            flex-direction: column;
            gap: clamp(1.5rem, 3vw, 2.25rem);
            justify-content: flex-start;
            min-height: auto;
            padding-bottom: 0;
            padding-left: 0;
            padding-right: 0;
            padding-top: clamp(3.5rem, 7vh, 5rem);
            width: min(88%, 44rem);
        }

        .description {
            display: flex;
            justify-content: center;
            margin-left: 0px;
            width: 100%;
        }

        .description h1 {
            margin-left: auto;
            margin-right: auto;
            font-size: clamp(4.4rem, 10vw, 6.5rem);
        }

        .right-side {
            margin-left: auto;
            margin-right: auto;
            max-width: 44rem;
            width: 100%;
        }

        .about-us {
            font-size: clamp(1.6rem, 3.2vw, 2.35rem);
            line-height: 1.12;
            margin-right: auto;
            margin-left: auto;
            max-width: 38rem;
            text-align: center;
            width: 100%;
        }

        .details {
            align-items: stretch;
            flex-direction: column;
            gap: 0.75rem;
            margin-left: 0;
            margin-top: clamp(1.25rem, 3vw, 2rem);
            margin-bottom: clamp(1.25rem, 3vw, 2rem);
            width: 100%;
        }

        .details .item {
            justify-content: center;
        }

        .actions {
            flex-direction: column;
        }

        .actions :global(button) {
            width: 100%;
        }
    }

    @media (max-width: 900px), (orientation: portrait) {
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
        .introduction {
            min-height: auto;
            padding-top: 5rem;
        }
        .description h1 {
            font-size: clamp(3.15rem, 15vw, 5.4rem);
        }
        .about-us {
            font-size: 1.5em;
            line-height: normal;
        }

        .details {
            align-items: stretch;
            flex-direction: column;
            margin-top: 2rem;
            margin-bottom: 2rem;
            margin-left: 0;
            width: 100%;
        }

        .actions {
            flex-direction: column;
        }

        .actions :global(button) {
            width: 100%;
        }

        .domain-tester {
            align-items: stretch;
            flex-direction: column;
            gap: 0.5rem;
        }

        .domain-input,
        .domain-input :global(input) {
            width: 100%;
        }

        .domain-suffix {
            margin-left: 0;
        }

        .selling-points {
            margin-top: 5rem;
        }

        .selling-points > div {
            flex-direction: column;
        }

        .text {
            width: calc(100% - 2rem);
        }

        .text h1,
        .text h2 {
            font-size: 2rem;
            line-height: 1.12;
        }
    }
</style>
