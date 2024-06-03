import { Link, useMatches } from "@remix-run/react";
import { ArrowRight, Calendar } from "lucide-react";
import { Table } from "~/components/Table";
import { TableData } from "~/components/TableData";
import { TableHead } from "~/components/TableHead";
const schedules = [
    {
        grade: 8,
        startTime: '9:00 am',
        endTime: '10:12 am',
        location: 'At identified Tech Village'
    },
    {
        grade: 7,
        startTime: '10:12 am',
        endTime: '11:24 am',
        location: 'At identified Tech Village'
    },
    {
        grade: 6,
        startTime: '11:24 am',
        endTime: '12:36 pm',
        location: 'At identified Tech Village'
    },
    {
        grade: 5,
        startTime: '12:36 pm',
        endTime: '1:48 pm',
        location: 'At identified Tech Village'
    },
    {
        grade: 4,
        startTime: '1:48 pm',
        endTime: '3:00 pm',
        location: 'At identified Tech Village'
    },
]
export default function Schedule() {
    let tableHeaders = ['Grade', 'Facilitation time', 'Location'];
    let matches = useMatches();

    let user = matches[0].data?.user;

    return (
        <main className="px-6 md:px-12 xl:px-0 mt-8 lg:max-w-4xl mx-auto text-brand-black">
            <h1 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl">Schedule</h1>
            {
                user ? <div className=" flex justify-end mt-4">
                    <Link
                        to="/dashboard"
                        prefetch="intent"
                        className="flex gap-2 bg-brand-orange hover:bg-orange-500  transition ease-in-out duration-300 rounded px-4 py-2 justify-center"
                    >
                        Go to dashboard <ArrowRight />
                    </Link>
                </div>
                    : null
            }

            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <div>
                        <h2 className="font-semibold text-lg">During school sessions</h2>
                        <div className="text-orange-500 bg-orange-100 border-l-2 border-l-orange-500  p-4 mt-4 text-sm font-bold flex gap-2 items-center">
                            <Calendar />
                            <div className="">
                                <p className="text-lg">Saturdays</p>
                                <p><time>9 am</time> - <time>3 pm</time></p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h2 className="font-semibold text-lg">During holidays</h2>
                        <div className="text-orange-500 bg-orange-100 border-l-2 border-l-orange-500  p-4 mt-4 text-sm font-bold flex gap-2 items-center">
                            <Calendar />
                            <div className="">
                                <p className="text-lg">Monday - Friday</p>
                                <p><time>9 am</time> - <time>3 pm</time></p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div>
                    <img src="/schedule.svg" alt="" className="w-80" />
                </div> */}
                <div className="">
                    <Table>
                        <caption className="mb-2">Schedule for each grade</caption>
                        <TableHead tableHeaders={tableHeaders} />
                        <tbody>
                            {schedules.map((schedule, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? '' : 'bg-gray-100'}`}>
                                    <TableData>
                                        {schedule.grade}
                                    </TableData>
                                    <td className="border border-slate-700 text-center p-2">
                                        {schedule.startTime} - {schedule.endTime}
                                    </td>
                                    <TableData>
                                        {schedule.location}
                                    </TableData>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </main>
    );
}