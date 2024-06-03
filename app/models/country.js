import { createClient } from "~/.server/supabase";

export async function getCountries(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('countries')
        .select('id,title');

    if (error) {
        throw error;
    }

    return { data, headers };
}