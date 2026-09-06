import { NextResponse } from "next/server";

export function proxy() {
    return NextResponse.next();
}

export const config = {
    matcher: ["/events/dashboard/:path*", "/events/login", "/"],
};