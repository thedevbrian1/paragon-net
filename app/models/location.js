import { createClient } from "~/.server/supabase";

export async function createLocation(request, subCountyId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('locations')
        .insert([
            { sub_county_id: Number(subCountyId) }
        ])
        .select();

    if (error) {
        throw error;
    }

    return { data, headers };
}

export async function updateLocation(request, locationId, subCountyId) {
    const { supabaseClient, headers } = createClient(request);
    const { status, error } = await supabaseClient
        .from('locations')
        .update({ sub_county_id: Number(subCountyId) })
        .eq('id', locationId)
        .select();

    if (error) {
        throw error;
    }

    return { status, headers };
}