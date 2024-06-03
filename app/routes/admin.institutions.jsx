import { Link, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { ExclamationIcon, PlusIcon } from "~/components/Icon";
import LinkButton from "~/components/LinkButton";
import { Table } from "~/components/Table";
import { TableData } from "~/components/TableData";
import { TableHead } from "~/components/TableHead";
import { getInstitutions } from "~/models/institution";

export async function loader({ request, response }) {
    let { data: institutions, headers } = await getInstitutions(request);

    for (let [key, value] of headers.entries()) {
        response.headers.append(key, value);
    }

    return institutions;
}

export default function Institutions() {
    let institutions = useLoaderData();
    // const institutions = []

    let tableHeaders = ['Title', 'County', 'Sub-county'];

    return (
        <div className="mt-8 lg:mt-12 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-2 justify-between">
                <h2 className="font-semibold text-lg">Institutions</h2>
                <Link to="new" className="flex gap-2 bg-brand-orange rounded px-4 py-2 justify-center">
                    <PlusIcon /> Add institution
                </Link>
            </div>
            {institutions.length === 0
                ? (
                    <div className="flex justify-center mt-12">
                        <div>
                            <img src="/clipboard.svg" alt="An illustration of an empty clipboard" className="w-20" />
                            <p className="mt-4">No institutions yet</p>
                        </div>
                    </div>
                )
                : (
                    <div className="mt-8 w-full overflow-x-auto">
                        <Table>
                            <caption className="mb-2">
                                Institutions ({institutions.length})
                            </caption>
                            <TableHead tableHeaders={tableHeaders} />
                            <tbody>
                                {institutions.map((institution, index) => (
                                    <tr
                                        key={institution.id}
                                        className={`${index % 2 === 0 ? '' : 'bg-gray-100'}`}
                                    >
                                        <TableData>
                                            <Link
                                                to={`${institution.id}`}
                                                className="hover:underline"
                                                prefetch="intent"
                                            >
                                                {institution.title}
                                            </Link>
                                        </TableData>
                                        <TableData>
                                            {institution.locations.subcounties.counties.title}
                                        </TableData>
                                        <TableData>
                                            {institution.locations.subcounties.title}
                                        </TableData>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )
            }
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