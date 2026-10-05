import vkBridge, { UserInfo } from '@vkontakte/vk-bridge';

export interface VKLaunchParams {
  vk_user_id?: number;
  vk_app_id?: number;
  vk_is_app_user?: number;
  vk_are_notifications_enabled?: number;
  vk_language?: string;
  vk_ref?: string;
  sign?: string;
  [key: string]: unknown;
}

let isInitialized = false;

export async function initVKBridge(): Promise<boolean> {
  if (isInitialized) return true;
  try {
    const data = await vkBridge.send('VKWebAppInit');
    isInitialized = true;
    return !!data?.result;
  } catch (err) {
    // Graceful fallback if opened outside VK iframe / mobile app
    isInitialized = true;
    return false;
  }
}

export function parseVKLaunchParams(): VKLaunchParams | null {
  const search = window.location.search;
  if (!search) return null;
  const params = new URLSearchParams(search);
  const result: VKLaunchParams = {};
  let count = 0;
  params.forEach((value, key) => {
    if (key.startsWith('vk_') || key === 'sign') {
      count++;
      if (key === 'vk_user_id' || key === 'vk_app_id' || key === 'vk_is_app_user') {
        result[key] = parseInt(value, 10);
      } else {
        result[key] = value;
      }
    }
  });
  return count > 0 ? result : null;
}

export async function getVKUserInfo(): Promise<UserInfo | null> {
  try {
    const user = await vkBridge.send('VKWebAppGetUserInfo');
    return user;
  } catch {
    return null;
  }
}

export function isInsideVK(): boolean {
  if (typeof window === 'undefined') return false;
  const hasParams = !!parseVKLaunchParams();
  const isIframe = window.self !== window.top;
  return hasParams || isIframe;
}
