<template>
  <Card class="h-full min-h-[400px] lg:min-h-0 w-full flex flex-col shadow-lg">
    <CardHeader>
      <CardTitle>Карта транзакций</CardTitle>
      <CardDescription>Визуализация ваших расходов на карте</CardDescription>
    </CardHeader>
    <CardContent class="flex-grow p-0 relative">
      <div class="bg-slate-700 h-full w-full rounded-b-xl flex items-center justify-center text-slate-400">
        Яндекс API Map
      </div>
      <div class="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button variant="secondary" size="icon" class="h-10 w-10">
          <ZoomIn class="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" class="h-10 w-10">
          <ZoomOut class="h-5 w-5" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-vue-next';
</script>