<script setup lang="ts">
import { ref, computed } from 'vue'
import TransactionsTableWidget from '@/widgets/transactions-table/ui/TransactionsTableWidget.vue'
import { columns } from '@/widgets/transactions-table/model/columns'
import type { Transaction } from '@/entities/transaction/types'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  Calendar,
  Filter
} from 'lucide-vue-next'

// Моковые данные
const data = ref<Transaction[]>([
  { id: '1', date: '2025-10-28', description: 'Перевод от Ивана П.', amount: 5000, currency: 'RUB', type: 'credit', category: 'Переводы' },
  { id: '2', date: '2025-10-27', description: 'Оплата в "Пятерочка"', amount: 1250.50, currency: 'RUB', type: 'debit', category: 'Продукты' },
  { id: '3', date: '2025-10-26', description: 'Подписка Yandex Plus', amount: 299, currency: 'RUB', type: 'debit', category: 'Подписки' },
  { id: '4', date: '2025-10-25', description: 'Зарплата', amount: 75000, currency: 'RUB', type: 'credit', category: 'Зарплата' },
  { id: '5', date: '2025-10-24', description: 'Кафе "Шоколадница"', amount: 850, currency: 'RUB', type: 'debit', category: 'Рестораны' },
  { id: '6', date: '2025-10-23', description: 'Покупка на Ozon', amount: 4300, currency: 'RUB', type: 'debit', category: 'Покупки' },
  { id: '7', date: '2025-10-22', description: 'Аренда самоката', amount: 150.75, currency: 'RUB', type: 'debit', category: 'Транспорт' },
  { id: '8', date: '2025-10-21', description: 'Возврат средств от AliExpress', amount: 620, currency: 'RUB', type: 'credit', category: 'Возвраты' },
])

const selectedPeriod = ref('month')
const selectedCategory = ref('all')

// Вычисляемые значения для статистики
const totalIncome = computed(() => {
  return data.value
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpense = computed(() => {
  return data.value
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)
})

const balance = computed(() => totalIncome.value - totalExpense.value)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(amount)
}

const categories = computed(() => {
  const uniqueCategories = [...new Set(data.value.map(t => t.category))]
  return ['all', ...uniqueCategories]
})

const filteredData = computed(() => {
  if (selectedCategory.value === 'all') {
    return data.value
  }
  return data.value.filter(t => t.category === selectedCategory.value)
})

const exportToPDF = () => {
  alert('Экспорт в PDF (функция в разработке)')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Заголовок с действиями -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          История транзакций
        </h1>
        <p class="text-muted-foreground mt-1">
          Управляйте и анализируйте ваши финансовые операции
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="exportToPDF">
          <Download class="mr-2 h-4 w-4" />
          Экспорт в PDF
        </Button>
      </div>
    </div>

    <!-- Карточки статистики -->
    <div class="grid gap-4 md:grid-cols-3">
      <!-- Баланс -->
      <div class="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Текущий баланс</p>
            <h3 class="text-2xl font-bold mt-2" :class="balance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(balance) }}
            </h3>
          </div>
          <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet class="h-6 w-6 text-primary" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs text-muted-foreground">
          <Calendar class="mr-1 h-3 w-3" />
          За текущий период
        </div>
      </div>

      <!-- Доходы -->
      <div class="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Доходы</p>
            <h3 class="text-2xl font-bold text-green-600 mt-2">
              {{ formatCurrency(totalIncome) }}
            </h3>
          </div>
          <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <TrendingUp class="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs text-green-600">
          <TrendingUp class="mr-1 h-3 w-3" />
          {{ data.filter(t => t.type === 'credit').length }} транзакций
        </div>
      </div>

      <!-- Расходы -->
      <div class="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Расходы</p>
            <h3 class="text-2xl font-bold text-red-600 mt-2">
              {{ formatCurrency(totalExpense) }}
            </h3>
          </div>
          <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <TrendingDown class="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs text-red-600">
          <TrendingDown class="mr-1 h-3 w-3" />
          {{ data.filter(t => t.type === 'debit').length }} транзакций
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="rounded-lg border bg-card p-4 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="flex items-center gap-2">
          <Filter class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium">Фильтры:</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <!-- Период -->
          <div class="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              :class="selectedPeriod === 'week' ? 'bg-primary text-primary-foreground' : ''"
              @click="selectedPeriod = 'week'"
            >
              Неделя
            </Button>
            <Button
              variant="outline"
              size="sm"
              :class="selectedPeriod === 'month' ? 'bg-primary text-primary-foreground' : ''"
              @click="selectedPeriod = 'month'"
            >
              Месяц
            </Button>
            <Button
              variant="outline"
              size="sm"
              :class="selectedPeriod === 'year' ? 'bg-primary text-primary-foreground' : ''"
              @click="selectedPeriod = 'year'"
            >
              Год
            </Button>
          </div>

          <!-- Категории -->
          <select
            v-model="selectedCategory"
            class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Все категории</option>
            <option v-for="category in categories.slice(1)" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Таблица транзакций -->
    <div class="rounded-lg border bg-card shadow-sm">
      <TransactionsTableWidget :columns="columns" :data="filteredData" />
    </div>
  </div>
</template>
