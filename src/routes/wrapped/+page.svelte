<script lang="ts">
    import { browser } from "$app/environment";
    import { formatUTCDateTime, getAuthToken, ServerContactor } from "$lib";
    import Holder from "$lib/components/Holder.svelte";
    import * as Card from "$lib/components/ui/card";
    import Loader from "$lib/components/ui/loader/loader.svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let serverContactor: ServerContactor | undefined;
    let data: Awaited<ReturnType<ServerContactor["getWrapped"]>> | undefined = $state();

    let averageBpm = $state(80);
    let heartBeatsPerDay = $derived(averageBpm * 60 * 24);

    function makeDummyDataObject() {
        return {
            account_created: 1780000000,
            total_users: 10507,
            accounts_made_after: 3600,
            domains_registered: 0,
            unique_ips: 3,
        };
    }

    function addCommasToNumber(num: number): string {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function ordinal(i: number): string {
        let j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) {
            return i + "st";
        }
        if (j === 2 && k !== 12) {
            return i + "nd";
        }
        if (j === 3 && k !== 13) {
            return i + "rd";
        }
        return i + "th";
    }

    function adaptiveFormat(n: number) {
        const length = Math.floor(Math.abs(n)).toString().length;

        if (length <= 1) {
            return parseFloat(n.toFixed(2));
        } else {
            return Math.round(n);
        }
    }

    function randomChoiceFromArray<T>(arr: T[]): T | null {
        return arr[Math.floor(Math.random() * arr.length)] ?? null;
    }

    function randomRegisteredDomainsText(domainsRegistered: number): string {
        const zero = [
            "That's fine, we don't judge!",
            "You don't need domains to be awesome!",
            "Might be time to grab a domain or two!",
        ];
        const one = [
            "Who needs multiple domains?",
            "One is better than none!",
            "Quality over quantity!",
        ];
        const two = [
            "Two is better than one!",
            "Look at that, not one but two amazing projects!",
            "Double the domains, double the fun!",
        ];
        const three = [
            "Way to go, three domains!",
            "Third time's a charm!",
        ];
        const four = [
            "Four domains? Impressive!",
            "You're really making the most out of your account!",
        ];
        const fiveAndUp = [
            "Wow, that's a lot. Save some for the rest of us!",
            "That's a lot of domains!",
            "You're really making the most out of your account!",
            "Thanks for being such a loyal eepy.page user!",
        ];

        let text: string | null;

        if (domainsRegistered === 0)       text = randomChoiceFromArray(zero);
        else if (domainsRegistered === 1)  text = randomChoiceFromArray(one);
        else if (domainsRegistered === 2)  text = randomChoiceFromArray(two);
        else if (domainsRegistered === 3)  text = randomChoiceFromArray(three);
        else if (domainsRegistered === 4)  text = randomChoiceFromArray(four);
        else                               text = randomChoiceFromArray(fiveAndUp);

        return text ? text : "That's pretty cool, keep it up!"
    }

    onMount(async () => {
        serverContactor = new ServerContactor(getAuthToken() ?? null);
        data = await serverContactor.getWrapped();
        // data = makeDummyDataObject();
    });
</script>

<Holder>
    <div class="py-2 px-2 space-y-6">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">eepy.page wrapped</h1>
        {#if !data}
            <div transition:fade class="w-80 mt-4">
                <div class="flex items-center">
                    Loading
                    <Loader className="ml-2" asForeground />
                </div>
            </div>
        {:else}
            {@const createDate = new Date(data.account_created * 1000)}
            {@const daysSinceCreation = Math.floor(
                Math.abs(new Date().getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24)
            )}
            {@const nthAccount = data.total_users - data.accounts_made_after}

            <div class="space-y-4">
                <Card.Root class="gap-3">
                    <Card.Header>
                        <Card.Title class="text-2xl font-semibold">
                            You created your account in <span class="text-primary">{createDate.getUTCFullYear()}</span>!
                        </Card.Title>
                        <Card.Description>
                            (specifically {formatUTCDateTime(createDate)})
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <h3 class="text-lg font-medium">
                            That's {daysSinceCreation} days ago!
                        </h3>
                        <ul class="leading-relaxed list-disc pl-6">
                            <li>
                                To put that into perspective, your heart has beaten around
                                <strong>{addCommasToNumber(Math.floor(daysSinceCreation * heartBeatsPerDay))} times</strong>
                                since you created your account.
                            </li>
                            <li>
                                Your account is older than
                                <strong>{Math.round(100 - ((data.total_users - data.accounts_made_after) / data.total_users) * 100)}%</strong>
                                of eepy.page accounts!
                            </li>
                        </ul>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="gap-3">
                    <Card.Header>
                        <Card.Title class="text-2xl font-semibold">
                            You registered <span class="text-primary">{data.domains_registered}</span> domains!
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <h3 class="text-lg font-medium leading-relaxed">{randomRegisteredDomainsText(data.domains_registered)}</h3>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="gap-3">
                    <Card.Header>
                        <Card.Title class="text-2xl font-semibold">
                            Your account was the <span class="text-primary">{ordinal(nthAccount)}</span> ever created!
                        </Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <h3 class="text-lg font-medium leading-relaxed">
                            We have around
                            <strong class="text-foreground">
                                {adaptiveFormat(((data.accounts_made_after / nthAccount) * 100) / 100)} times
                            </strong>
                            as many users as when you initially made your account.
                        </h3>
                        <p class="text-sm italic leading-relaxed">
                            Whether you were the first to join, or the last to arrive, we're grateful you're here!
                        </p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="gap-3">
                    <Card.Header>
                        <Card.Title class="text-2xl font-semibold">
                            You have logged in from <span class="text-primary">{data.unique_ips}</span> unique IPs!
                        </Card.Title>
                        {#if data.unique_ips > 0}
                            <Card.Description class="text-base font-medium">
                                {#if data.unique_ips > 25}
                                    Captain Worldwide I see
                                {:else if data.unique_ips > 15}
                                    Quite the traveller!
                                {:else if data.unique_ips > 10}
                                    That's quite a few!
                                {:else if data.unique_ips > 0}
                                    Staying local I see
                                {/if}
                            </Card.Description>
                        {/if}
                    </Card.Header>
                    <Card.Content>
                        <ul class="leading-relaxed list-disc pl-6">
                            <li>On average, you used an IP for about <strong class="text-foreground">{Math.round(
                                daysSinceCreation / data.unique_ips
                            )}</strong> days before getting a new one</li>
                        </ul>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="gap-3">
                    <Card.Header>
                        <Card.Title class="text-2xl font-semibold">
                            You have visited <span class="text-primary">{browser ? (localStorage.getItem("views") ?? 0) : 0}</span> pages here!
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <h3 class="text-lg font-medium">
                            If we were earning ad-revenue, we could have earned about ${Math.round(
                                ((browser ? (Number(localStorage.getItem("views")) ?? 0) : 0) / 30) * 100
                            ) / 100} from you!
                        </h3>
                    </Card.Content>
                </Card.Root>
            </div>
        {/if}
    </div>
</Holder>
