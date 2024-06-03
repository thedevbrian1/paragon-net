import { redirect } from "@remix-run/node";
import { createServerClient, parse, serialize } from "@supabase/ssr";

export function createClient(request) {
    const cookies = parse(request.headers.get('Cookie') ?? '');
    const headers = new Headers();

    const supabaseClient = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY, {
        cookies: {
            get(key) {
                return cookies[key]
            },
            set(key, value, options) {
                headers.append('Set-Cookie', serialize(key, value, options))
            },
            remove(key, options) {
                headers.append('Set-Cookie', serialize(key, '', options))
            },
        }
    });
    return { supabaseClient, headers };
}

export async function requireAdminUser(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data: { session } } = await supabaseClient.auth.getSession();

    const user = session?.user;
    // console.log({ user });

    if (user?.email === process.env.ADMIN_EMAIL || user?.email === process.env.ADMIN_EMAIL_2) {
        return { user, headers };
    }
    throw await logout(request);
}

export async function requireUser(request) {
    const { supabaseClient, headers } = createClient(request);

    const { data: { session } } = await supabaseClient.auth.getSession();

    const user = session?.user;

    if (user) {
        return { user, headers };
    }
    throw await logout(request);
}

export async function logout(request) {
    const { supabaseClient, headers } = createClient(request);

    await supabaseClient.auth.signOut();
    return redirect('/login', {
        headers
    });
}