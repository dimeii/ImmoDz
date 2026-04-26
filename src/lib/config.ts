export const LIMITS = {
  USER_MAX_LISTINGS: 3,
  USER_MAX_PHOTOS: 10,
  AGENCY_MAX_PHOTOS: parseInt(process.env.AGENCY_MAX_PHOTOS ?? "50"),
} as const;

export const RATE_LIMITS = {
  CONTACT_PER_HOUR: 3,
  UPLOAD_PER_HOUR: 20,
  THREAD_CREATE_PER_HOUR: 3,
  MESSAGE_SEND_PER_HOUR: 30,
} as const;

export const WILAYAS_COUNT = 58;
