import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;
    const signatureHeader = req.headers["x-webhook-signature"] as string | undefined;

    // Verify signature if set
    if (secret && signatureHeader) {
      const computed = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("base64");

      if (computed !== signatureHeader) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    console.log("✅ Webhook received from Cashfree:", JSON.stringify(req.body, null, 2));

    // TODO: Update your database order status here
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
