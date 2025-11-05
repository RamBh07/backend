import crypto from "crypto";

export const handler = async (event: any) => {
  try {
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;
    const signatureHeader = event.headers["x-webhook-signature"];
    const body = event.body;

    if (secret && signatureHeader) {
      const computedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("base64");

      if (computedSignature !== signatureHeader) {
        return { statusCode: 401, body: "Invalid signature" };
      }
    }

    console.log("✅ Cashfree Webhook received:", body);
    return { statusCode: 200, body: "Webhook received" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error processing webhook" };
  }
};
