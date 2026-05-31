/**
 * Expo Push Notification Service
 * Gửi push notification qua Expo Push API (miễn phí, không cần Firebase SDK).
 * Tài liệu: https://docs.expo.dev/push-notifications/sending-notifications/
 */

interface ExpoPushMessage {
  to: string;           // Expo push token: ExponentPushToken[xxx]
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;   // Android notification channel
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Gửi push notification tới một hoặc nhiều thiết bị.
 * Expo tự lo việc gửi qua FCM (Android) và APNs (iOS).
 */
export async function sendExpoPushNotification(
  messages: ExpoPushMessage | ExpoPushMessage[],
): Promise<ExpoPushTicket[]> {
  const payload = Array.isArray(messages) ? messages : [messages];

  // Lọc bỏ token không hợp lệ
  const valid = payload.filter((m) => isValidExpoToken(m.to));
  if (valid.length === 0) return [];

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(valid),
    });

    if (!res.ok) {
      console.error('[Push] Expo API error:', res.status, await res.text());
      return [];
    }

    const json = (await res.json()) as { data: ExpoPushTicket[] };
    return json.data ?? [];
  } catch (err) {
    // Push không critical — không throw, chỉ log
    console.error('[Push] Failed to send:', err);
    return [];
  }
}

/**
 * Kiểm tra token có đúng định dạng Expo không.
 * Format: ExponentPushToken[xxxxxxxx] hoặc ExpoPushToken[xxxxxxxx]
 */
export function isValidExpoToken(token: string): boolean {
  return (
    token.startsWith('ExponentPushToken[') ||
    token.startsWith('ExpoPushToken[')
  );
}

/**
 * Helper: Gửi thông báo "Cây của bạn được cập nhật" đến user
 */
export async function notifyPlantUpdate(opts: {
  expoPushToken: string;
  plantCode: string;
  flowerName: string;
  status: string;
  note?: string;
  farmerName?: string;
}): Promise<void> {
  const statusLabel: Record<string, string> = {
    SEED: 'Hạt giống',
    SPROUT: 'Nảy mầm 🌱',
    GROWING: 'Đang lớn 🌿',
    BUDDING: 'Ra nụ 🌼',
    BLOOMING: 'Nở hoa 🌸',
    RESTING: 'Nghỉ ngơi 😴',
    NEEDS_CARE: 'Cần chăm sóc ⚠️',
    COMPLETED: 'Hoàn thành ✅',
  };

  await sendExpoPushNotification({
    to: opts.expoPushToken,
    title: `🌸 ${opts.flowerName} của bạn có cập nhật mới!`,
    body: opts.note
      ? `Trạng thái: ${statusLabel[opts.status] ?? opts.status} — "${opts.note}"`
      : `Trạng thái mới: ${statusLabel[opts.status] ?? opts.status}`,
    data: {
      type: 'plant_update',
      plantCode: opts.plantCode,
    },
    sound: 'default',
    channelId: 'garden-updates-v2',
    priority: 'high',
  });
}
