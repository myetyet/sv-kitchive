<script lang="ts">
    import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
    import dayjs from 'dayjs';

    import { emitter } from '$lib/mitt';
    import type { InventoryItem, StoragePlace } from '$lib/schema';
    import { supabase } from '$lib/supabase.svelte';

    type PropsType = { open: boolean; place: StoragePlace; item?: InventoryItem | null; index?: number; };
    let { open: showEditDialog = $bindable(), place, item = null, index = -1 }: PropsType = $props();
    let showConfirmationDialog: boolean = $state(false);
    let inputItemName: string = $derived(item?.name ?? '');
    let inputItemQuantity: number | null = $derived(item?.quantity ?? null);
    let inputItemExpiredAt: string = $derived(item?.expired_at ?? '');
    let isSavingItem: boolean = $state(false);
    let isDeletingItem: boolean = $state(false);
    let showSaveErrorHint: boolean = $state(false);
    let showDeleteErrorHint: boolean = $state(false);

    let isRequesting: boolean = $derived(isSavingItem || isDeletingItem);

    let canSaveItem = $derived(inputItemName.length > 0);

    function dismissError() {
        showSaveErrorHint = false;
        showDeleteErrorHint = false;
    }

    async function deleteItem() {
        if (item !== null) {
            showConfirmationDialog = false;
            isDeletingItem = true;
            dismissError();
            try {
                const { error } = await supabase.sbClient.from('svktv_inventory').delete().eq('uid', item.uid);
                if (error !== null) {
                    throw new Error();
                }
                emitter.emit('inventory:changed', { type: 'delete', index, item });
                showEditDialog = false;
            } catch (e) {
                showDeleteErrorHint = true;
            } finally {
                isDeletingItem = false;
            }
        }
    }

    async function saveItem() {
        if (item !== null && inputItemName === item.name && inputItemQuantity === item.quantity && inputItemExpiredAt === item.expired_at) {
            showEditDialog = false;
        } else {
            isSavingItem = true;
            dismissError();
            try {
                const basicItem = { name: inputItemName, quantity: inputItemQuantity, expired_at: inputItemExpiredAt.length > 0 ? inputItemExpiredAt : null };
                if (item === null) {
                    const { data } = await supabase.sbClient.from('svktv_inventory').insert({ ...basicItem, place }).select().single();
                    if (data === null) {
                        throw new Error();
                    }
                    emitter.emit('inventory:changed', { type: 'add', index, item: data });
                } else {
                    const { error } = await supabase.sbClient.from('svktv_inventory').update(basicItem).eq('uid', item.uid);
                    if (error !== null) {
                        throw new Error();
                    }
                    emitter.emit('inventory:changed', { type: 'update', index, item: { ...basicItem, uid: item.uid, place: item.place } });
                }
                showEditDialog = false;
            } catch (e) {
                showSaveErrorHint = true;
            } finally {
                isSavingItem = false;
            }
        }
    }

    $effect(() => {
        if (showEditDialog) {
            inputItemName = item?.name ?? '';
            inputItemQuantity = item?.quantity ?? null;
            inputItemExpiredAt = item?.expired_at ?? '';
            dismissError();
        }
    })
</script>


<Dialog open={showEditDialog} closeOnInteractOutside={false}>
    <Portal>
        <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
        <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center">
            <Dialog.Content class="card bg-surface-100-900 w-md p-4 space-y-2 shadow-xl">
                <div class="flex justify-between items-center">
                    <Dialog.Title class="text-lg font-bold">【{place === 0 ? '冷藏' : place === 1 ? '冷冻' : place === 2 ? '常温' : '其他'}】{item === null ? '新增' : '修改' }物品信息</Dialog.Title>
                    {#if isRequesting}
                        <span class="text-primary-500 animate-pulse">{isSavingItem ? '保存' : isDeletingItem ? '删除' : '网络请求'}中……</span>
                    {:else if showSaveErrorHint || showDeleteErrorHint}
                        <span class="text-red-500">{showSaveErrorHint ? '保存' : showDeleteErrorHint ? '删除' : '网络请求'}失败</span>
                    {/if}
                </div>
                <Dialog.Description class="mb-6">
                    <fieldset class="space-y-4">
                        {#if item !== null}
                            <label class="label">
                                <span class="label-text">UID<span class="text-red-500">&nbsp;&nbsp;*</span></span>
                                <input class="input" type="text" value={item.uid} disabled={true} />
                            </label>
                        {/if}
                        <label class="label">
                            <span class="label-text">名称<span class="text-red-500">&nbsp;&nbsp;*</span></span>
                            <input class="input" type="text" bind:value={inputItemName} disabled={isRequesting} placeholder={item?.name ?? '物品名称'} />
                        </label>
                        <label class="label">
                            <span class="label-text">库存</span>
                            <input class="input" type="number" bind:value={inputItemQuantity} disabled={isRequesting} placeholder={item?.quantity?.toString() ?? '库存量'} />
                        </label>
                        <label class="label">
                            <span class="label-text">
                                <span>保质期</span>
                                {#if inputItemExpiredAt.length > 0}
                                    {@const daysLeft = dayjs(inputItemExpiredAt).diff(dayjs(), 'day')}
                                    <span class="text-gray-700 dark:text-gray-300">（距离过期：{daysLeft < 0 ? '已过期' : daysLeft === 0 ? '今日到期' : `${daysLeft}天`}）</span>
                                {/if}
                            </span>
                            <input class="input" type="date" bind:value={inputItemExpiredAt} disabled={isRequesting} placeholder={inputItemExpiredAt} />
                        </label>
                    </fieldset>
                </Dialog.Description>
                <div class="flex flex-nowrap {item === null ? 'justify-end' : 'justify-between'}">
                    {#if item !== null}
                        <button class="btn preset-filled-error-500 text-white text-lg" disabled={isRequesting} onclick={() => showConfirmationDialog = true}>删除</button>
                    {/if}
                    <div class="flex gap-3">
                        <button class="btn preset-tonal text-lg" disabled={isRequesting} onclick={() => showEditDialog = false}>取消</button>
                        <button class="btn preset-filled text-lg" disabled={!canSaveItem || isRequesting} onclick={saveItem}>保存</button>
                    </div>
                </div>
            </Dialog.Content>
        </Dialog.Positioner>
    </Portal>
</Dialog>
<Dialog open={showConfirmationDialog} closeOnInteractOutside={false}>
    <Portal>
        <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-100-900/50" />
        <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
            <Dialog.Content class="card bg-surface-100-900 w-full max-w-xl p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 translate-y-[100px] starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-[100px] data-[state=open]:opacity-100 data-[state=open]:translate-y-0">
                <div class="flex justify-center items-center">
                    <Dialog.Title class="text-xl">是否确认删除？</Dialog.Title>
                </div>
                <div class="flex justify-end gap-2">
                    <button class="btn preset-tonal text-sm" onclick={() => showConfirmationDialog = false}>取消</button>
                    <button class="btn preset-filled text-sm" onclick={deleteItem}>确认</button>
                </div>
            </Dialog.Content>
        </Dialog.Positioner>
    </Portal>
</Dialog>