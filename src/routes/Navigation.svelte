<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';

    import { Navigation } from '@skeletonlabs/skeleton-svelte';

    import { routes } from '$lib/routes';
</script>


<Navigation class="z-999" layout="bar">
    <Navigation.Menu class="flex flex-row flex-nowrap gap-2">
        {#each routes as route (route.url)}
            {@const isSelected = page.url.pathname === route.url}
            <button
                onclick={isSelected ? undefined : () => goto(resolve(route.url))}
                class="btn flex-1 flex-col items-center gap-1" class:scale-125={isSelected}>
                <div class="relative inline-block">
                    <!-- {#if route.url === '/menus'}
                        <span class="absolute -right-0.75 -top-0.75 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    {/if} -->
                    <route.icon class="size-4.5 overflow-hidden" color={isSelected ? 'orange': 'currentColor'} />
                </div>
                <span class="text-[10px]" class:font-semibold={isSelected}>{route.label}</span>
            </button>
        {/each}
    </Navigation.Menu>
</Navigation>