import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers"
import { Webhook } from "svix"
import prisma from "@/../lib/prisma";


export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        return new Response("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local", {
            status: 400
        });
    }

    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_signature || !svix_timestamp) {
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        });
    }

    const payload = await req.text()
    console.log("Payload --> ", payload)
    const wh = new Webhook(WEBHOOK_SECRET)
    let event: WebhookEvent;

    try {
        event = await wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }) as WebhookEvent
        console.log("Event --> ", event)
    }
    catch (error: any) {
        console.error("Error verifying webhook:", error);
        return new Response("Verification failed", {
            status: 400,
        });
    }

    const eventType = event.type

    if (eventType == "user.created") {
        try {
            const { email_addresses, primary_email_address_id } = event.data
            const emailAddress = email_addresses.find(email => primary_email_address_id == email.id)

            if (!emailAddress) {
                return new Response("No primary email address", {
                    status: 400,
                });
            }

            const newUser = await prisma.user.create({
                data: {
                    id: event.data.id,
                    email: emailAddress.email_address,
                    isSubscribed: false,
                    subscriptionEnds: null,
                }
            })
            console.log("New user --> ", newUser)
        }
        catch (error: any) {
            console.error("Error creating user in database:", error);
            return new Response("Error creating user", { status: 500 });
        }
    }
    
    return new Response("Webhook received successfully", { status: 200 });
}

