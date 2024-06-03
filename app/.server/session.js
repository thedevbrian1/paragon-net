import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: 'nifty_session',
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: '/',
        sameSite: 'lax',
        secrets: [process.env.SESSION_SECRET],
        secure: true
    }
});

export async function getSession(request) {
    const cookie = request.headers.get('Cookie');
    return sessionStorage.getSession(cookie);
}

export function setSuccessMessage(session, message) {
    session.flash("toastMessage", { message, type: "success" });
}

export function setErrorMessage(session, message) {
    session.flash("toastMessage", { message, type: "error" });
}

