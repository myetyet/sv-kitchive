<script lang="ts">
    import type { DateValue } from '@internationalized/date';
    import { CheckIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, SaveIcon, Trash2Icon, XIcon } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { on as addEventListenerTo } from 'svelte/events';

    import { emitter } from '$lib/mitt';
    import { supabase } from '$lib/supabase.svelte';

    let { date, isEditing = $bindable() }: { date: DateValue; isEditing: boolean; } = $props();

    let dishes: string[] = $state([]);
    let _dishes: string[];
    let dishesCount: number = $derived(dishes.length);
    let editingDish: string = $state('');
    let isEditingDishValid: boolean = $derived(/^\s*$/.test(editingDish) || dishes.includes(editingDish));

    async function selectDishes(date: string) {
        const { data } = await supabase.sbClient.from('svktv_dishes').select('dishes').eq('date', date).single();
        dishes = data?.dishes ?? [];
        _dishes = $state.snapshot(dishes);
        isEditing = false;
        editingDish = '';
    }

    $effect(() => {
        selectDishes(date.toString());
    });

    $effect(() => {
        emitter.emit('ui:navbar', isEditing ? 'hide' : 'show');
    });

    onMount(() => addEventListenerTo(window, 'beforeunload', (event) => {
        if (isEditing) {
            event.preventDefault();
        }
    }));

    function editDishes() {
        isEditing = true;
        _dishes = $state.snapshot(dishes);
    }

    async function saveDishes() {
        if (editingDish.length > 0) {
            addDish();
        }
        await supabase.sbClient.from('svktv_dishes').upsert({ date: date.toString(), dishes });
        isEditing = false;
        _dishes = $state.snapshot(dishes);
    }

    function cancelEditing() {
        isEditing = false;
        dishes = _dishes;
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
</script>


<div class="pt-3 px-4 flex justify-end">
    {#if isEditing}
        <button type="button" class="btn" onclick={saveDishes} title="保存">
            <SaveIcon class="size-5" />
        </button>
        <button type="button" class="btn" onclick={cancelEditing} title="取消">
            <XIcon class="size-5" />
        </button>
    {:else}
        <button type="button" class="btn" onclick={editDishes} title="编辑">
            <PencilIcon class="size-5" />
        </button>
    {/if}
</div>
<div class="table-wrap pt-2 px-4">
    <table class="table table-fixed caption-bottom">
        <tbody>
            {#if isEditing}
                {#each dishes as _, i (i)}
                    <tr>
                        <td class="w-[10%] ">{i + 1}</td>
                        <td class="w-[55%]">
                            <input class="input text-xs" type="text" bind:value={dishes[i]}>
                        </td>
                        <td class="w-[35%]">
                            <button type="button" class="px-1.5" disabled={i === 0} onclick={moveDish(i, -1)} title="向上移动">
                                <ChevronUpIcon class="size-4" />
                            </button>
                            <button type="button" class="px-1.5" disabled={i === dishesCount - 1} onclick={moveDish(i, +1)} title="向下移动">
                                <ChevronDownIcon class="size-4" />
                            </button>
                            <button type="button" class="px-1.5" onclick={deleteDish(i)} title="删除">
                                <Trash2Icon class="size-4" />
                            </button>
                        </td>
                    </tr>
                {/each}
                <tr>
                    <td class="w-[10%]">{dishesCount + 1}</td>
                    <td colspan={2} class="w-[90%]">
                        <div class="flex items-center w-full gap-4">
                            <input class="input text-xs w-[85%]" type="text" bind:value={editingDish} placeholder="在此输入菜品" />
                            <button type="button" class="px-1.5 w-[15%]" disabled={isEditingDishValid} onclick={addDish} title="添加">
                                <CheckIcon class="size-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            {:else if dishesCount > 0}
                {#each dishes as dish, i (dish)}
                    <tr>
                        <td class="w-[10%]">{i + 1}</td>
                        <td class="w-[55%]">{dish}</td>
                        <td class="w-[35%]"></td>
                    </tr>
                {/each}
            {:else}
                <tr>
                    <td colspan={3} class="w-full text-center text-gray-500">什么也没有……</td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>