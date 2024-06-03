import { Link, json, useLoaderData } from '@remix-run/react';
import { Table } from '~/components/Table';
import { TableData } from '~/components/TableData';
import { TableHead } from '~/components/TableHead';
import { getCourses } from '~/models/course';
import { getEnrolments } from '~/models/enrolment';

export async function loader({ request, response }) {
	const [{ data, headers }, res] = await Promise.all([
		getEnrolments(request),
		getCourses(),
	]);
	const allCourses = res.result.map((course) => {
		return {
			id: course._id,
			title: course.title,
		};
	});

	const enrolments = data.map((enrolment) => {
		// let course = allCourses.find(course => course.id === enrolment.course_id);
		// console.log({ course });

		return {
			id: enrolment.id,
			studentId: enrolment.students.id,
			created_at: enrolment.created_at,
			first_name: enrolment.students.first_name,
			last_name: enrolment.students.last_name,
			course: allCourses.find(
				(course) => course.id === enrolment.course_id,
			).title,
		};
	});

	for (let [key, value] of headers.entries()) {
		response.headers.append(key, value);
	}

	return enrolments;
}

export default function Enrolments() {
	const enrolments = useLoaderData();

	const tableHeaders = [
		'First name',
		'Last name',
		'Course',
		'Date of enrolment',
	];

	return (
		<div className="mt-8 lg:mt-12 max-w-5xl">
			<h2 className="font-semibold text-lg">Enrolments</h2>
			{enrolments.length === 0 ? (
				<div className="flex justify-center mt-12">
					<div>
						<img
							src="/clipboard.svg"
							alt="An illustration of an empty clipboard"
							className="w-20"
						/>
						<p className="mt-4">No enrolments yet</p>
					</div>
				</div>
			) : (
				<div className="mt-8 w-full overflow-x-auto">
					<Table>
						<caption className="mb-2">
							Enrolments ({enrolments.length})
						</caption>
						<TableHead tableHeaders={tableHeaders} />
						<tbody>
							{enrolments.map((enrolment, index) => (
								<tr
									key={enrolment.id}
									className={`${index % 2 === 0 ? '' : 'bg-gray-100'}`}
								>
									<TableData>
										<Link
											to={`/admin/students/${enrolment.studentId}#enroled-courses`}
											className="hover:underline"
											prefetch="intent"
										>
											{enrolment.first_name}
										</Link>
									</TableData>
									<TableData>
										<Link
											to={`/admin/students/${enrolment.studentId}#enroled-courses`}
											className="hover:underline"
											prefetch="intent"
										>
											{enrolment.last_name}
										</Link>
									</TableData>
									<TableData>{enrolment.course}</TableData>
									<TableData>
										{new Date(
											enrolment.created_at,
										).toLocaleDateString()}
									</TableData>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			)}
		</div>
	);
}
