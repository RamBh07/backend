import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

const CF_BASE = "https://sandbox.cashfree.com/pg";
const CF_API_VERSION = "2025-01-01";

const CF_APP_ID = process.env.CASHFREE_APP_ID!;
const CF_SECRET = process.env.CASHFREE_SECRET!;

// Define types for the expected responses
interface CashfreeOrderResponse {
  order_id: string;
  payment_session_id: string;
  [key: string]: any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, amount, customer } = req.body as {
      orderId: string;
      amount: number;
      customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
    };

    if (!orderId || !amount || !customer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the payload for Cashfree
    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
      order_meta: {
        return_url: "https://shopymart-backend.vercel.app/api/cashfree-return?order_id={order_id}",
        notify_url: "https://shopymart-backend.vercel.app/api/cashfree-webhook",
      },
    };

    // Call Cashfree API
    const response = await fetch(`${CF_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CF_APP_ID,
        "x-client-secret": CF_SECRET,
        "x-api-version": CF_API_VERSION,
      },
      body: JSON.stringify(payload),
    });

    // ✅ FIXED: assert the type explicitly
    const data = (await response.json()) as Partial<CashfreeOrderResponse>;

    if (!response.ok) {
      console.error("Cashfree API error:", data);
      return res.status(response.status).json(data);
    }

    if (!data.order_id || !data.payment_session_id) {
      return res.status(500).json({ error: "Invalid Cashfree API response" });
    }

    // Return the important data to the app
    return res.status(200).json({
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ error: "Failed to create Cashfree order" });
  }
}
