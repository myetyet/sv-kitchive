<script lang="ts">
    import type { DateValue } from '@internationalized/date';
    import { DatePicker } from '@skeletonlabs/skeleton-svelte';

    let { date = $bindable(), disabled }: { date: DateValue[]; disabled: boolean; } = $props();
</script>


<div class="pt-2 flex justify-center items-center block">
    <DatePicker
        value={date} onValueChange={(e) => (date = e.value)} {disabled}
        inline locale="zh-CN" timeZone="Asia/Shanghai" startOfWeek={0} maxView="month">
        <DatePicker.Content>
            <DatePicker.View view="day">
                <DatePicker.Context>
                    {#snippet children(datePicker)}
                        <DatePicker.ViewControl>
                            <DatePicker.PrevTrigger />
                            <DatePicker.ViewTrigger>
                                <DatePicker.RangeText />
                            </DatePicker.ViewTrigger>
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
                                    {#if !disabled || week.some((day: DateValue) => day.compare(date[0]) === 0)}
                                    <DatePicker.TableRow>
                                        {#each week as day, id (id)}
                                            <DatePicker.TableCell value={day} {disabled}>
                                                <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
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
            <DatePicker.View view="month">
                <DatePicker.Context>
                    {#snippet children(datePicker)}
                        <DatePicker.ViewControl>
                            <DatePicker.PrevTrigger />
                            <DatePicker.ViewTrigger>
                                <DatePicker.RangeText />
                            </DatePicker.ViewTrigger>
                            <DatePicker.NextTrigger />
                        </DatePicker.ViewControl>
                        <DatePicker.Table class="flex justify-center">
                            <DatePicker.TableBody>
                                {#each datePicker().getMonthsGrid({ columns: 4, format: 'short' }) as months, id (id)}
                                    <DatePicker.TableRow>
                                        {#each months as month, id (id)}
                                            <DatePicker.TableCell value={month.value}>
                                                <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
                                            </DatePicker.TableCell>
                                        {/each}
                                    </DatePicker.TableRow>
                                {/each}
                            </DatePicker.TableBody>
                        </DatePicker.Table>
                    {/snippet}
                </DatePicker.Context>
            </DatePicker.View>
        </DatePicker.Content>
    </DatePicker>
</div>