import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

const ITEMS_PER_PAGE = 10

export async function POST(req: NextRequest) {
    const { userId } = await auth()
    console.log(userId, "POST todo")
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { todos: true }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 402 });
        }

        if (!user.isSubscribed && user.todos.length >= 3) {
            return NextResponse.json(
                { error: "Free users can only create up to 3 todos. Please subscribe for more." },
                { status: 403 }
            );
        }

        const { title } = await req.json()
        const newTodo = await prisma.todo.create({
            data: {
                title,
                userId
            }
        })
        return NextResponse.json(newTodo, { status: 200 })
    }
    catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
    const query = req.nextUrl.searchParams.get("query") || ""

    try {
        const todos = await prisma.todo.findMany({
            where: {
                userId,
                title: {
                    contains: query,
                    mode: "insensitive"
                },
            },
            skip: (page - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE
        })
    
        const totalItems = await prisma.todo.count({
            where: {
                userId,
                title: {
                    contains: query,
                    mode: "insensitive"
                }
            }
        })

        const totalPages = Math.ceil(totalItems / page)

        return NextResponse.json({
            todos,
            totalPages,
            currentPage: page
        }, { status: 200 })
    }
    catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}