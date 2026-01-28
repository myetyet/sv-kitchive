<script lang="ts">
    import { onMount } from 'svelte';

    import { CalendarDate, today } from '@internationalized/date';
    import type { DateValue } from '@internationalized/date'
    import { DatePicker } from '@skeletonlabs/skeleton-svelte';
    import type { Api as DatePickerApi } from '@zag-js/date-picker';

    import { emitter } from '$lib/mitt';
    import { supabase } from '$lib/supabase.svelte';

    type PropsType = { date: DateValue; disabled: boolean; };
    let { date = $bindable(), disabled }: PropsType = $props();

    let prevYearMonth: DateValue = new CalendarDate(date.year, date.month, 1);
    let isRequesting: boolean = false;
    let highlightedDays: Set<string> = $state(new Set());

    let buttonReturnToToday: HTMLButtonElement | undefined = $state(undefined);

    async function fetchDailyIndicators() {
        isRequesting = true;
        try {
            const gteDate = prevYearMonth.toString();
            const ltDate = prevYearMonth.add({ months: 1 }).toString();
            const { data } = await supabase.sbClient.from('svktv_dishes').select('date').gte('date', gteDate).lt('date', ltDate).gte('count', 1);
            if (data === null) {
                throw new Error();
            }
            highlightedDays = new Set(data.map((row) => row.date));
        } catch (e) {
        } finally {
            isRequesting = false;
        }
    }

    function returnToToday(datePicker: DatePickerApi) {
        return function() {
            date = today('Asia/Shanghai');
            datePicker.selectToday();
        }
    }

    $effect(() => {
        if (!isRequesting && (date.year !== prevYearMonth.year || date.month !== prevYearMonth.month)) {
            prevYearMonth = new CalendarDate(date.year, date.month, 1);
            fetchDailyIndicators();
        }
    });

    onMount(fetchDailyIndicators);

    onMount(() => {
        emitter.on('calendar:today', () => {
            buttonReturnToToday?.click();
        });
        return () => {
            emitter.off('calendar:today');
        };
    });
</script>


<div class="pt-2 flex justify-center items-center block">
    <DatePicker
        value={[date]} onValueChange={(e) => (date = e.value[0])} {disabled}
        inline view="day" locale="zh-CN" timeZone="Asia/Shanghai" startOfWeek={0}>
        <DatePicker.Content>
            <DatePicker.View view="day">
                <DatePicker.Context>
                    {#snippet children(datePicker)}
                        <button onclick={returnToToday(datePicker())} bind:this={buttonReturnToToday} class="absolute h-0 w-0 hidden overflow-hidden pointer-events-none" title="回到今天"></button>
                        <DatePicker.ViewControl>
                            <DatePicker.PrevTrigger />
                            <DatePicker.RangeText class="btn" />
                            <DatePicker.NextTrigger />
                        </DatePicker.ViewControl>
                        <DatePicker.Table style="border-spacing: calc(var(--spacing) * 2.5) calc(var(--spacing) * 0.5) !important;">
                            <DatePicker.TableHead>
                                <DatePicker.TableRow>
                                    {#each datePicker().weekDays as weekDay, id (id)}
                                        <DatePicker.TableHeader>{weekDay.short.replace('周', '')}</DatePicker.TableHeader>
                                    {/each}
                                </DatePicker.TableRow>
                            </DatePicker.TableHead>
                            <DatePicker.TableBody>
                                {#each datePicker().weeks as week, id (id)}
                                    {#if !disabled || week.some((day: DateValue) => day.compare(date) === 0)}
                                    <DatePicker.TableRow>
                                        {#each week as day, id (id)}
                                            <DatePicker.TableCell value={day} {disabled}>
                                                <DatePicker.TableCellTrigger class="relative">
                                                    <span>{day.day}</span>
                                                    {#if highlightedDays.has(day.toString())}
                                                        <span class="absolute right-0.5 top-0.5 w-1.25 h-1.25 rounded-full {day.toString() === date.toString() ? 'bg-gray-200 dark:bg-gray-800' : 'bg-red-400'}"></span>
                                                    {/if}
                                                </DatePicker.TableCellTrigger>
                                            </DatePicker.TableCell>
                                        {/each}
                                    </DatePicker.TableRow>
                                    {/if}
                                {/each}
                            </DatePicker.TableBody>
                        </DatePicker.Table>
                    {/snippet}
                </DatePicker.Context>
            </DatePicker.View>
        </DatePicker.Content>
    </DatePicker>
</div>