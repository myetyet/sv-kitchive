<script lang="ts">
    import { onMount } from 'svelte';

    import { Tabs } from '@skeletonlabs/skeleton-svelte';

    import type { InventoryItem, StoragePlace } from '$lib/schema';
    import { supabase } from '$lib/supabase.svelte';
    import ItemList from './ItemList.svelte';

    let items: { [place in StoragePlace]: InventoryItem[]; } = $state({ 0: [], 1: [], 2: [] });

    onMount(async () => {
        const { data } = await supabase.sbClient.from('svktv_inventory').select('uid,place,name,expired_at,quantity').in('place', [0, 1, 2]).order('expired_at', { ascending: true });
        if (data !== null) {
            items = data.reduce((acc, item) => {
                acc[item.place].push(item);
                return acc;
            }, { 0: [] as InventoryItem[], 1: [] as InventoryItem[], 2: [] as InventoryItem[] });
        };
    });
</script>


<svelte:head>
    <title>库存</title>
</svelte:head>

<Tabs defaultValue="chilled" class="h-full flex flex-col">
    <Tabs.List class="sticky top-0 shrink-0 mb-1 z-10 bg-surface-50-950">
        <Tabs.Trigger class="flex-1" value="chilled">冷藏&nbsp;({items[0].length})</Tabs.Trigger>
        <Tabs.Trigger class="flex-1" value="frozen">冷冻&nbsp;({items[1].length})</Tabs.Trigger>
        <Tabs.Trigger class="flex-1" value="shelf">常温&nbsp;({items[2].length})</Tabs.Trigger>
        <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Content value="chilled" class="flex-1 relative">
        <ItemList place={0} bind:items={items[0]} />
    </Tabs.Content>
    <Tabs.Content value="frozen" class="flex-1 relative">
        <ItemList place={1} bind:items={items[1]} />
    </Tabs.Content>
    <Tabs.Content value="shelf" class="flex-1 relative">
        <ItemList place={2} bind:items={items[2]} />
    </Tabs.Content>
</Tabs>