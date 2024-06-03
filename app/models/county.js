import { createClient } from "~/.server/supabase";

export async function createCounties(request, counties) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('counties')
        .insert(counties)
        .select();

    if (error) {
        throw new Error(error);
    }

    return { data, headers };

}

export async function createSubCounties(request, subcounties) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('subcounties')
        .insert(subcounties)
        .select();

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function getCounties(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('counties')
        .select('id, title, country_id');

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function attachCounties(request, countryId, id) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('counties')
        .update({ country_id: Number(countryId) })
        .eq('id', id)
        .select();

    if (error) {
        throw error
    }
    return { data, headers };
}