<script lang="ts">
	import Separator from "./ui/separator/separator.svelte";
</script>

<div class="footer bg-footer space-y-3 pt-8 sentry-unmask">
	<div class="contact">
		<h3 class="text-lg font-medium">Contact</h3>
		<Separator />

		<a href="mailto: support@frii.site">Support: support@frii.site</a>
		<a href="mailto: urgent@frii.site">Vulnerabilities: urgent@frii.site</a>
		<a href="mailto: social@frii.site">Social media: social@frii.site</a>
	</div>
	<div class="starting">
		<h3 class="text-lg font-medium">Getting started</h3>
		<Separator />
		<a href="https://github.com/ctih1/frii.site-frontend/wiki/FAQ">Frequently asked questions</a>
		<a href="https://github.com/ctih1/frii.site-frontend/wiki/Getting-Started#getting-started"
			>Creating an account</a>
		<a
			href="https://github.com/ctih1/frii.site-frontend/wiki/Getting-Started#managing-your-domains"
			>Modifying domains</a>
		<a
			href="https://github.com/ctih1/frii.site-frontend/wiki/Getting-Started#account-management"
			>Managing your account</a>
		<a href="https://github.com/ctih1/frii.site-frontend/wiki/API">Creating an API key</a>
	</div>
</div>

<style>
	.footer {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(auto, 1fr);
		max-width: 100vw;
		width: 100%;
		padding-bottom: 2em;
		text-align: center;
	}
	.footer * {
		display: flex;
		flex-direction: column;
	}
	a {
		color: var(--color-foreground);
		text-decoration: underline;
		width: fit-content;
		margin-right: auto;
		margin-left: auto;
	}

	@media (orientation: portrait) {
		.footer {
			display: flex;
			flex-direction: column;
		}
	}
</style>
