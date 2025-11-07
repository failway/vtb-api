<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Мои счета
      </h1>
      <p class="text-muted-foreground mt-1">
        Обзор ваших счетов в подключенных банках.
      </p>
    </div>

    <Alert v-if="accountStore.error" variant="destructive">
      <AlertDescription>{{ accountStore.error }}</AlertDescription>
    </Alert>

    <AccountsWidget />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAccountStore } from '@/store/AccountStore'
import AccountsWidget from '@/widgets/accounts/ui/AccountsWidget.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'

const accountStore = useAccountStore()

onMounted(() => {
  console.log('[HomePage] Компонент смонтирован, запускаю загрузку счетов.')
  accountStore.fetchAllAccounts()
})
</script>
