/**
 * Вспомогательный модуль-обёртка для Umami Analytics.
 * Безопасно вызывает window.umami.track().
 * Если Umami заблокирован блокировщиком рекламы, скрипт ещё не загрузился
 * или код выполняется на сервере (SSR), все вызовы являются безопасным no-op
 * (без ошибок в консоли и в интерфейсе).
 */

declare global {
  interface Window {
    umami?: {
      track: {
        (eventName?: string, eventData?: Record<string, string | number | boolean>): void;
        (customFunction: (props: Record<string, unknown>) => Record<string, unknown>): void;
      };
    };
  }
}

export type AnalyticsEvent =
  | 'analysis_started'
  | 'analysis_completed'
  | 'login_google'
  | 'share_card'
  | 'example_opened';

export interface AnalyticsEventData {
  platform?: 'lichess' | 'chesscom';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Безопасная отправка событий в Umami Analytics.
 * Гарантирует отсутствие ошибок и исключений при недоступности window.umami.
 */
export function trackEvent(event: AnalyticsEvent | string, data?: AnalyticsEventData): void {
  if (typeof window === 'undefined') return;

  try {
    if (window.umami && typeof window.umami.track === 'function') {
      if (data) {
        // Передаем только допустимые параметры (например, platform), фильтруя undefined
        const cleanData: Record<string, string | number | boolean> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) {
            cleanData[key] = value;
          }
        }
        window.umami.track(event, cleanData);
      } else {
        window.umami.track(event);
      }
    }
  } catch {
    // Безопасный no-op: предотвращаем любые сбои в UI или консоли
  }
}

let lastGoogleLoginTime = 0;

export const analytics = {
  /**
   * Нажата кнопка "Анализировать"
   * Допустимо передавать только платформу ('lichess' | 'chesscom')
   */
  analysisStarted: (platform?: 'lichess' | 'chesscom') => {
    trackEvent('analysis_started', platform ? { platform } : undefined);
  },

  /**
   * Разбор партии успешно завершён
   * Допустимо передавать только платформу ('lichess' | 'chesscom')
   */
  analysisCompleted: (platform?: 'lichess' | 'chesscom') => {
    trackEvent('analysis_completed', platform ? { platform } : undefined);
  },

  /**
   * Успешный вход через Google (дедупликация в пределах 10 сек)
   */
  loginGoogle: () => {
    const now = Date.now();
    if (now - lastGoogleLoginTime < 10000) return;
    lastGoogleLoginTime = now;
    trackEvent('login_google');
  },

  /**
   * Нажата кнопка "Поделиться"
   */
  shareCard: () => {
    trackEvent('share_card');
  },

  /**
   * Открыт пример разбора
   */
  exampleOpened: () => {
    trackEvent('example_opened');
  },
};
