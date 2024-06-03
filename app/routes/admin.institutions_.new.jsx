import { Form, isRouteErrorResponse, json, redirect, useActionData, useLoaderData, useNavigation, useRouteError } from "@remix-run/react";
import { useState } from "react";
import FormSpacer from "~/components/FormSpacer";
import { Grid } from "~/components/Grid";
import { ExclamationIcon } from "~/components/Icon";
import LinkButton from "~/components/LinkButton";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getCountries } from "~/models/country";
import { getCounties } from "~/models/county";
import { createInstitution } from "~/models/institution";
import { getSubCounties, getSubCountyByTitle } from "~/models/subcounty";
import { getSession, sessionStorage, setSuccessMessage } from "~/.server/session";

export async function loader({ request }) {
    const [
        { data: countries, headers: countryHeaders },
        { data: counties, headers: countyHeaders },
        { data: subCounties, headers: subCountyHeaders }
    ] = await Promise.all([
        getCountries(request),
        getCounties(request),
        getSubCounties(request)
    ]);

    const allHeaders = {
        ...Object.fromEntries(countryHeaders.entries()),
        ...Object.fromEntries(countyHeaders.entries()),
        ...Object.fromEntries(subCountyHeaders.entries())
    };

    return { countries, counties, subCounties };

}

export async function action({ request, response }) {
    const session = await getSession(request);

    const formData = await request.formData();
    // const action = formData.get('_action');
    const name = String(formData.get('name'));
    const subCounty = String(formData.get('subcounty'));

    const { data, headers: subCountyHeaders } = await getSubCountyByTitle(request, subCounty);
    const subCountyId = data[0].id;

    const { data: institution, headers: institutionHeaders } = await createInstitution(request, name, subCountyId);
    console.log({ institution });
    const institutionId = institution[0].id;

    setSuccessMessage(session, 'Created successfully.');
    response.status = 302;
    response.headers.set('Location', `/admin/institutions/${institutionId}`);
    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
    // const allHeaders = {
    //     ...institutionHeaders,
    //     ...Object.fromEntries(subCountyHeaders.entries()),
    //     "Set-Cookie": await sessionStorage.commitSession(session)
    // }

    return response;
}


export default function NewInstitution() {
    const { countries, counties, subCounties } = useLoaderData();
    const actionData = useActionData();

    console.log({ countries });
    console.log({ counties });
    console.log({ subCounties });

    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    let matchedCounties;

    if (selectedCountry) {
        let countryId = countries.find(country => country.title === selectedCountry).id;
        matchedCounties = counties.filter(county => county.country_id === countryId);
    }

    let matchedSubCounties;

    if (selectedCounty) {
        let countyId = counties.find(county => county.title === selectedCounty).id;
        matchedSubCounties = subCounties.filter((subCounty) => subCounty.county_id === countyId);
    }

    // return <div></div>;

    return (
        <div className="mt-8 lg:mt-12 max-w-4xl text-brand-black">
            <h2 className="font-semibold text-lg">Add institution</h2>
            <Form method="post" className="mt-8">
                <Grid>
                    <FormSpacer>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            name='name'
                            type='text'
                            id='name'
                            placeholder='Tassia School'
                            className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.name ? 'border border-red-500' : ''}`}
                        />
                        {actionData?.fieldErrors?.name
                            ? <p className="text-red-500 text-sm">{actionData.fieldErrors.name}</p>
                            : null
                        }
                    </FormSpacer>
                </Grid>
                <fieldset className="mt-8">
                    <legend className="font-semibold">Location</legend>
                    <div className="grid md:grid-cols-3 gap-4">
                        <FormSpacer>
                            <Label htmlFor='country'>Country</Label>
                            <Select
                                name="country"
                                id='country'
                                // defaultValue={data?.country}
                                onValueChange={(value) => setSelectedCountry(value)}
                                required
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
                        {selectedCountry
                            ? (
                                <FormSpacer>
                                    <Label htmlFor='county'>County</Label>
                                    <Select
                                        name="county"
                                        id='county'
                                        // defaultValue={data?.county}
                                        onValueChange={(value) => setSelectedCounty(value)}
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
                            )
                            : null
                        }
                        {selectedCounty
                            ? (
                                <FormSpacer>
                                    <Label htmlFor='subcounty'>Sub-county</Label>
                                    <Select
                                        name="subcounty"
                                        id='subcounty'
                                        // defaultValue={data?.county}
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
                            )
                            : null
                        }

                    </div>
                </fieldset>
                <div className="mt-8 flex justify-end">
                    <Button
                        type='submit'
                        className='bg-brand-orange hover:bg-orange-300 transition duration-300 ease-in-out focus-visible:ring-brand-blue text-brand-black'

                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </Form>
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