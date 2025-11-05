import fetch from "node-fetch";

const CF_BASE = "https://sandbox.cashfree.com/pg";
const CF_API_VERSION = "2025-01-01";
const CF_APP_ID = process.env.CASHFREE_APP_ID!;
const CF_SECRET = process.env.CASHFREE_SECRET!;

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { orderId, amount, customer } = body;

    if (!orderId || !amount || !customer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

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
  return_url: "https://gleeful-valkyrie-1d0e09.netlify.app/.netlify/functions/cashfree-return?order_id={order_id}",
  notify_url: "https://gleeful-valkyrie-1d0e09.netlify.app/.netlify/functions/cashfree-webhook"
}
    };

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

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error("Cashfree Error:", data);
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        order_id: data.order_id,
        payment_session_id: data.payment_session_id,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create Cashfree order" }),
    };
  }
};
