import { NavLink, Outlet, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { AcademicCapIcon, BookOpenIcon, BuildingIcon, ChartIcon, ExclamationIcon, IdentificationIcon, UsersIcon } from "~/components/Icon";
import LinkButton from "~/components/LinkButton";
import { requireAdminUser } from "~/.server/supabase";

export async function loader({ request }) {
    await requireAdminUser(request);
    return null;
}

export default function Admin() {
    const sidenavMenu = [
        {
            title: 'Dashboard',
            path: '/admin',
            icon: <ChartIcon />
        },
        {
            title: 'Students',
            path: '/admin/students',
            icon: <UsersIcon />
        },
        {
            title: 'Enrolments',
            path: '/admin/enrolments',
            icon: <AcademicCapIcon />
        },
        {
            title: 'Courses',
            path: '/admin/courses',
            icon: <BookOpenIcon />
        },
        {
            title: 'Instructors',
            path: '/admin/instructors',
            icon: <IdentificationIcon />
        },
        {
            title: 'Institutions',
            path: '/admin/institutions',
            icon: <BuildingIcon />
        }
    ];
    return (
        <main className="text-brand-black flex">
            <div className="min-h-screen w-14 fixed lg:w-72 bg-gray-100">
                <ul className="divide-solid divide-y">
                    {sidenavMenu.map((menuItem, index) => (
                        <li key={index} className="">
                            <NavLink
                                to={menuItem.path}
                                prefetch="intent"
                                end
                                className={({ isActive }) => `flex gap-2 py-3 pl-4 lg:pl-8 hover:bg-orange-200 transition ease-in-out duration-300 ${isActive ? 'bg-brand-orange' : ''}`}
                            >
                                {menuItem.icon} <span className="hidden lg:inline">{menuItem.title}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-full min-h-screen flex-1 px-4 ml-14 lg:ml-80 mb-16">
                <Outlet />
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