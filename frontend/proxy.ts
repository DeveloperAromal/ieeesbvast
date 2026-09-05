import { NextRequest, NextResponse } from "next/server";


export function proxy(request: NextRequest) {

    const token = request.cookies?.get("session_token")?.value
    const pathname = request.nextUrl.pathname

    if (pathname.startsWith("/events/dashboard") && !token) {
        return NextResponse.redirect(new URL("/events/login", request.url))
    }


    if ((pathname === "/events/login" || pathname === "/") && token) {
        return NextResponse.redirect(new URL("/events/dashboard", request.url));
    }

    return NextResponse.next()

}


export const config = {
    matcher: ["/events/dashboard/:path*", "/login/:path*", "/"]
}