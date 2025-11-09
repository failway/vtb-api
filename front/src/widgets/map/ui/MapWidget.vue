<template>
  <Card class="h-full min-h-[400px] lg:min-h-0 w-full flex flex-col shadow-lg">
    <CardHeader>
      <CardTitle>Карта транзакций</CardTitle>
      <CardDescription>Визуализация ваших расходов на карте</CardDescription>
    </CardHeader>
    <CardContent class="flex-grow p-0 relative">
      <div v-if="loading" class="flex items-center justify-center h-full text-muted-foreground">
        Загрузка транзакций на карте...
      </div>
      <div v-else-if="transactionsWithCoords.length === 0" class="flex items-center justify-center h-full text-muted-foreground">
        Нет данных о местоположении транзакций
      </div>
      <l-map
        v-else
        v-model:zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        class="rounded-b-xl"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
        />
        <l-marker
          v-for="transaction in transactionsWithCoords"
          :key="transaction.transactionId"
          :lat-lng="[transaction.merchant!.lat!, transaction.merchant!.lng!]"
        >
          <l-tooltip>
            <div class="text-sm">
              <p class="font-bold">{{ transaction.merchant?.name }}</p>
              <p>Сумма: {{ transaction.amount.amount }} {{ transaction.amount.currency }}</p>
            </div>
          </l-tooltip>
        </l-marker>
      </l-map>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { LMap, LTileLayer, LMarker, LTooltip } from "@vue-leaflet/vue-leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/entities/transaction/types';

const props = defineProps<{
  transactions: Transaction[],
  loading: boolean
}>();

const zoom = ref(10);
const center = ref<[number, number]>([55.751244, 37.618423]); // Центр Москвы по умолчанию

const transactionsWithCoords = computed(() => {
  return props.transactions.filter(
    (t): t is Transaction & { merchant: { lat: number, lng: number } } =>
      t.merchant !== null &&
      typeof t.merchant.lat === 'number' &&
      typeof t.merchant.lng === 'number'
  );
});
</script>
