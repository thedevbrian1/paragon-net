import { Link, NavLink, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { ExclamationIcon, Teaching } from "../components/Icon";
import CourseCard from "../components/CourseCard";
import CardContainer from "../components/CardContainer";
import LinkButton from "../components/LinkButton";
import { getCourses } from "../models/course";

export async function loader() {
    const courses = await getCourses();
    return courses.result;
}

export default function CourseIndex() {

    return (
        <main className="">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-8 xl:mt-4">
                <div className="flex-1 basis-0">
                    <h1 className="text-center md:text-left font-semibold text-3xl md:text-4xl lg:text-5xl">Explore our variety of premium courses</h1>
                    <p className="text-center md:text-left mt-2 md:mt-6">Learn and take your skills everywhere you go</p>
                </div>
                <div className="flex-1 basis-0 w-60 ">
                    <Teaching />
                </div>
            </div>
            <LowerPrimaryCourses />
            <UpperPrimaryCourses />
            <JuniorHighSchoolCourses />
            <SeniorHighSchoolCourses />
            <PostHighSchoolCourses />
            <HolidayCourses />
        </main>
    );
}

function LowerPrimaryCourses() {
    const courses = useLoaderData();
    const lowerPrimaryCourses = courses.filter(course => course.categories?.title === 'Lower Primary School').sort((a, b) => {
        let gradeA = parseInt(a.title.replace('Grade ', ''));
        let gradeB = parseInt(b.title.replace('Grade ', ''));
        return gradeA - gradeB;
    });

    if (!lowerPrimaryCourses) {
        return null;
    }

    return (
        <section className="px-4 md:px-0" id="lowerPrimary">
            <h2 className="font-semibold text-lg mt-8">Lower primary courses</h2>
            <CardContainer>
                {lowerPrimaryCourses.map((course) => {
                    function prefetchImage() {
                        let img = new Image();
                        img.src = `${course.mainImage.asset.url}?auto=format&w=1500`
                    }
                    return (
                        <NavLink
                            key={course._id}
                            to={`category/${course._id}`}
                            prefetch="intent"
                            onMouseEnter={prefetchImage}
                            onFocus={prefetchImage}
                            unstable_viewTransition
                        >
                            <CourseCard
                                title={course.title}
                                bgImg={`${course.mainImage.asset.url}?w=400`}
                            // description={course.description}
                            />
                        </NavLink>
                    )
                })}
            </CardContainer>
        </section>
    );
}

function UpperPrimaryCourses() {
    const courses = useLoaderData();
    const upperPrimaryCourses = courses
        .filter(course => course.categories?.title === 'Upper Primary School')
        .sort((a, b) => {
            let gradeA = parseInt(a.title.replace('Grade ', ''));
            let gradeB = parseInt(b.title.replace('Grade ', ''));
            return gradeA - gradeB;
        });

    if (upperPrimaryCourses.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-0" id="upperPrimary">
            <h2 className="font-semibold text-lg mt-8">Upper primary courses</h2>
            <CardContainer>
                {upperPrimaryCourses.map((course, index) => {
                    function prefetchImage() {
                        let img = new Image();
                        img.src = `${course.mainImage.asset.url}?auto=format&w=1500`
                    }
                    return (
                        <NavLink
                            key={course._id}
                            to={`category/${course._id}`}
                            prefetch="intent"
                            onMouseEnter={prefetchImage}
                            onFocus={prefetchImage}
                            unstable_viewTransition
                        >
                            <CourseCard
                                title={course.title}
                                bgImg={`${course.mainImage.asset.url}?w=400`}
                            // description={course.description}
                            />
                        </NavLink>
                    )
                })}
            </CardContainer>
        </section>
    );
}

function JuniorHighSchoolCourses() {
    const courses = useLoaderData();
    const juniorHighSchoolCourses = courses
        .filter(course => course.categories?.title === 'Junior High School')
        .sort((a, b) => {
            let gradeA = parseInt(a.title.replace('Grade ', ''));
            let gradeB = parseInt(b.title.replace('Grade ', ''));
            return gradeA - gradeB;
        });

    if (juniorHighSchoolCourses.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-0" id="juniorHigh">
            <h2 className="font-semibold text-lg mt-8">Junior high school courses</h2>
            <CardContainer>
                {juniorHighSchoolCourses.map((course, index) => {
                    function prefetchImage() {
                        let img = new Image();
                        img.src = `${course.mainImage.asset.url}?auto=format&w=1500`
                    }
                    return (
                        <NavLink
                            key={course._id}
                            to={`category/${course._id}`}
                            prefetch="intent"
                            onMouseEnter={prefetchImage}
                            onFocus={prefetchImage}
                            unstable_viewTransition
                        >
                            <CourseCard
                                title={course.title}
                                bgImg={`${course.mainImage.asset.url}?w=400`}
                            // description={course.description}
                            />
                        </NavLink>
                    )
                })}
            </CardContainer>
        </section>
    );
}

function SeniorHighSchoolCourses() {
    const courses = useLoaderData();
    const seniorHighSchoolCourses = courses
        .filter(course => course.categories?.title === 'Senior High School')
        .sort((a, b) => {
            let gradeA = parseInt(a.title.replace('Grade ', ''));
            let gradeB = parseInt(b.title.replace('Grade ', ''));
            return gradeA - gradeB;
        });

    if (seniorHighSchoolCourses.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-0" id="seniorHigh">
            <h2 className="font-semibold text-lg mt-8">Senior high school courses</h2>
            <CardContainer>
                {seniorHighSchoolCourses.map((course, index) => {
                    function prefetchImage() {
                        let img = new Image();
                        img.src = `${course.mainImage.asset.url}?auto=format&w=1500`
                    }
                    return (
                        <NavLink
                            key={course._id}
                            to={`category/${course._id}`}
                            prefetch="intent"
                            onMouseEnter={prefetchImage}
                            onFocus={prefetchImage}
                            unstable_viewTransition
                        >
                            <CourseCard
                                title={course.title}
                                bgImg={`${course.mainImage.asset.url}?w=400`}
                            // description={course.description}
                            />
                        </NavLink>
                    )
                })}
            </CardContainer>
        </section>
    );
}

function PostHighSchoolCourses() {
    const courses = useLoaderData();
    const postHighSchoolCourses = courses.filter(course => course.categories?.title === 'Post-High School');

    if (postHighSchoolCourses.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-0" id="seniorHigh">
            <h2 className="font-semibold text-lg mt-8">Post high school courses</h2>
            <CardContainer>
                {postHighSchoolCourses.map((course, index) => {
                    function prefetchImage() {
                        let img = new Image();
                        img.src = `${course.mainImage.asset.url}?auto=format&w=1500`
                    }
                    return (
                        <NavLink
                            key={course._id}
                            to={`category/${course._id}`}
                            prefetch="intent"
                            onMouseEnter={prefetchImage}
                            onFocus={prefetchImage}
                            unstable_viewTransition
                        >
                            <CourseCard
                                title={course.title}
                                bgImg={`${course.mainImage.asset.url}?w=400`}
                            // description={course.description}
                            />
                        </NavLink>
                    )
                })}
            </CardContainer>
        </section>
    );
}

function HolidayCourses() {
    const courses = useLoaderData();
    const holidayCourses = courses.filter(course => course.categories?.title === 'Holiday');

    if (holidayCourses.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-0" id="seniorHigh">
            <h2 className="font-semibold text-lg mt-8">Weekend & holiday courses</h2>
            <CardContainer>
                {holidayCourses.map((course, index) => {
                    function prefetchImage() {
                        let img = new Image();
                        img.src = `${course.mainImage.asset.url}?auto=format&w=1500`
                    }
                    return (
                        <NavLink
                            key={course._id}
                            to={`category/${course._id}`}
                            prefetch="intent"
                            onMouseEnter={prefetchImage}
                            onFocus={prefetchImage}
                            unstable_viewTransition
                        >
                            <CourseCard
                                title={course.title}
                                bgImg={`${course.mainImage.asset.url}?w=400`}
                            // description={course.description}
                            />
                        </NavLink>
                    )
                })}
            </CardContainer>
        </section>
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
                        <h1 className="text-3xl font-semibold">{error.status} {error.statusText}</h1>
                        <p>{error.data}</p>
                    </div>
                    <LinkButton text='Try again' href='.' size='sm' />
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
                    <LinkButton text='Try again' href='.' size='sm' />
                </div>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}
