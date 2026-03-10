<script lang="ts">
    import { onMount } from 'svelte';
    import type { Attachment } from 'svelte/attachments';
    import { SvelteSet } from 'svelte/reactivity';

    import { CalendarDate, isToday, today } from '@internationalized/date';
    import { parseDate, type DateValue } from '@internationalized/date'
    import { DatePicker } from '@skeletonlabs/skeleton-svelte';
    import type { Api as DatePickerApi } from '@zag-js/date-picker';

    import { emitter } from '$lib/mitt';
    import { supabase } from '$lib/supabase.svelte';

    const timeZone = 'Asia/Shanghai';

    type PropsType = { date: DateValue; disabled: boolean; };
    let { date = $bindable(), disabled }: PropsType = $props();

    let isRequesting: boolean = false;

    const highlightedDays: SvelteSet<string> = new SvelteSet();
    const queryedYearMonth: Set<string> = new Set();    

    async function fetchDailyIndicators(dateMonthStart: DateValue) {
        try {
            const gteDate = dateMonthStart.toString();
            const ltDate = dateMonthStart.add({ months: 1 }).toString();
            const { data } = await supabase.sbClient.from('svktv_dishes').select('date').gte('date', gteDate).lt('date', ltDate).gte('count', 1);
            if (data === null) {
                throw new Error();
            }
            queryedYearMonth.add(dateMonthStart.toString());
            data.forEach((row) => { highlightedDays.add(row.date); });
        } catch (e) {
        } finally {
            isRequesting = false;
        }
    }

    function onFocusedDateChanged(focusedDate: DateValue) {
        const dateMonthStart = new CalendarDate(focusedDate.year, focusedDate.month, 1);
        if (!isRequesting && !queryedYearMonth.has(dateMonthStart.toString())) {
            isRequesting = true;
            fetchDailyIndicators(dateMonthStart);
        }
    }

    onMount(() => {
        fetchDailyIndicators(new CalendarDate(date.year, date.month, 1));
    });

    onMount(() => {
        emitter.on('dish:changed', ({ type, date }) => {
            if (type === 'add') {
                highlightedDays.add(date);
            } else if (type === 'delete') {
                highlightedDays.delete(date);
            }
        });
        return () => {
            emitter.off('dish:changed');
        };
    });

    function selectDate(datePicker: DatePickerApi) {
        return function(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
            try {
                const dateToSelect = parseDate(event.currentTarget.dataset['date'] ?? '');
                date = dateToSelect;
                datePicker.setValue([dateToSelect]);
            } catch (e) {}
        }
    }

    const attachSelectDate: Attachment<HTMLButtonElement> = (button) => {
        emitter.on('calendar:select', (dateString) => {
            if (dateString !== 'today' || !isToday(date, timeZone)) {
                button.dataset['date'] = dateString === 'today' ? today(timeZone).toString() : dateString;
                button.click();
            }
        });
        return () => {
            emitter.off('calendar:select');
        };
    };
</script>


<div class="pt-2 flex justify-center items-center block">
    <DatePicker
        value={[date]} onValueChange={(e) => (date = e.value[0])} {disabled} onFocusChange={(e) => { onFocusedDateChanged(e.focusedValue); }}
        inline view="day" locale="zh-CN" {timeZone} startOfWeek={0}>
        <DatePicker.Content>
            <DatePicker.View view="day">
                <DatePicker.Context>
                    {#snippet children(datePicker)}
                        <button onclick={selectDate(datePicker())} {@attach attachSelectDate} class="absolute h-0 w-0 hidden overflow-hidden pointer-events-none" title="回到今天"></button>
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