import axios, { type AxiosInstance } from 'axios';
import AuthApi from '@/api/AuthApi';
import router from '@/app/config/router';

const BASE_URL: string = "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// let isRefreshing = false;
// let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];
//
// /**
//  * Обрабатывает очередь запросов, которые не удалось выполнить из-за истекшего токена.
//  * После попытки обновления токена, эта функция либо отклоняет запросы (если обновление не удалось),
//  * либо разрешает их для повторного выполнения.
//  * @param {any | null} error - Ошибка, если обновление токена не удалось. Если null, запросы будут повторены.
//  * @param {string | null} token - Новый токен доступа (в данном контексте используется как флаг успеха).
//  * @returns {void}
//  */
// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };
//
// /**
//  * Перехватчик ответов Axios для автоматического обновления access-токена.
//  * Если API возвращает ошибку 401 (Unauthorized), перехватчик выполняет следующие действия:
//  * 1. Устанавливает флаг `isRefreshing`, чтобы предотвратить одновременные запросы на обновление токена.
//  * 2. Все новые запросы, получившие 401 во время обновления, добавляются в очередь `failedQueue`.
//  * 3. Выполняет запрос на `AuthApi.refreshToken()`.
//  * 4. В случае успеха:
//  *    - Повторяет исходный запрос, который вызвал ошибку 401.
//  *    - Выполняет все запросы из очереди `failedQueue`.
//  * 5. В случае неудачи:
//  *    - Отклоняет все запросы из очереди.
//  *    - Перенаправляет пользователя на страницу входа.
//  */
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     console.log(`[Interceptor] Ошибка запроса: ${error.response?.status} для ${originalRequest.url}`);
//
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise(function(resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         }).then(() => {
//           return api(originalRequest);
//         });
//       }
//
//       originalRequest._retry = true;
//       isRefreshing = true;
//
//       try {
//         console.log('[Interceptor] Попытка обновить токен...');
//         await AuthApi.refreshToken();
//         console.log('[Interceptor] Токен успешно обновлен.');
//         processQueue(null, 'new_token');
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error('[Interceptor] Не удалось обновить токен:', refreshError);
//         processQueue(refreshError, null);
//         // Вместо прямого сброса store, перенаправляем на логин,
//         // где router guard и AuthStore обработают выход.
//         await router.push('/login');
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
//
//     return Promise.reject(error);
//   }
// );

export default api;
