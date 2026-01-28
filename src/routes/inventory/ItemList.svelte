<script lang="ts">
    import { onMount } from 'svelte';

    import dayjs from 'dayjs';

    import { emitter } from '$lib/mitt';
    import type { InventoryItem, StoragePlace } from '$lib/schema';
    import AddButton from './AddButton.svelte';
    import ItemCard from './ItemCard.svelte';

    type PropsType = { place: StoragePlace; items: InventoryItem[]; };
    let { place, items = $bindable() }: PropsType = $props();

    let scrollY: number = $state(0);

    function compareItems(a: InventoryItem, b: InventoryItem) : number {
        if (a.expired_at !== null && b.expired_at !== null) {
            const daysDiff = dayjs(a.expired_at).diff(dayjs(b.expired_at), 'day');
            return daysDiff !== 0 ? daysDiff : a.name.localeCompare(b.name);
        }
        if (a.expired_at === null && b.expired_at === null) {
            return a.name.localeCompare(b.name);
        }
        return a.expired_at !== null ? -1 : 1;
    }

    onMount(() => {
        emitter.on('inventory:changed', ({ type, index, item }) => {
            if (place === item.place) {
                if (type === 'add') {
                    items.push(item);
                    items.sort(compareItems);
                } else if (type === 'update') {
                    items[index] = item;
                    items.sort(compareItems);
                } else if (type === 'delete') {
                    items.splice(index, 1);
                }
            }
        });
        return () => {
            emitter.off('inventory:changed');
        };
    });
</script>


<div class="w-full absolute inset-0 overflow-y-scroll flex flex-col gap-4" onscroll={(ev) => scrollY = ev.currentTarget.scrollTop}>
    {#each items as item, i (item.uid)}
        <ItemCard index={i} {item} />
    {/each}
    <AddButton {scrollY} {place} />
</div>