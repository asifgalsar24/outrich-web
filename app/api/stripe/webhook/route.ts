import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "placeholder");

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    if (userId) {
      await supabaseAdmin.from("profiles").upsert({
        user_id: userId,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        subscription_status: "active",
      });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object;
    const status =
      sub.status === "active" ? "active"
      : sub.status === "trialing" ? "trialing"
      : "canceled";
    await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: status })
      .eq("stripe_customer_id", typeof sub.customer === "string" ? sub.customer : "");
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "canceled" })
      .eq("stripe_customer_id", typeof sub.customer === "string" ? sub.customer : "");
  }

  return NextResponse.json({ received: true });
}
