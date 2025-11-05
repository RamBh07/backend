export const handler = async (event: any) => {
  const params = new URLSearchParams(event.queryStringParameters);
  const order_id = params.get("order_id");
  const order_status = params.get("order_status") || "PENDING";

  // Redirect user back into your Expo app
  const deepLink = `myapp://payments/cashfree-return?order_id=${order_id}&status=${order_status}`;
  return {
    statusCode: 302,
    headers: {
      Location: deepLink,
    },
  };
};
