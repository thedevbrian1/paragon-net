import { createClient } from "~/.server/supabase";

export async function getEnrolments(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('enrolments')
        .select('id,created_at,students(id,first_name, last_name, phone),course_id');

    if (error) {
        throw error;
    }

    return { data, headers };
}

export async function getPersonalEnrolments(request, studentId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('enrolments')
        .select('id,course_id')
        .eq('student_id', Number(studentId));

    if (error) {
        throw error;
    }

    return { data, headers };
}

export async function unenrolCourse(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { status, error } = await supabaseClient
        .from('enrolments')
        .delete()
        .eq('id', Number(id));

    if (error) {
        throw error;
    }

    return { status, headers };
}

export async function enrolCourse(request, studentId, courseId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('enrolments')
        .insert([
            { student_id: Number(studentId), course_id: courseId }
        ])
        .select();

    if (error) {
        throw error;
    }
    return { data, headers };
}