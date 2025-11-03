<template>
  <div class="py-8">
    <div class="container max-w-4xl">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold mb-4">Welcome to VTB MapTrack</h1>
        <p class="text-lg text-muted-foreground">
          Track and manage your projects efficiently
        </p>
      </div>

      <Button>btn test</Button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Track Projects</h3>
          <p class="text-muted-foreground">Monitor your project progress in real-time</p>
        </div>
        <div class="border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Collaborate</h3>
          <p class="text-muted-foreground">Work together with your team seamlessly</p>
        </div>
        <div class="border rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Analytics</h3>
          <p class="text-muted-foreground">Get insights about your project metrics</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page component
import { Button } from '@/components/ui/button'
</script>
