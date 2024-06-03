import { Link, json, useLoaderData } from '@remix-run/react';
import { PlusIcon } from '~/components/Icon';
import { Table } from '~/components/Table';
import { TableData } from '~/components/TableData';
import { TableHead } from '~/components/TableHead';
import { getInstructors } from '~/models/instructor';

export const meta = () => {
	return [{ title: 'Instructors | Paragon e-School' }];
};

export async function loader({ request }) {
	const { data, headers } = await getInstructors(request);

	for (let [key, value] of headers.entries()) {
		response.headers.append(key, value);
	}

	return data;
}

export default function Instructors() {
	const instructors = useLoaderData();
	const tableHeaders = ['First name', 'Last name', 'Phone'];

	return (
		<div className="mt-8 lg:mt-12 max-w-5xl">
			<div className="flex flex-col md:flex-row gap-2 justify-between">
				<h2 className="font-semibold text-lg">Instructors</h2>
				<Link
					to="new"
					className="flex gap-2 bg-brand-orange rounded px-4 py-2 justify-center"
				>
					<PlusIcon /> Add instructor
				</Link>
			</div>
			{instructors.length === 0 ? (
				<div className="flex justify-center mt-12">
					<div>
						<img
							src="/clipboard.svg"
							alt="An illustration of an empty clipboard"
							className="w-20"
						/>
						<p className="mt-4">No instructors yet</p>
					</div>
				</div>
			) : (
				<div className="mt-8 w-full overflow-x-auto">
					<Table>
						<caption className="mb-2">
							Instructors ({instructors.length})
						</caption>
						<TableHead tableHeaders={tableHeaders} />
						<tbody>
							{instructors.map((instructor, index) => (
								<tr
									key={instructor.id}
									className={`${index % 2 === 0 ? '' : 'bg-gray-100'}`}
								>
									<TableData>
										<Link
											to={`${instructor.id}`}
											className="hover:underline"
											prefetch="intent"
										>
											{instructor.first_name}
										</Link>
									</TableData>
									<TableData>
										<Link
											to={`${instructor.id}`}
											className="hover:underline"
											prefetch="intent"
										>
											{instructor.last_name}
										</Link>
									</TableData>
									<TableData>{instructor.phone}</TableData>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			)}
		</div>
	);
}
