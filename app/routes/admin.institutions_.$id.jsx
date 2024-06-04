import {
	Form,
	isRouteErrorResponse,
	useActionData,
	useLoaderData,
	useNavigation,
	useRouteError,
} from '@remix-run/react';
import { useState } from 'react';
import FormSpacer from '~/components/FormSpacer';
import { Grid } from '~/components/Grid';
import { ExclamationIcon } from '~/components/Icon';
import LinkButton from '~/components/LinkButton';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import { getCountries } from '~/models/country';
import { getCounties } from '~/models/county';
import { getInstitutionById, updateInstitution } from '~/models/institution';
import { getSubCounties } from '~/models/subcounty';
import {
	getSession,
	sessionStorage,
	setSuccessMessage,
} from '~/.server/session';
import { badRequest, validateName } from '~/.server/validation';
import { TriangleAlert } from 'lucide-react';

export async function loader({ request, params, response }) {
	let institutionId = Number(params.id);

	let [
		{ data: institution, headers: institutionHeaders },
		{ data: countries, headers: countryHeaders },
		{ data: counties, headers: countyHeaders },
		{ data: subCounties, headers: subCountyHeaders },
	] = await Promise.all([
		getInstitutionById(request, institutionId),
		getCountries(request),
		getCounties(request),
		getSubCounties(request),
	]);

	let allHeaders = {
		...Object.fromEntries(institutionHeaders.entries()),
		...Object.fromEntries(countryHeaders.entries()),
		...Object.fromEntries(countyHeaders.entries()),
		...Object.fromEntries(subCountyHeaders.entries()),
	};

	for (let [key, value] of Object.entries(allHeaders)) {
		response.headers.append(key, value);
	}

	return { institution, countries, counties, subCounties };
}

export async function action({ request, params, response }) {
	let institutionId = Number(params.id);

	let session = await getSession(request);

	let formData = await request.formData();
	let name = String(formData.get('name'));
	let subCounty = String(formData.get('subcounty'));

	let fieldErrors = {
		name: validateName(name),
	};

	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors });
	}

	// TODO: Update location

	let { status, headers } = await updateInstitution(
		request,
		institutionId,
		name,
	);

	if (status === 204) {
		setSuccessMessage(session, 'Updated successfully.');
		// let allHeaders = {
		//     ...Object.fromEntries(headers.entries()),
		//     "Set-Cookie": await sessionStorage.commitSession(session)
		// };

		for (let [key, value] of headers.entries()) {
			response.headers.append(key, value);
		}
		response.headers.append(
			'Set-Cookie',
			await sessionStorage.commitSession(session),
		);

		return { ok: true };
	}
	return null;
}

