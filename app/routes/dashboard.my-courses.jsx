import { Link, useLoaderData } from '@remix-run/react';
import { PlusIcon } from '../components/Icon';
import { getCourseById } from '../models/course';
import { createClient } from '../.server/supabase';
import { getPersonalEnrolments } from '~/models/enrolment';

export async function loader({ request }) {
	const { supabaseClient, headers } = createClient(request);

	const { data, error } = await supabaseClient.auth.getSession();

	if (error) {
		throw new Error(error);
	}

	const user = data.session?.user;

	const { data: student, error: studentError } = await supabaseClient
		.from('students')
		.select('id')
		.eq('user_id', user.id);

	if (studentError) {
		throw new Error(studentError);
	}

	const studentId = student[0].id;

	const { data: courseIds, headers: enrolHeaders } =
		await getPersonalEnrolments(request, studentId);

	const courses = await Promise.all(
		courseIds.map(async (course) => {
			let res = await getCourseById(course.course_id);
			let courseObj = {
				id: res.result[0]._id,
				enrolmentId: course.id,
				title: res.result[0].title,
				imageSrc: res.result[0].mainImage.asset.url,
			};
			return courseObj;
		}),
	);

	const allHeaders = {
		...Object.fromEntries(headers.entries()),
		...Object.fromEntries(enrolHeaders.entries()),
	};

	return { courses };
}

export async function action() {
	return null;
}

export default function MyCourses() {
	const { courses } = useLoaderData();

	return (
		<div className="mt-8 lg:mt-12">
			<div className="flex justify-between item-center">
				<h2 className="font-semibold text-lg">My courses</h2>
				<Link
					to="/courses"
					prefetch="intent"
					className="bg-brand-orange hover:bg-orange-400 transition duration-300 ease-in-out text-black rounded capitalize text-center whitespace-nowrap px-5 py-3 flex gap-2"
				>
					<PlusIcon /> Add course
				</Link>
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
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{courses.map((course) => (
						<MyCourse
							key={course.id}
							title={course.title}
							imageSrc={course.imageSrc}
							// description={'fkdjfkjkdjkf'}
							totalLessons={10}
							completedLessons={2}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function MyCourse({
	title,
	imageSrc,
	description,
	totalLessons,
	completedLessons,
}) {
	return (
		<div className="bg-gray-50 rounded">
			<img
				src={imageSrc}
				alt=""
				className="w-full h-40 md:h-52 object-cover rounded-t"
			/>
			<div className="p-4">
				<h3 className="font-semibold">{title}</h3>
				<p className="mt-2">{description}</p>
				{/* FIXME: Use correct values for progress based on the props provided */}
				{/* <div className="flex flex-col mt-4">
                    <label htmlFor="lessons">{completedLessons}/{totalLessons} lessons</label>
                    <progress id="lessons" max="100" value={`${completedLessons * 10}`}>{completedLessons * 10}%</progress>
                </div> */}
			</div>
		</div>
	);
}
