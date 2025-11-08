<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <header
      class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="container flex h-16 items-center px-4">
        <!-- Левая сторона: Название (для десктопа) / Бургер (для мобильных) -->
        <div class="flex items-center">
          <h1 class="text-xl font-bold hidden lg:block">MapTrack</h1>
          <Button variant="ghost" size="icon" class="lg:hidden">
            <Menu class="h-6 w-6" />
            <span class="sr-only">Открыть меню</span>
          </Button>
        </div>

        <!-- Центрированный заголовок для мобильных -->
        <div class="flex-1 flex justify-center lg:hidden">
          <h1 class="text-xl font-bold">MapTrack</h1>
        </div>

        <!-- Правая сторона: Навигация и иконки -->
        <div class="flex items-center ml-auto space-x-2">
          <!-- Навигация для десктопа -->
          <nav class="hidden lg:flex items-center space-x-1 mr-4">
            <RouterLink
              to="/"
              class="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              :class="{ 'bg-accent': $route.path === '/' }"
            >
              Главная
            </RouterLink>
            <RouterLink
              v-if="authStore.isLoggedIn"
              to="/profile"
              class="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              :class="{ 'bg-accent': $route.path === '/profile' }"
            >
              Профиль
            </RouterLink>
          </nav>

          <!-- Иконки и аутентификация -->
          <Button variant="ghost" size="icon">
            <Bell class="h-6 w-6" />
            <span class="sr-only">Уведомления</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Sun class="h-6 w-6" />
            <span class="sr-only">Переключить тему</span>
          </Button>

          <template v-if="authStore.isLoggedIn">
            <Button @click="handleLogout" variant="outline" size="sm">Выйти</Button>
          </template>
          <template v-else>
            <div class="hidden lg:flex items-center gap-2">
              <RouterLink to="/login">
                <Button variant="ghost" size="sm">Вход</Button>
              </RouterLink>
              <RouterLink to="/register">
                <Button size="sm">Регистрация</Button>
              </RouterLink>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container flex-1 py-6 px-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/AuthStore'
import { Button } from '@/components/ui/button'
import { Menu, Bell, Sun } from 'lucide-vue-next'

const $route = useRoute()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>
