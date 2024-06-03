import { createClient } from "~/.server/supabase";

export async function getSubCounties(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('subcounties')
        .select('id, title, county_id');

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function getSubCountyByTitle(request, title) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('subcounties')
        .select('id, title, county_id')
        .eq('title', title);

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}