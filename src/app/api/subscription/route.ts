import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";


export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const subscriptionEnds = new Date()
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isSubscribed: true,
                subscriptionEnds
            }
        })
        return NextResponse.json({
            isSubscribed: true,
            subscriptionEnds
        }, { status: 200 })
    }
    catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                isSubscribed: true,
                subscriptionEnds: true
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        const now = new Date()
        if (user.isSubscribed && user.subscriptionEnds! < now) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isSubscribed: false,
                    subscriptionEnds: null
                }
            })
            return NextResponse.json({
                isSubscribed: false,
                subscriptionEnds: null
            }, { status: 200 })
        }

        return NextResponse.json({
            isSubscribed: user.isSubscribed,
            subscriptionEnds: user.subscriptionEnds
        }, { status: 200 })
    }
    catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}