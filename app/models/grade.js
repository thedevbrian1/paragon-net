import { createClient } from "~/.server/supabase";

export async function getGrades(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('grades')
        .select('id,title');

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function getGradeByTitle(request, title) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('grades')
        .select('id')
        .eq('title', title);

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}