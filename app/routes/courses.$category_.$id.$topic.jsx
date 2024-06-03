import { json } from '@remix-run/node';
import {
	Link,
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';
import { ExclamationIcon } from '../components/Icon';
import LinkButton from '../components/LinkButton';

export async function loader({ params }) {
	const topic = params.topic;
	return { topic };
}

export default function Topic() {
	const { topic } = useLoaderData();
	return (
		<div className="text-brand-black border border-slate-300 rounded p-4 lg:p-5">
			<h3 className="font-semibold text-lg">{topic}</h3>
			<p className="mt-3">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
				eaque vel dolorem sequi. Eum tempore minima nihil rem,
				necessitatibus recusandae eaque dolorum debitis nam, fuga porro
				quos, a itaque quisquam?
			</p>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		console.log({ error });
		return (
			<div className="bg-red-100 text-red-500 w-full grid place-items-center px-4 py-6">
				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center">
						<ExclamationIcon />
						<h1 className="text-3xl font-semibold">
							{error.status} {error.statusText}
						</h1>
						<p>{error.data}</p>
					</div>
					<LinkButton text="Reload course" href=".." size="sm" />
				</div>
			</div>
		);
	} else if (error instanceof Error) {
		console.log({ error });
		return (
			<div className="bg-red-100 text-red-500 w-full grid place-items-center px-4 py-6">
				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center">
						<ExclamationIcon />
						<h1 className="text-3xl font-semibold">Error</h1>
						<p>{error.message}</p>
					</div>
					<LinkButton text="Reload course" href=".." size="sm" />
				</div>
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
