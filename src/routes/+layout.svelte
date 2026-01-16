<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';

    import favicon from '$lib/assets/favicon.svg';
    import { emitter } from '$lib/mitt';
    import { supabase } from '$lib/supabase.svelte';
    import './layout.css';
    import Navigation from './Navigation.svelte';

    const { children } = $props();
    let showNavBar: boolean = $state(true);

    onMount(async () => {
        await supabase.init(async (status) => {
            if (status === true && page.url.pathname === '/login') {
                await goto('./menus');
            } else if (status === false && page.url.pathname !== '/login') {
                await goto('./login');
            }
        });
    });

    onMount(() => {
        emitter.on('ui:navbar', (status) => {
            if (status === 'hide') {
                showNavBar = false;
            } else if (status === 'show') {
                showNavBar = true;
            }
        });
        return () => {
            emitter.off('ui:navbar');
        };
    });
</script>


<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{#if supabase.isAuthorized !== null}
    <div class="fixed inset-0 flex flex-col">
        <main class="flex-1 overflow-hidden">
            {@render children()}
        </main>
        {#if showNavBar && page.url.pathname !== '/login'}
            <Navigation />
        {/if}
    </div>
{/if}