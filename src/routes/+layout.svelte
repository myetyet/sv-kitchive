<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';

    import favicon from '$lib/assets/favicon.svg';
    import { emitter } from '$lib/mitt';
    import { supabase } from '$lib/supabase.svelte';
    import './layout.css';
    import Navigation from './Navigation.svelte';

    const { children } = $props();
    let showNavBar: boolean = $state(true);

    onMount(async () => {
        await supabase.init(async (status) => {
            if (status === true && (page.route.id === '/login' || page.route.id === '/')) {
                await goto(resolve('/menus'));
            } else if (status === false && page.route.id !== '/login') {
                await goto(resolve('/login'));
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
        {#if showNavBar && page.route.id !== '/login'}
            <Navigation />
        {/if}
    </div>
{/if}