import { Link, Outlet, useMatches } from "@remix-run/react";
import { ChevronRightIcon } from "../components/Icon";

export const handle = {
    breadcrumb: () => <Link to="/courses">Courses</Link>
};
export default function Courses() {
    const matches = useMatches();
    const breadcrumbs = matches.filter(match => match.handle && match.handle.breadcrumb);

    return (
        <div className="px-4 md:px-8 xl:px-0 py-8 max-w-6xl mx-auto text-brand-black">
            <ul className="flex">
                <li>
                    <Link to="/">
                        Home
                    </Link>
                </li>
                {breadcrumbs.map((match, index) => (
                    <li key={index} className="flex">
                        <ChevronRightIcon /> {match.handle.breadcrumb(match)}
                    </li>
                ))}
            </ul>
            <Outlet />
        </div>
    );
}

// 🔸