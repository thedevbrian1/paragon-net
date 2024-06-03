import { Link, json, useLoaderData } from '@remix-run/react';
import { PlusIcon } from '~/components/Icon';
import { Table } from '~/components/Table';
import { TableData } from '~/components/TableData';
import { TableHead } from '~/components/TableHead';
import { getStudents } from '~/models/student';

export const meta = () => {
	return [{ title: 'Students | Paragon e-School' }];
};

export async function loader({ request }) {
	const { data, headers } = await getStudents(request);
	return data;
}
export default function AllStudents() {
	const students = useLoaderData();
	const tableHeaders = ['First name', 'Last name', 'Phone'];

	return (
		<div className="mt-8 lg:mt-12 max-w-5xl">
			<div className="flex flex-col md:flex-row gap-2 justify-between">
				<h2 className="font-semibold text-lg">All students</h2>
				<Link
					to="new"
					className="flex gap-2 bg-brand-orange rounded px-4 py-2 justify-center"
				>
					<PlusIcon /> Enrol student
				</Link>
			</div>
			{students.length === 0 ? (
				<div className="flex justify-center mt-12">
					<div>
						<img
							src="/clipboard.svg"
							alt="An illustration of an empty clipboard"
							className="w-20"
						/>
						<p className="mt-4">No students yet</p>
					</div>
				</div>
			) : (
				<div className="mt-8 w-full overflow-x-auto">
					<Table>
						<caption className="mb-2">
							Students ({students.length})
						</caption>
						<TableHead tableHeaders={tableHeaders} />
						<tbody>
							{students.map((student, index) => (
								<tr
									key={student.id}
									className={`${index % 2 === 0 ? '' : 'bg-gray-100'}`}
								>
									<TableData>
										<Link
											to={`${student.id}`}
											className="hover:underline"
											prefetch="intent"
										>
											{student.first_name}
										</Link>
									</TableData>
									<TableData>
										<Link
											to={`${student.id}`}
											className="hover:underline"
											prefetch="intent"
										>
											{student.last_name}
										</Link>
									</TableData>
									<TableData>{student.phone}</TableData>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			)}
		</div>
	);
}
