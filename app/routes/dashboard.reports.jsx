import { json } from '@remix-run/node';
import { createClient } from '~/.server/supabase';

export async function loader({ request }) {
	const { supabaseClient, headers } = createClient(request);
	const { data, error } = await supabaseClient
		.from('courses_instructors')
		.select('*');

	return { ok: true };
}

export default function Reports() {
	return <div>Reports</div>;
}
