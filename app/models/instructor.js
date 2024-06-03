import { createClient } from "~/.server/supabase";

export async function getInstructors(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('instructors')
        .select('id, first_name, last_name, phone');

    if (error) {
        throw new Error(error);
    }

    return { data, headers };

}

export async function getInstructorById(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('instructors')
        .select('id, first_name, last_name, phone')
        .eq('id', Number(id));

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function createInstructor(request, firstName, lastName, phone) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('instructors')
        .insert([
            { first_name: firstName, last_name: lastName, phone }
        ])
        .select();

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function updateInstructor(request, id, firstName, lastName, phone) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('instructors')
        .update({ first_name: firstName, last_name: lastName, phone })
        .eq('id', (Number(id)))
        .select();

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function deleteInstructor(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { status, error } = await supabaseClient
        .from('instructors')
        .delete()
        .eq('id', Number(id));

    if (error) {
        throw new Error(error);
    }

    return { status, headers };
}