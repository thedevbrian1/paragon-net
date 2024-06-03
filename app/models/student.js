import { createClient } from "~/.server/supabase";
import { createLocation } from "./location";

export async function getStudents(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('students')
        .select('id,first_name,last_name,phone');

    if (error) {
        throw new Error(error);
    }
    return { data, headers };
}

export async function getStudentById(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('students')
        .select('id,first_name,last_name,phone,location_id,locations(subcounties(title, counties(title))))')
        .eq('id', Number(id));

    if (error) {
        throw new Error(error);
    }

    return { data, headers };
}

export async function getUUID(request) {
    let { supabaseClient, headers } = createClient(request);
    let { data: { user } } = await supabaseClient.auth.getUser();

    let uuid = user.id;

    return { uuid, headers };
}

export async function getStudentByUUID(request) {
    let { supabaseClient, headers } = createClient(request);
    let { uuid } = await getUUID(request);

    let { data, error } = await supabaseClient
        .from('students')
        .select('id')
        .eq('user_id', uuid);

    if (error) {
        throw error;
    }

    return { data, headers };
}


export async function createStudent(request, userId, firstName, lastName, phone, gradeId, subCountyId, learningVenueId) {
    const { supabaseClient, headers } = createClient(request);

    const { data: location, headers: locationHeaders } = await createLocation(request, subCountyId);
    const locationId = location[0].id;

    const { data, error } = await supabaseClient
        .from('students')
        .insert([
            {
                first_name: firstName.toLowerCase(),
                last_name: lastName.toLowerCase(),
                phone,
                user_id: userId,
                grade_id: Number(gradeId),
                location_id: Number(locationId),
                learning_venue_id: Number(learningVenueId)
            }
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

export async function updateStudent(request, id, updateObj) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('students')
        .update(updateObj)
        .eq('id', Number(id))
        .select();

    if (error) {
        throw new Error(error);
    }
    return { data, headers };
}

export async function deleteStudent(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { status, error } = await supabaseClient
        .from('students')
        .delete()
        .eq('id', Number(id));

    if (error) {
        throw new Error(error);
    }

    return { status, headers };
}

export async function getStudentsAndLocation(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('students')
        .select('id, institution_id, locations(subcounties(title, counties(title, countries(title))))');

    if (error) {
        throw error;
    }

    return { data, headers };
}