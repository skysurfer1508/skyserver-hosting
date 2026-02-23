// Global constants for the application

export const DISCORD_INVITE_URL = 'https://discord.gg/4apa75XS9Q';

export const EXTERNAL_LINKS = {
  discord: DISCORD_INVITE_URL,
  gamePanel: 'https://panel.skyserver1508.org',
  donate: 'https://ko-fi.com/skyserver1508',
} as const;

export const STRIPE_PRICES = {
  ram: 'price_1Sz653GTSSIIOUojGFw4LyEm',
  cpu: 'price_1Sz65FGTSSIIOUoje6QD4l9Q',
  heavyDutyRam: 'price_1T46tGGTSSIIOUojXUjXTjjO',
  heavyDutyCpu: 'price_1T46tcGTSSIIOUojfL0vl3xf',
} as const;

export const STRIPE_COUPON_BULK = 'Njo6FIEr';
