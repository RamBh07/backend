import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { order_id, order_status } = req.query;

  // After Cashfree payment, redirect back into your app
  // This URL should deep link into your Expo app
  // e.g. myapp://payments/cashfree-return?order_id=...&status=...
  const deepLink = `shopymart://payments/cashfree-return?order_id=${order_id}&status=${order_status || "PENDING"}`;

  // Redirect to your app
  res.redirect(deepLink);
}
