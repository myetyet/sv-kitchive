<script lang="ts">
    import dayjs from 'dayjs';

    import type { InventoryItem } from '$lib/schema';
    import EditDialog from './EditDialog.svelte';

    let { index, item }: { index: number; item: InventoryItem; } = $props();

    let showDialog: boolean = $state(false);
</script>


<button class="block w-full shadow-md p-2 hover:shadow-lg transition-shadow" onclick={() => showDialog = true}>
    <div class="flex justify-between items-center mb-2">
        <span class="text-lg font-semibold">{item.name}</span>
        <span class="text-base">库存：{item.quantity ?? '暂未录入'}</span>
    </div>
    <div class="grid grid-cols-1 gap-3 text-gray-600">
        <div class="flex items-center">
            <span class="font-semibold text-gray-700">保质期：</span>
            <span>{item.expired_at ?? '暂未录入'}</span>
        </div>
        {#if item.expired_at !== null && item.expired_at.length > 0}
            {@const daysLeft = dayjs(item.expired_at).diff(dayjs(), 'day')}
            <div class="flex items-center">
                <span class="font-semibold text-gray-700">剩余天数：</span>
                <span class="font-semibold {daysLeft < 0 ? 'text-red-500' : 'text-orange-600'}">
                    {daysLeft < 0 ? '已过期！' : daysLeft === 0 ? '今日到期' : `${daysLeft}天`}
                </span>
            </div>
        {/if}
    </div>
</button>
<EditDialog bind:open={showDialog} {item} place={item.place} {index} />