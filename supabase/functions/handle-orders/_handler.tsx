
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";
import { NewOrderEmail } from "./_templates/NewOrderEmail.tsx";
import { UpdatedOrderEmail } from "./_templates/UpdatedOrderEmail.tsx";
import { DeletedOrderEmail } from "./_templates/DeletedOrderEmail.tsx";
import * as React from "react";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUPPLIER_EMAIL = Deno.env.get("SUPPLIER_EMAIL") || "no-reply@example.com";

export const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    const { type, record, old_record } = payload;

    console.log(`Received webhook: ${type}`);

    let emailSubject = "";
    let emailComponent;

    // Base URL for links - allowing override via env var, defaulting to local/prod assumption
    const BASE_URL = Deno.env.get("APP_BASE_URL") || "http://localhost:3000";

    switch (type) {
      case "INSERT": {
        const { cl_name, id, product_type_id } = record;
        // Assuming we can map product_type_id to a name or just show ID for now, 
        // or fetch it. For simplicity/speed, we'll use "Type " + ID if name unavailable in record.
        // If the record has product_type_name joined, great, but webhooks usually just have the table row.
        // We'll just genericize or assume cl_name is there.
        // Requirement: "Save order" brings order to production line, but doesn't send a notification to supplier
        console.log("New order created, skipping email notification as per requirements.");
        emailComponent = null;
        break;
      }
      case "UPDATE": {
        console.log("Order updated. Email notifications are now handled manually via the server action.");
        emailComponent = null;
        break;
      }
      case "DELETE": {
        const { cl_name, id } = old_record; // use old_record for DELETE
        emailSubject = `Order Removed for ${cl_name}`;
        emailComponent = (
          <DeletedOrderEmail
            clientName={cl_name || "Unknown Client"}
            orderId={id}
          />
        );
        break;
      }
      default:
        return new Response("Event type not handled", { status: 200 });
    }

    if (emailComponent) {
      const data = await resend.emails.send({
        from: "Murmur Order System <onboarding@resend.dev>",
        to: [SUPPLIER_EMAIL],
        subject: emailSubject,
        react: emailComponent,
      });

      console.log("Email sent:", data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "No email sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error handling webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

