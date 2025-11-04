<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header
      class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-16 items-center px-4">
        <AppLogo/>
        <nav class="ml-auto flex items-center space-x-1">
          <RouterLink
            to="/"
            class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            :class="$route.path === '/' ? 'bg-accent' : ''"
          >
            Главная
          </RouterLink>
          <RouterLink
            to="/transactions"
            class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            :class="$route.path === '/transactions' ? 'bg-accent' : ''"
          >
            Транзакции
          </RouterLink>
          <RouterLink
            to="/profile"
            class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            :class="$route.path === '/profile' ? 'bg-accent' : ''"
          >
            Профиль
          </RouterLink>
          <template v-if="authStore.isLoggedIn">
            <button @click="authStore.logout()" class="btn">Выйти</button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Вход
            </RouterLink>
            <RouterLink
              to="/register"
              class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Регистрация
            </RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container flex-1 py-6 px-4">
      <slot/>
    </main>

    <!-- Footer -->
    <footer class="border-t py-6 bg-muted/30">
      <div
        class="container flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4">
        <p class="text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} VTB MapTrack. Все права защищены.
        </p>
        <div class="flex gap-4 text-sm text-muted-foreground">
          <a href="#" class="hover:text-foreground transition-colors">О компании</a>
          <a href="#" class="hover:text-foreground transition-colors">Поддержка</a>
          <a href="#" class="hover:text-foreground transition-colors">Конфиденциальность</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router'
import AppLogo from "@/app/ui/AppLogo.vue";
import { useAuthStore } from '@/store/AuthStore.ts'

const $route = useRoute()
const authStore = useAuthStore()

</script>
