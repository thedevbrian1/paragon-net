import { createClient } from "~/.server/supabase";
import { createLocation } from "./location";

export async function createInstitution(request, name, subCountyId) {
    const { supabaseClient, headers } = createClient(request);

    const { data: institution } = await getInstitutionByName(request, name);

    if (institution.length > 0) {
        throw new Response('Institution is already enrolled', { status: 400 });
    }

    const { data: location, headers: locationHeaders } = await createLocation(request, subCountyId);
    const locationId = location[0].id;

    const { data, error } = await supabaseClient
        .from('institutions')
        .insert([
            { title: name, location_id: Number(locationId) }
        ])
        .select();

    if (error) {
        throw new Error(error);
    }

    let allHeaders = {
        ...Object.fromEntries(headers.entries()),
        ...Object.fromEntries(locationHeaders.entries())
    };

    return { data, headers: allHeaders };
}

export async function getInstitutions(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('institutions')
        .select('id,title,locations(subcounties(title,counties(title)))');

    if (error) {
        throw error;
    }

    return { data, headers };
}

export async function getInstitutionById(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('institutions')
        .select('title, locations(subcounties(title, counties(title, countries(title))))')
        .eq('id', Number(id));

    if (error) {
        throw error;
    }

    return { data, headers };
}

export async function getInstitutionByName(request, name) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('institutions')
        .select('title')
        .eq('title', name);

    if (error) {
        throw error;
    }

    return { data, headers };
}

export async function updateInstitution(request, institutionId, name) {
    const { supabaseClient, headers } = createClient(request);
    const { status, error } = await supabaseClient
        .from('institutions')
        .update({ title: name })
        .eq('id', institutionId)
    // .select();

    if (error) {
        throw error;
    }

    return { status, headers };
}