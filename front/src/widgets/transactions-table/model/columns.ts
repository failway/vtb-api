import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  ArrowUpDown,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Briefcase,
  CreditCard,
  Gift,
  Repeat
} from 'lucide-vue-next'
import type { Transaction } from '@/entities/transaction/types'
import TransactionsTableRowActions from '../ui/TransactionsTableRowActions.vue'

// Функция для форматирования валюты
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Иконки для категорий
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'Продукты': ShoppingCart,
    'Рестораны': Utensils,
    'Транспорт': Car,
    'Покупки': ShoppingCart,
    'Подписки': Repeat,
    'Переводы': Repeat,
    'Зарплата': Briefcase,
    'Возвраты': Gift,
  }
  return iconMap[category] || CreditCard
}

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      'checked': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
      'onUpdate:checked': value => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Выбрать все',
    }),
    cell: ({ row }) => h(Checkbox, {
      'checked': row.getIsSelected(),
      'onUpdate:checked': value => row.toggleSelected(!!value),
      'ariaLabel': 'Выбрать строку',
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Дата', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'))
      const formatted = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date)
      return h('div', { class: 'font-medium whitespace-nowrap' }, formatted)
    },
  },
  {
    accessorKey: 'description',
    header: 'Описание',
    cell: ({ row }) => {
      return h('div', { class: 'max-w-[300px]' }, [
        h('div', { class: 'font-medium truncate' }, row.getValue('description')),
        h('div', { class: 'text-xs text-muted-foreground' }, `ID: ${row.original.id}`)
      ])
    },
  },
  {
    accessorKey: 'category',
    header: 'Категория',
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      const Icon = getCategoryIcon(category)
      return h('div', { class: 'flex items-center gap-2' }, [
        h(Icon, { class: 'h-4 w-4 text-muted-foreground' }),
        h('span', { class: 'text-sm' }, category)
      ])
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        class: 'w-full justify-end'
      }, () => ['Сумма', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const type: 'credit' | 'debit' = row.original.type
      const formatted = formatCurrency(amount, row.original.currency)

      const badge = type === 'credit'
        ? h('span', { class: 'inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700' }, formatted)
        : h('span', { class: 'inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700' }, formatted)

      return h('div', { class: 'text-right font-semibold' }, badge)
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return h('div', { class: 'text-right' }, h(TransactionsTableRowActions, {
        transaction: row.original,
      }))
    },
  },
]
