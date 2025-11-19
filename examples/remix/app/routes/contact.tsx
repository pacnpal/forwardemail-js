import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { ForwardEmail } from "forwardemail-js";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const client = new ForwardEmail({
    apiKey: process.env.FORWARD_EMAIL_API_KEY!,
  });

  try {
    const result = await client.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text: message,
    });

    return json({ success: true, id: result.id });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      <input name="to" type="email" placeholder="To" required />
      <input name="subject" placeholder="Subject" required />
      <textarea name="message" placeholder="Message" required />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Email"}
      </button>

      {actionData?.success && <p>Email sent! ID: {actionData.id}</p>}
      {actionData?.error && <p style={{ color: "red" }}>Error: {actionData.error}</p>}
    </Form>
  );
}
