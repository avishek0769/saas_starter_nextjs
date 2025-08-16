import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(["/admin/dashboard", "/dashboard"])

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth()

    if(!userId && isProtectedRoute(req)) {
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }
    if(userId) {
        const user = await (await clerkClient()).users.getUser(userId)
        const role = user.publicMetadata.role as string | undefined

        try {
            if(role == "admin" && req.nextUrl.pathname == "/dashboard"){
                return NextResponse.redirect(new URL("/admin/dashboard", req.url))
            }
            if((!role || role != "admin") && req.nextUrl.pathname == "/admin/dashboard"){
                return NextResponse.redirect(new URL("/dashboard", req.url))
            }
            if(!isProtectedRoute(req)){
                return NextResponse.redirect(
                    new URL(
                        role == "admin"? "/admin/dashboard" : "/dashboard",
                        req.url
                    )
                )
            }
        }
        catch (error: any) {
            console.error("Error fetching user data from Clerk:", error);
            return NextResponse.redirect(new URL("/error", req.url));
        }
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}