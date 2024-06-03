import { Link, isRouteErrorResponse, useLoaderData, useNavigation, useParams, useRouteError } from "@remix-run/react";
import { PortableText } from "@portabletext/react";
import { ExclamationIcon, Programmer } from "../components/Icon";
import LinkButton from "../components/LinkButton";
import { getCourseById } from "../models/course";



export const handle = {
    breadcrumb: (data) => {
        return <BreadCrumb data={data.data} />
    }
}

export async function loader({ params }) {
    const course = await getCourseById(params.id);
    return course.result[0];
}

const components = {
    block: {
        h2: ({ children }) => <h2 className="mt-4 text-xl">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-4">{children}</h3>
    }
}

function BreadCrumb({ data }) {
    let params = useParams();
    return <Link to={`/courses/category/${params.id}`}>{data.title}</Link>;
}

export default function Course() {
    const topics = ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5'];
    const course = useLoaderData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

    const params = useParams();
    const id = params.id;

    let searchParams = new URLSearchParams([
        ["id", id],
        ["title", course.title],
        ["page", 1]
    ]);

    return (
        <main>
            <div
                className="mt-4 w-full h-60 md:h-[70vh] grid place-items-center bg-center bg-cover bg-no-repeat bg-black bg-opacity-70 bg-blend-overlay rounded"
                style={{ backgroundImage: `url('${course.mainImage.asset.url}?auto=format&w=1500')` }}
            >
                <h1 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl text-white">
                    {course.title}
                </h1>
            </div>
            <div className="opacity-0 fading-in mt-12 flex flex-col md:flex-row gap-6 xl:gap-8 w-full">
                <div className="bg-brand-gray px-4 py-6 rounded min-w-[300px] md:h-96 order-2 flex flex-col items-center gap-4">
                    <div className="w-40">
                        <Programmer />
                    </div>
                    <div className="text-center">
                        <h2 className="font-semibold text-lg">Enroll</h2>
                        <p>Join our cohort and start learning as soon as possible</p>
                    </div>
                    <div className="">
                        <LinkButton href={`/enroll?${searchParams}`} text='Enroll now' />
                    </div>
                </div>
                <div className="w-full xl:max-w-4xl mx-auto border border-slate-300 rounded p-4 lg:p-8 order-1 prose">
                    <PortableText
                        value={course.body}
                        components={components}
                    />
                </div>

            </div>
        </main>
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
                    <LinkButton text='Go to courses' href='..' size='sm' />
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
                    <LinkButton text='Go to courses' href='..' size='sm' />
                </div>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}