export default function Institution() {
	let { institution, countries, counties, subCounties } = useLoaderData();
	let actionData = useActionData();
	let navigation = useNavigation();

	let isSubmitting = navigation.state === 'submitting';

	let [country, setCountry] = useState(institution[0].locations.subcounties.counties.countries.title);
	let [county, setCounty] = useState(institution[0].locations.subcounties.counties.title);
	let [subcounty, setSubCounty] = useState(institution[0].locations.subcounties.title);
	let matchedCounties;
	let [name, setName] = useState(institution[0].title);

	if (country) {
		let countryId = countries.find(
			(item) => item.title === country,
		).id;
		matchedCounties = counties.filter(
			(item) => item.country_id === countryId,
		);
	}

	let matchedSubCounties;

	if (county) {
		let countyId = counties.find(
			(item) => item.title === county,
		).id;
		matchedSubCounties = subCounties.filter(
			(item) => item.county_id === countyId,
		);
	}

	let hasChanged = !(name.toLowerCase() === institution[0].title.toLowerCase()
		&& country === institution[0].locations.subcounties.counties.countries.title
		&& county === institution[0].locations.subcounties.counties.title
		&& subcounty === institution[0].locations.subcounties.title
	);

	return (
		<div className="pt-12 max-w-4xl text-brand-black relative">
			{hasChanged

				? <div className="fixed top-[85px] md:top-[105px] lg:top-[117px] left-14 lg:left-72 right-0 transition ease-in-out duration-300 bg-brand-black h-10 flex items-center justify-center">
					<p className="text-white flex gap-4 justify-center">
						<TriangleAlert /> Unsaved changes
					</p>
				</div>
				: null
			}
			<h2 className="font-semibold text-lg">Institution details</h2>
			<p className="text-orange-500 bg-orange-100 border-l-2 border-l-orange-500 mt-4 p-4 text-sm font-bold">
				You can edit the institution info from here
			</p>
			<Form method="post" className="mt-8">
				<Grid>
					<FormSpacer>
						<Label htmlFor="name">Name</Label>
						<Input
							type="text"
							name="name"
							defaultValue={institution[0].title}
							placeholder="Tassia School"
							onChange={(event) => setName(event.target.value)}
							className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.name ? 'border border-red-500' : ''}`}
						/>
						{actionData?.fieldErrors?.name ? (
							<p className="text-red-500 text-sm">
								{actionData.fieldErrors.name}
							</p>
						) : null}
					</FormSpacer>
				</Grid>
				<fieldset className="mt-8">
					<legend className="font-semibold">Location</legend>
					<div className="grid md:grid-cols-3 gap-4">
						<FormSpacer>
							<Label htmlFor="country">Country</Label>
							<Select
								name="country"
								id="country"
								defaultValue={
									institution[0].locations.subcounties
										.counties.countries.title
								}
								onValueChange={(value) =>
									setCountry(value)
								}
							// required
							>
								<SelectTrigger className="w-[180px] focus-visible:ring-brand-blue transition duration-300 ease-in-out">
									<SelectValue placeholder="--Select country--" />
								</SelectTrigger>
								<SelectContent>
									{countries.map((country) => (
										<SelectItem
											key={crypto.randomUUID()}
											// key={subCounty.id}
											value={country.title}
										>
											{country.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormSpacer>
						{country ? (
							<FormSpacer>
								<Label htmlFor="county">County</Label>
								<Select
									name="county"
									id="county"
									// defaultValue={data?.county}
									defaultValue={
										institution[0].locations.subcounties
											.counties.title
									}
									onValueChange={(value) =>
										setCounty(value)
									}
									required
								>
									<SelectTrigger className="w-[180px] focus-visible:ring-brand-blue transition duration-300 ease-in-out">
										<SelectValue placeholder="--Select county--" />
									</SelectTrigger>
									<SelectContent>
										{matchedCounties.map((county) => (
											<SelectItem
												key={crypto.randomUUID()}
												// key={subCounty.id}
												value={county.title}
											>
												{county.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormSpacer>
						) : null}
						{county ? (
							<FormSpacer>
								<Label htmlFor="subcounty">Sub-county</Label>
								<Select
									name="subcounty"
									id="subcounty"
									defaultValue={
										institution[0].locations.subcounties
											.title
									}
									onValueChange={(value) => setSubCounty(value)}
									required
								>
									<SelectTrigger className="w-[180px] focus-visible:ring-brand-blue transition duration-300 ease-in-out">
										<SelectValue placeholder="--Select sub-county--" />
									</SelectTrigger>
									<SelectContent>
										{matchedSubCounties.map((subcounty) => (
											<SelectItem
												key={crypto.randomUUID()}
												// key={subCounty.id}
												value={subcounty.title}
											>
												{subcounty.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormSpacer>
						) : null}
					</div>
				</fieldset>
				<div className="mt-8 flex justify-end">
					<Button
						type="submit"
						disabled={isSubmitting || !hasChanged}
						className="bg-brand-orange hover:bg-orange-300 transition duration-300 ease-in-out focus-visible:ring-brand-blue text-brand-black"
					>
						{isSubmitting ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</Form>
		</div>
	);
}

export function ErrorBoundary() {
	let error = useRouteError();

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
