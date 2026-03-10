<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { on as addEventListenerTo } from 'svelte/events';

    import type { DateValue } from '@internationalized/date';
    import { ArrowDownIcon, ArrowLeftRightIcon, ArrowUpIcon, CalendarIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, SaveIcon, Trash2Icon, XIcon } from '@lucide/svelte';

    import { emitter } from '$lib/mitt';
    import { supabase } from '$lib/supabase.svelte';

    type PropsType = { date: DateValue; isEditing: boolean; };
    let { date, isEditing = $bindable() }: PropsType = $props();

    let dishes: string[] = $state([]);
    // svelte-ignore non_reactive_update
    let dishesSnapshot: string[];
    let editingDish: string = $state('');
    let isEditingDishValid: boolean = $derived(/^\s*$/.test(editingDish) || dishes.includes(editingDish));
    let isSavingEdit: boolean = $state(false);
    let showEditErrorHint: boolean = $state(false);

    let isSwaping: boolean = $state(false);
    let isUserOperating: boolean = $derived(isEditing || isSwaping);
    let dateString: string = $derived(date.toString());
    // svelte-ignore non_reactive_update
    let dateStringSnapshot: string = '';
    let canSwap: boolean = $derived(dateString !== dateStringSnapshot);
    let noTriggerRequest: boolean = false;
    let isSavingSwap: boolean = $state(false);
    let showSwapErrorHint: boolean = $state(false);

    let isRequesting: boolean = $derived(isSavingEdit || isSavingSwap);

    async function selectDishes(dateString: string) {
        const { data } = await supabase.sbClient.from('svktv_dishes').select('dishes').eq('date', dateString).single();
        dishes = data?.dishes ?? [];
        isEditing = false;
        editingDish = '';
    }

    $effect(() => {
        dateString; // force $effect to re-run when dateString changes, regardless of previous noTriggerRequest value
        if (noTriggerRequest) {
            noTriggerRequest = false;
            dishes = dishesSnapshot;
        } else {
            selectDishes(dateString);
        }
    });

    $effect(() => {
        emitter.emit('ui:navbar', isUserOperating ? 'hide' : 'show');
    });

    onMount(() => addEventListenerTo(window, 'beforeunload', (event) => {
        if (isUserOperating) {
            event.preventDefault();
        }
    }));

    function editDishes() {
        dishesSnapshot = $state.snapshot(dishes);
        isEditing = true;
        showEditErrorHint = false;
    }

    async function saveDishes() {
        if (editingDish.length > 0) {
            addDish();
        }
        isSavingEdit = true;
        try {
            if (dishes.length > 0) {
                await supabase.sbClient.from('svktv_dishes').upsert({ date: dateString, dishes });
                emitter.emit('dish:changed', { type: 'add', date: dateString });
            } else if (dishesSnapshot.length > 0) {
                await supabase.sbClient.from('svktv_dishes').delete().eq('date', dateString);
                emitter.emit('dish:changed', { type: 'delete', date: dateString });
            }
            isEditing = false;
        } catch (e) {
            showEditErrorHint = true;
        } finally {
            isSavingEdit = false;
        }
    }

    function cancelEditing() {
        isEditing = false;
        dishes = dishesSnapshot;
    }

    function deleteDish(i: number) {
        return function() {
            dishes.splice(i, 1);
        }
    }

    function moveDish(i: number, offset: number) {
        return function() {
            [dishes[i], dishes[i + offset]] = [dishes[i + offset], dishes[i]];
        }
    }

    function addDish() {
        dishes.push(editingDish);
        editingDish = '';
    }

    function returnToToday() {
        emitter.emit('calendar:select', 'today');
    }

    function swapMenus() {
        dishesSnapshot = $state.snapshot(dishes);
        dishes = [];
        dateStringSnapshot = dateString;
        isSwaping = true;
        showSwapErrorHint = false;
    }

    async function saveSwaping() {
        isSavingSwap = true;
        try {
            if (dishesSnapshot.length > 0 && dishes.length > 0) {
                await Promise.all([
                    supabase.sbClient.from('svktv_dishes').update({ dishes: dishesSnapshot }).eq('date', dateString),
                    supabase.sbClient.from('svktv_dishes').update({ dishes: dishes }).eq('date', dateStringSnapshot)
                ]);
            } else if (dishesSnapshot.length > 0 && dishes.length === 0) {
                await supabase.sbClient.from('svktv_dishes').update({ date: dateString }).eq('date', dateStringSnapshot);
                emitter.emit('dish:changed', { type: 'add', date: dateString });
                emitter.emit('dish:changed', { type: 'delete', date: dateStringSnapshot });
            } else if (dishes.length > 0 && dishesSnapshot.length === 0) {
                await supabase.sbClient.from('svktv_dishes').update({ date: dateStringSnapshot }).eq('date', dateString);
                emitter.emit('dish:changed', { type: 'add', date: dateStringSnapshot });
                emitter.emit('dish:changed', { type: 'delete', date: dateString });
            }
            isSwaping = false;
            dishes = dishesSnapshot;
        } catch (e) {
            showSwapErrorHint = true;
        } finally {
            isSavingSwap = false;
        }
    }

    function cancelSwaping() {
        isSwaping = false;
        noTriggerRequest = true;
        dishes = dishesSnapshot;
        emitter.emit('calendar:select', dateStringSnapshot);
    }
