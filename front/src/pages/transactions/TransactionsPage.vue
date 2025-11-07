<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountStore } from '@/store/AccountStore'
import TransactionsTableWidget from '@/widgets/transactions-table/ui/TransactionsTableWidget.vue'
import { columns } from '@/widgets/transactions-table/model/columns'
import type { BankName } from '@/entities/account/types'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, Wallet, Download } from 'lucide-vue-next'

const route = useRoute()
const accountStore = useAccountStore()

const accountId = ref(route.query.accountId as string || '')
const bank = ref(route.query.bank as BankName || '')


const transactions = computed(() => accountStore.transactions)

const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.creditDebitIndicator === 'Credit')
    .reduce((sum, t) => sum + parseFloat(t.amount.amount), 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.creditDebitIndicator === 'Debit')
    .reduce((sum, t) => sum + parseFloat(t.amount.amount), 0)
})

const balance = computed(() => totalIncome.value - totalExpense.value)

const formatCurrency = (amount: number, currency: string = 'RUB') => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(amount)
}

const tableData = computed(() => {
  return transactions.value.map(t => ({
      id: t.transactionId,
      date: t.bookingDateTime,
      description: t.transactionInformation,
      amount: parseFloat(t.amount.amount),
      currency: t.amount.currency as 'RUB' | 'USD' | 'EUR',
      type: t.creditDebitIndicator === 'Credit' ? 'credit' : 'debit',
      // Категоризация требует отдельной логики, пока используем заглушку
      category: t.creditDebitIndicator === 'Credit' ? 'Поступление' : 'Списание',
  }))
})

const fetch_transactions = () => {
  if (accountId.value && bank.value) {
    accountStore.fetchTransactions(accountId.value, bank.value)
  }
}

onMounted(fetch_transactions)
watch(() => route.query, (newQuery) => {
  accountId.value = newQuery.accountId as string || ''
  bank.value = newQuery.bank as BankName || ''
  fetch_transactions()
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
          Счет: <span class="font-medium">{{ accountId }}</span> | Банк: <span class="font-medium uppercase">{{ bank }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="exportToPDF">
          <Download class="mr-2 h-4 w-4" />
          Экспорт в PDF
        </Button>
      </div>
    </div>

    <Alert v-if="accountStore.error" variant="destructive">
      <AlertDescription>{{ accountStore.error }}</AlertDescription>
    </Alert>

    <!-- Карточки статистики -->
    <div v-if="!accountStore.isLoadingTransactions && transactions.length > 0" class="grid gap-4 md:grid-cols-3">
      <div class="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Сальдо за период</p>
            <h3 class="text-2xl font-bold mt-2" :class="balance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(balance) }}
            </h3>
          </div>
          <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet class="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
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
      </div>
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
      </div>
    </div>

    <!-- Таблица транзакций -->
    <div class="rounded-lg border bg-card shadow-sm">
        <div v-if="accountStore.isLoadingTransactions" class="text-center py-20 text-muted-foreground">
            Загрузка транзакций...
        </div>
         <div v-else-if="!accountId || !bank" class="text-center py-20 text-muted-foreground">
            <p>Выберите счет для просмотра транзакций.</p>
        </div>
        <TransactionsTableWidget v-else :columns="columns" :data="tableData" />
    </div>
  </div>
</template>
