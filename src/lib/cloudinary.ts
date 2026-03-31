import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function generateSignature(paramsToSign: Record<string, string>) {
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );
  return signature;
}

export const CLOUDINARY_TRANSFORMS = {
  full: "f_auto,q_auto,w_1200,c_limit",
  thumbnail: "f_auto,q_auto,w_400,h_300,c_fill,g_auto",
} as const;

export default cloudinary;
