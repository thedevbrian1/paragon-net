import {
	Form,
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';
import { useState } from 'react';
import { DashboardCard } from '~/components/DashboardCard';
import FormSpacer from '~/components/FormSpacer';
import { ExclamationIcon } from '~/components/Icon';
import LinkButton from '~/components/LinkButton';
import { Label } from '~/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import { getCountries } from '~/models/country';
import { getCounties } from '~/models/county';
import { getCourses } from '~/models/course';
import { getInstitutions } from '~/models/institution';
import { getInstructors } from '~/models/instructor';
import { getStudentsAndLocation } from '~/models/student';
import { getSubCounties } from '~/models/subcounty';

import { DonutChart, Legend } from '@tremor/react';

export async function loader({ request, response }) {
	const [
		{ data: students, headers: studentHeaders },
		res,
		{ data: instructors, headers: instructorHeaders },
		{ data: institutions, headers: institutionHeaders },
		{ data: countries, headers: countryHeaders },
		{ data: counties, headers: countyHeaders },
		{ data: subCounties, headers: subCountyHeaders },
	] = await Promise.all([
		// getStudents(request),
		getStudentsAndLocation(request),
		getCourses(),
		getInstructors(request),
		getInstitutions(request),
		getCountries(request),
		getCounties(request),
		getSubCounties(request),
	]);

	const allHeaders = {
		...Object.fromEntries(studentHeaders.entries()),
		...Object.fromEntries(instructorHeaders.entries()),
		...Object.fromEntries(institutionHeaders.entries()),
		...Object.fromEntries(countryHeaders.entries()),
		...Object.fromEntries(countyHeaders.entries()),
		...Object.fromEntries(subCountyHeaders.entries()),
	};

	for (let [key, value] of Object.entries(allHeaders)) {
		response.headers.append(key, value);
	}
	return {
		students,
		courses: res.result.length,
		instructors: instructors.length,
		institutions: institutions.length,
		countries,
		counties,
		subCounties,
	};
}

export default function AdminIndex() {
	const {
		students,
		courses,
		instructors,
		institutions,
		countries,
		counties,
		subCounties,
	} = useLoaderData();

	const [selectedCounty, setSelectedCounty] = useState('Nairobi');

	// const totalStudents = [
	//     {
	//         county: 'Nairobi',
	//         students: 20
	//     },
	//     {
	//         county: 'Kiambu',
	//         students: 10
	//     },
	//     {
	//         county: 'Mombasa',
	//         students: 15
	//     }
	// ];

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// Formatting data for visualization (counties)
	// 1) Get all the students
	// 2) Get all the unique counties
	// 3) Associate each unique county with the number of students in it

	const studentCounties = students.map(
		(student) => student?.locations?.subcounties?.counties.title,
	);
	const countiesSet = new Set(studentCounties);
	const countiesSetArray = Array.from(countiesSet).filter((county) => county);

	const countyStudents = countiesSetArray.map((county) => {
		const count = students.filter(
			(student) =>
				student.locations?.subcounties?.counties.title === county,
		).length;
		return {
			county,
			students: count,
		};
	});

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// Formatting data for visualization (sub-counties)
	// 1) Get all the students
	// 2) Get all the sub-counties under the selected countiy
	// 3) Associate each sub-county with the number of students in it

	const selectedSubCounties = students
		.filter(
			(student) =>
				student?.locations?.subcounties?.counties.title ===
				selectedCounty,
		)
		.map((county) => county?.locations?.subcounties.title);

	const subCountiesSet = new Set(selectedSubCounties);
	const subCountiesSetArray = Array.from(subCountiesSet).filter(
		(subCounty) => subCounty,
	);

	const subCountyStudents = subCountiesSetArray.map((subCounty) => {
		const count = students.filter(
			(student) => student?.locations?.subcounties.title === subCounty,
		).length;
		return {
			subCounty,
			students: count,
		};
	});

	//////////////////////////////////////////////////////////////////////////////////////////////////// Formatting data for visualizing students (students in an institution vs individual students)
	// 1) Get all the students
	// 2) Filter the students with an institution_id
	// 3) Plot against the total number of students

	const institutionStudents = students.filter(
		(student) => student.institution_id,
	);

	const studentsRatioData = [
		{
			type: 'Institution',
			students: institutionStudents.length,
		},
		{
			type: 'Individual',
			students: students.length - institutionStudents.length,
		},
	];

	return (
		<div className="mt-8 lg:mt-12">
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				<DashboardCard
					title="Enrolled students"
					body={students.length}
				/>
				<DashboardCard title="Total institutions" body={institutions} />
				<DashboardCard title="Total courses" body={courses} />
				<DashboardCard title="Countries enroled" body={1} />
				<DashboardCard title="Counties enroled" body={1} />
				<DashboardCard title="Sub-counties enroled" body={1} />
				<DashboardCard title="Total educators" body={instructors} />
			</div>

			{/* TODO: Show a graph of enrolments over time */}

			<div className="mt-8 grid lg:grid-cols-2 gap-4">
				<div>
					<h2 className="font-semibold text-lg">
						Students per county
					</h2>
					{/* TODO: Show institutions in each subcounty */}
					<div className="flex items-center space-x-6 mt-4">
						<DonutChart
							data={countyStudents}
							category="students"
							index="county"
							colors={[
								'blue',
								'cyan',
								'indigo',
								'violet',
								'fuchsia',
							]}
							className="w-40"
						/>
						<Legend
							categories={countiesSetArray}
							colors={[
								'blue',
								'cyan',
								'indigo',
								'violet',
								'fuchsia',
							]}
							className="max-w-xs"
						/>
					</div>
				</div>

				<div className="">
					<h2 className="font-semibold text-lg">
						Students per sub-county
					</h2>
					<Form>
						<FormSpacer>
							<Label htmlFor="county">County</Label>
							<Select
								name="county"
								id="county"
								defaultValue={selectedCounty}
								onValueChange={(value) =>
									setSelectedCounty(value)
								}
								required
							>
								<SelectTrigger className="w-[180px] focus-visible:ring-brand-blue transition duration-300 ease-in-out">
									<SelectValue placeholder="--Select county--" />
								</SelectTrigger>
								<SelectContent>
									{counties.map((county) => (
										<SelectItem
											key={crypto.randomUUID()}
											// key={subCounty.id}
											value={county.title}
										>
											{county.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormSpacer>
					</Form>
					<div className="flex items-center space-x-6 mt-4">
						<DonutChart
							data={subCountyStudents}
							category="students"
							index="subCounty"
							colors={[
								'blue',
								'cyan',
								'indigo',
								'violet',
								'fuchsia',
							]}
							className="w-40"
						/>
						<Legend
							categories={subCountiesSetArray}
							colors={[
								'blue',
								'cyan',
								'indigo',
								'violet',
								'fuchsia',
							]}
							className="max-w-xs"
						/>
					</div>
				</div>
				<div>
					<h2 className="font-semibold text-lg">
						Ratio of institutions to individuals
					</h2>
					<div className="flex items-center space-x-6 mt-4">
						<DonutChart
							data={studentsRatioData}
							category="students"
							index="type"
							colors={[
								'blue',
								'cyan',
								'indigo',
								'violet',
								'fuchsia',
							]}
							className="w-40"
						/>
						<Legend
							categories={['Institutions', 'Individuals']}
							colors={[
								'blue',
								'cyan',
								'indigo',
								'violet',
								'fuchsia',
							]}
							className="max-w-xs"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		console.log({ error });
		return (
			<div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center">
						<ExclamationIcon />
						<h1 className="text-3xl font-semibold">
							{error.status} {error.statusText}
						</h1>
						<p>{error.data}</p>
					</div>
					<LinkButton text="Try again" href="." size="sm" />
				</div>
			</div>
		);
	} else if (error instanceof Error) {
		console.log({ error });
		return (
			<div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center">
						<ExclamationIcon />
						<h1 className="text-3xl font-semibold">Error</h1>
						<p>{error.message}</p>
					</div>
					<LinkButton text="Try again" href="." size="sm" />
				</div>
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
