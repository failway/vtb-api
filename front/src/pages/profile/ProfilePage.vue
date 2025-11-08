<!-- src/pages/profile/ui/ProfilePage.vue -->
<template>
  <div class="min-h-screen bg-background py-6">
    <div class="container mx-auto px-4">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Профиль пользователя</h1>
        <p class="text-muted-foreground mt-2">
          Управление вашими счетами и финансами
        </p>
      </div>

      <!-- Основная сетка -->
      <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Левая колонка -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Карусель счетов -->
          <AccountCarousel
            :accounts="accounts"
            :selected-account="selectedAccount"
            @account-change="handleAccountChange"
          />

          <!-- Рекламный блок -->
          <PromoCard />
        </div>

        <!-- Правая колонка -->
        <div class="lg:col-span-2 space-y-6">
          <!-- История транзакций -->
          <TransactionsHistory
            :transactions="currentTransactions"
            :loading="loadingTransactions"
          />

          <!-- Диаграммы аналитики -->
          <AnalyticsCharts
            :transactions="currentTransactions"
            :account="selectedAccount"
          />
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-else class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Загрузка данных профиля...</p>
      </div>

      <!-- Пустое состояние -->
      <div v-if="!isLoading && accounts.length === 0" class="text-center py-12">
        <Wallet class="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 class="text-lg font-medium mb-2">Нет подключенных счетов</h3>
        <p class="text-muted-foreground mb-6">Подключите банки для просмотра аналитики</p>
        <Button @click="$router.push('/')">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Перейти к подключению банков
        </Button>
      </div>

      <!-- Ошибка загрузки -->
      <Alert v-if="error" variant="destructive" class="mt-6">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/store/AccountStore'
import { useAuthStore } from '@/store/AuthStore'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Wallet, ArrowLeft } from 'lucide-vue-next'
import AccountCarousel from '@/widgets/profile/ui/AccountCarousel.vue'
import TransactionsHistory from '@/widgets/profile/ui/TransactionsHistory.vue'
import AnalyticsCharts from '@/widgets/profile/ui/AnalyticsCharts.vue'
import PromoCard from '@/widgets/promo/ui/PromoCards.vue'
import type { Account } from '@/entities/account/types'

const router = useRouter()
const accountStore = useAccountStore()
const authStore = useAuthStore()

const selectedAccount = ref<Account & { bank: string } | null>(null)
const loadingTransactions = ref(false)
const isLoading = ref(true)
const error = ref('')

// Все счета из всех банков
const accounts = computed(() => {
  const allAccounts: Array<Account & { bank: string }> = []
  Object.values(accountStore.banks).forEach(bank => {
    if (bank.status === 'connected' && bank.accounts.length > 0) {
      bank.accounts.forEach(account => {
        allAccounts.push({
          ...account,
          bank: bank.name
        })
      })
    }
  })
  return allAccounts
})

// Транзакции для выбранного счета
const currentTransactions = computed(() => {
  if (!selectedAccount.value) return []
  return accountStore.transactions
})

const handleAccountChange = async (account: Account & { bank: string }) => {
  selectedAccount.value = account
  loadingTransactions.value = true
  error.value = ''

  try {
    await accountStore.fetchTransactions(account.accountId, account.bank)
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки транзакций'
    console.error('Error loading transactions:', e)
  } finally {
    loadingTransactions.value = false
  }
}

// Загрузка начальных данных
const loadInitialData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Ждем инициализации аутентификации
    if (!authStore.isInitialized) {
      await authStore.initAuth()
    }

    // Если пользователь не авторизован, редиректим
    if (!authStore.isAuthenticated) {
      await router.push('/login')
      return
    }

    // Инициализируем accounts store если нужно
    if (!accountStore.isInitialized) {
      await accountStore.initializeAccounts()
    }

    // Если счета уже есть в store, используем их
    if (accounts.value.length > 0) {
      selectedAccount.value = accounts.value[0]
      await handleAccountChange(accounts.value[0])
    } else {
      // Если счетов нет, пробуем загрузить статусы банков
      await accountStore.fetchBankStatuses()

      // После загрузки статусов проверяем счета снова
      if (accounts.value.length > 0) {
        selectedAccount.value = accounts.value[0]
        await handleAccountChange(accounts.value[0])
      }
    }
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки данных профиля'
    console.error('Error loading profile data:', e)
  } finally {
    isLoading.value = false
  }
}

// Инициализация
onMounted(async () => {
  await loadInitialData()
})

// Следим за изменением банков и автоматически обновляем
watch(
  () => accountStore.banks,
  (newBanks) => {
    // Если данные загрузились и появились счета, выбираем первый
    if (!isLoading.value && accounts.value.length > 0 && !selectedAccount.value) {
      selectedAccount.value = accounts.value[0]
      handleAccountChange(accounts.value[0])
    }
  },
  { deep: true, immediate: true }
)

// Следим за изменением connected банков
watch(
  () => accountStore.connectedBanks,
  (newConnectedBanks) => {
    if (newConnectedBanks.length > 0 && accounts.value.length > 0 && !selectedAccount.value) {
      selectedAccount.value = accounts.value[0]
      handleAccountChange(accounts.value[0])
    }
  },
  { deep: true }
)
</script>
