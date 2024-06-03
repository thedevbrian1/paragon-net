import { json } from "@remix-run/node";
import { Link, useFetcher, useLocation } from "@remix-run/react";
import { SearchIcon } from "lucide-react";
import { useRef, useState } from "react";
import { getCourses } from "~/models/course";

export async function loader({ request }) {
    let q = new URL(request.url).searchParams.get('q');

    if (!q) return [];
    // q = `"${q.replace(/"/g, '""')}"`;

    console.log({ q });

    let res = await getCourses();
    let courses = res.result;

    // console.log({ courses });

    // FIXME: Relevant results not showing

    let relevantResults = courses.filter(course => course.title.toLowerCase().includes(q.toLowerCase()));

    console.log({ relevantResults });

    let results = relevantResults.map(result => {
        return {
            id: result._id,
            title: result.title,
            imgSrc: `${result.mainImage.asset.url}?auto=format&w=60`
        }
    });

    console.log({ results });

    return json(results);
}

export function Search() {


    let location = useLocation();
    let search = useFetcher();

    console.log({ results: search.data });

    let [show, setShow] = useState();
    let inputRef = useRef();
    let dialogRef = useRef();

    return (
        <div>
            <button onClick={() => { setShow(true) }} className="flex gap-2">
                <SearchIcon /> Search
            </button>
            <div
                ref={dialogRef}
                // onClick={() => setShow(false)}
                hidden={!show}
                className="fixed top-0 left-0 w-screen h-screen bg-black/50 z-30 overflow-hidden"
            >
                <div
                    className="bg-white w-[600px] max-h-[90vh] my-5 mx-auto border border-[#ccc] rounded-lg shadow-[0 0 10px #ccc]"
                    onClick={(event) => { event.stopPropagation() }}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                            setShow(false);
                        }
                    }}
                >
                    <search.Form method="get" action="/search">
                        <input
                            ref={inputRef}
                            type="search"
                            name="q"
                            placeholder="Search"
                            onKeyDown={(event) => {
                                if (event.key === 'Escape' && event.currentTarget.value === '') {
                                    setShow(false)
                                } else {
                                    event.stopPropagation();
                                }
                            }}
                            onChange={(event) => { search.submit(event.currentTarget.form) }}
                            className="w-full py-2 px-4 sticky top-0 outline-none border-none border-b-[#ccc]"
                        />
                        {search.data?.length > 0 ?
                            <ul className="px-8 min-h-4 list-disc space-y-2">
                                {search.data.map((result => (
                                    <li key={result.id}>
                                        <Link to={`/courses/category/${result.id}`} className="flex gap-2">
                                            <img src={result.imgSrc} alt="" className="w-20 h-10 object-cover" />
                                            {result.title}
                                        </Link>
                                    </li>
                                )))}
                            </ul>

                            : <p>No results</p>
                        }
                    </search.Form>
                </div>
            </div>
        </div>

    );
}