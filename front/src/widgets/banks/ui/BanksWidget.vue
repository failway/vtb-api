<template>
  <div class="space-y-6">
    <!-- Виджет общего баланса -->
    <Card class="bg-slate-900 text-primary-foreground border-slate-700 shadow-lg">
      <CardHeader>
        <CardTitle class="text-lg font-medium">Мой Баланс</CardTitle>
      </CardHeader>
      <CardContent class="text-center pb-4">
        <div v-if="isLoading" class="h-16 flex items-center justify-center">
          <p>Загрузка...</p>
        </div>
        <div v-else-if="totalBalance > 0" class="h-16 flex flex-col justify-center">
          <p class="text-4xl font-bold tracking-tight">
            {{ formatCurrency(totalBalance, 'RUB') }}
          </p>
        </div>
        <div v-else class="h-16 flex items-center justify-center">
          <p class="text-muted-foreground text-slate-400">Нет подключенных счетов</p>
        </div>
      </CardContent>
    </Card>

    <!-- Список банков и счетов -->
    <div v-if="isLoading && banksArray.length === 0" class="text-center text-muted-foreground py-10">
      <p>Загрузка информации о банках...</p>
    </div>

    <div v-for="bank in banksArray" :key="bank.name" class="space-y-4">
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img :src="`/banks/${bank.name}.svg`" :alt="bank.name" class="h-8 w-8 rounded-full border p-1" />
              <CardTitle class="capitalize">{{ bank.name.replace('bank', ' Bank') }}</CardTitle>
            </div>
            <div v-if="bank.status === 'connected'" class="flex items-center gap-2 text-sm text-green-600">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Подключен
            </div>
            <div v-else-if="bank.status === 'disconnected'" class="flex items-center gap-2 text-sm text-red-600">
              <span class="relative flex h-2 w-2 rounded-full bg-red-500"></span>
              Не подключен
            </div>
          </div>
        </CardHeader>

        <CardContent v-if="bank.status === 'connected'">
          <div v-if="bank.isLoadingAccounts" class="text-center py-4 text-muted-foreground">
            <p>Загрузка счетов...</p>
          </div>
          <div v-else-if="bank.accounts.length > 0" class="space-y-3">
            <div
              v-for="account in bank.accounts"
              :key="account.accountId"
              class="border p-3 rounded-md hover:bg-muted/50 transition-colors flex justify-between items-center"
            >
              <div>
                <p class="font-semibold">{{ account.nickname }}</p>
                <p class="text-sm text-muted-foreground">{{ account.accountId }}</p>
              </div>
              <div class="flex items-center gap-4">
                <p v-if="account.balance && account.balance.amount" class="font-bold text-lg">
                  {{ formatCurrency(account.balance.amount.amount, account.balance.amount.currency) }}
                </p>
                <RouterLink :to="`/transactions?accountId=${account.accountId}&bank=${bank.name}`">
                  <Button variant="ghost" size="icon">
                    <History class="h-5 w-5" />
                  </Button>
                </RouterLink>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted-foreground">
            <p>Счета не найдены.</p>
          </div>
        </CardContent>

        <CardContent v-else-if="bank.status === 'disconnected'">
          <div class="text-center py-4">
            <p class="text-muted-foreground mb-4">Для доступа к счетам необходимо подключить банк.</p>
            <Button @click="handleConnect(bank.name)" :disabled="isConnecting(bank.name)">
              <template v-if="isConnecting(bank.name)">Подключение...</template>
              <template v-else>Подключить {{ bank.name.replace('bank', ' Bank') }}</template>
            </Button>
          </div>
        </CardContent>

      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAccountStore } from '@/store/AccountStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BankName } from '@/entities/account/types';
import { History } from 'lucide-vue-next';

const accountStore = useAccountStore();

const banksArray = computed(() => Object.values(accountStore.banks));
const isLoading = computed(() => accountStore.isLoadingStatuses || banksArray.value.some(b => b.isLoadingAccounts));

const totalBalance = computed(() => {
  return banksArray.value.reduce((total, bank) => {
    return total + bank.accounts.reduce((bankTotal, account) => {
      if (account.balance && account.balance.amount && account.balance.amount.currency === 'RUB') {
        return bankTotal + Number(account.balance.amount.amount);
      }
      return bankTotal;
    }, 0);
  }, 0);
});

const isConnecting = (bankName: BankName) => accountStore.connectingBank === bankName;

const handleConnect = async (bankName: BankName) => {
  await accountStore.connectBank(bankName);
};

const formatCurrency = (amount: string | number, currency: string) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return '--';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(numericAmount);
};
</script>
