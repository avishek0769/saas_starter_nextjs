import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/../lib/prisma";

type ParamsType = {
    params: Promise<{id: string}>
}

export async function PUT(req: NextRequest, context: ParamsType) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todoId = (await context.params).id;
    if (!todoId) {
        return NextResponse.json({ error: "Todo id is not present" }, { status: 401 });
    }

    try {
        const { completed } = await req.json()

        const updatedTodo = await prisma.todo.update({
            where: {
                id: todoId,
                userId
            },
            data: { completed }
        })
        if (!updatedTodo) {
            return NextResponse.json({ error: "Todo id is wrong" }, { status: 401 });
        }
        return NextResponse.json(updatedTodo, { status: 200 })
    }
    catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, context: ParamsType) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todoId = (await context.params).id
    if (!todoId) {
        return NextResponse.json({ error: "Todo id is not present" }, { status: 401 });
    }

    try {
        await prisma.todo.delete({
            where: {
                id: todoId,
                userId
            }
        })
        return NextResponse.json({ message: "Todo deleted" }, { status: 200 })
    }
    catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}