import { json, useLoaderData } from '@remix-run/react';
import CourseCard from '~/components/CourseCard';
import { PlusIcon } from '~/components/Icon';
import { getCourses } from '~/models/course';

export async function loader() {
	const courses = await getCourses();
	return courses.result;
}

export default function AllCourses() {
	const tableHeaders = ['Course name'];
	const courses = useLoaderData();

	return (
		<div className="mt-8 lg:mt-12 max-w-5xl">
			<div className="flex flex-col md:flex-row gap-2 justify-between">
				<h2 className="font-semibold text-lg">Courses</h2>
				<a
					href="https://niftyeschool.sanity.studio/desk/course"
					target="_blank"
					rel="noopener noreferrer"
					className="flex gap-2 bg-brand-orange rounded px-4 py-2 justify-center"
				>
					<PlusIcon /> Add course
				</a>
			</div>
			{courses.length === 0 ? (
				<div className="flex justify-center mt-12">
					<div>
						<img
							src="/clipboard.svg"
							alt="An illustration of an empty clipboard"
							className="w-20"
						/>
						<p className="mt-4">No courses yet</p>
					</div>
				</div>
			) : (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
					{courses.map((course) => (
						<CourseCard
							key={course._id}
							title={course.title}
							bgImg={`${course.mainImage.asset.url}?w=400`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