</script>


<div class="pt-3 px-4 flex justify-between">
    {#if isEditing}
        <div>
            {#if isSavingEdit}
                <span class="text-primary-500 animate-pulse">菜单保存中……</span>
            {:else if showEditErrorHint}
                <span class="text-red-500">菜单保存失败</span>
            {/if}
        </div>
        <div class="flex gap-2">
            <button type="button" class="btn" disabled={isRequesting} onclick={saveDishes} title="保存">
                <SaveIcon class="size-5" />
            </button>
            <button type="button" class="btn" disabled={isRequesting} onclick={cancelEditing} title="取消">
                <XIcon class="size-5" />
            </button>
        </div>
    {:else if isSwaping}
        <div>
            {#if isSavingSwap}
                <span class="text-primary-500 animate-pulse">菜单交换中……</span>
            {:else if showSwapErrorHint}
                <span class="text-red-500">菜单交换失败</span>
            {/if}
        </div>
        <div class="flex gap-2">
            <button type="button" class="btn" disabled={!canSwap} onclick={saveSwaping} title="确认">
                <CheckIcon class="size-5" />
            </button>
            <button type="button" class="btn" onclick={cancelSwaping}  title="取消">
                <XIcon class="size-5" />
            </button>
        </div>
    {:else}
        <div class="relative inline-flex">
            <button type="button" class="btn" onclick={returnToToday} title="回到今天">
                <CalendarIcon class="size-5" />
            </button>
            <span class="text-[7px] font-bold absolute top-5/8 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">{new Date().getDate()}</span>
        </div>
        <div class="flex gap-2">
            <button type="button" class="btn" onclick={swapMenus} title="交换">
                <ArrowLeftRightIcon class="size-5" />
            </button>
            <button type="button" class="btn" onclick={editDishes} title="编辑">
                <PencilIcon class="size-5" />
            </button>
        </div>
    {/if}
</div>
<div class="table-wrap pt-2 px-4">
    <table class="table table-fixed caption-bottom">
        <tbody>
            {#snippet dishList(dishes: string[])}
                {@const dishesCount = dishes.length}
                {#if dishesCount > 0}
                    {#each dishes as dish, i (dish)}
                        <tr class={i === dishesCount - 1 ? 'border-b-0!' : ''}>
                            <td class="w-[10%]">{i + 1}</td>
                            <td class="w-[55%] select-text">{dish}</td>
                            <td class="w-[35%]"></td>
                        </tr>
                    {/each}
                {:else}
                    <tr class="border-b-0!">
                        <td colspan={3} class="w-full text-center text-gray-500">什么也没有……</td>
                    </tr>
                {/if}
            {/snippet}

            {#if isEditing}
                {#each dishes as _, i (i)}
                    <tr>
                        <td class="w-[10%]">{i + 1}</td>
                        <td class="w-[55%]">
                            <input class="input text-xs" type="text" disabled={isRequesting} bind:value={dishes[i]}>
                        </td>
                        <td class="w-[35%]">
                            <button type="button" class="px-1.5" disabled={isRequesting || i === 0} onclick={moveDish(i, -1)} title="向上移动">
                                <ChevronUpIcon class="size-4" />
                            </button>
                            <button type="button" class="px-1.5" disabled={isRequesting || i === dishes.length - 1} onclick={moveDish(i, +1)} title="向下移动">
                                <ChevronDownIcon class="size-4" />
                            </button>
                            <button type="button" class="px-1.5" disabled={isRequesting} onclick={deleteDish(i)} title="删除">
                                <Trash2Icon class="size-4" />
                            </button>
                        </td>
                    </tr>
                {/each}
                <tr>
                    <td class="w-[10%]">{dishes.length + 1}</td>
                    <td colspan={2} class="w-[90%]">
                        <div class="flex items-center w-full gap-4">
                            <input class="input text-xs w-[85%]" type="text" disabled={isRequesting} bind:value={editingDish} placeholder="在此输入菜品" />
                            <button type="button" class="px-1.5 w-[15%]" disabled={isRequesting || isEditingDishValid} onclick={addDish} title="添加">
                                <CheckIcon class="size-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            {:else if isSwaping}
                {@render dishList(dishesSnapshot)}
                <tr class="border-b-0!">
                    <td colspan={3} class="w-full">
                        <div class="flex flex-row">
                            <div class="flex-1 flex flex-row items-center justify-center gap-2">
                                <span class="text-gray-500">{dateStringSnapshot}</span>
                                <ArrowUpIcon class="size-5 stroke-gray-500" />
                            </div>
                            <div class="flex-1 flex flex-row items-center justify-center gap-2">
                                {#if canSwap}
                                    <ArrowDownIcon class="size-5 stroke-gray-500" />
                                    <span class="text-gray-500">{date.toString()}</span>
                                {/if}
                            </div>
                        </div>
                    </td>
                </tr>
                {#if canSwap}
                    {@render dishList(dishes)}
                {:else}
                    <tr>
                        <td colspan={3} class="w-full text-center text-gray-500">请选择一个与{dateStringSnapshot}不同的日期</td>
                    </tr>
                {/if}
            {:else}
                {@render dishList(dishes)}
            {/if}
        </tbody>
    </table>
</div>