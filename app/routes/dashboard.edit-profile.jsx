import { Form, Outlet, isRouteErrorResponse, useActionData, useLoaderData, useNavigation, useRouteError } from "@remix-run/react";
import LinkButton from "../components/LinkButton";
import { Input } from "~/components/ui/input";
import { ExclamationIcon } from "../components/Icon";
import { badRequest, trimString, trimValue, validateEmail, validateName, validatePhone } from "../.server/validation";
import { createClient } from "../.server/supabase";
import { getSession, sessionStorage, setSuccessMessage } from "~/.server/session";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import FormSpacer from "~/components/FormSpacer";
import { Grid } from "~/components/Grid";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";

export async function loader({ request }) {
    const { supabaseClient, headers } = createClient(request);

    // TODO: Abstract to getUser function
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        throw new Error(error);
    }

    const user = data.session?.user;

    const { data: student, error: studentError } = await supabaseClient.from('students').select('first_name,last_name,phone').eq('user_id', user.id);

    // console.log({ student });

    return { student: { ...student[0], email: user.email } };
}

export async function action({ request, response }) {
    const { supabaseClient, headers } = createClient(request);

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        throw new Error(error);
    }

    const user = data.session?.user;

    const formData = await request.formData();
    const action = formData.get('_action');

    const session = await getSession(request);

    switch (action) {
        case 'personalDetails': {
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const phone = formData.get('phone');

            const trimmedPhone = trimValue(phone);
            const trimmedFirstName = trimString(firstName);
            const trimmedLastName = trimString(lastName);

            // Validation
            const fieldErrors = {
                firstName: validateName(trimmedFirstName),
                lastName: validateName(trimmedLastName),
                phone: validatePhone(trimmedPhone)
            }

            if (Object.values(fieldErrors).some(Boolean)) {
                return badRequest({ fieldErrors });
            }

            // Update student values in supabase db
            const { data: student, error } = await supabaseClient
                .from('students')
                .update({ first_name: trimmedFirstName, last_name: trimmedLastName, phone: trimmedPhone })
                .eq('user_id', user.id)
                .select();

            console.log({ student });

            setSuccessMessage(session, "Updated successfully!");
            break;
        }

        case 'email': {
            const email = formData.get('email');

            // Validation
            const fieldErrors = {
                email: validateEmail(email)
            };

            if (Object.values(fieldErrors).some(Boolean)) {
                return badRequest({ fieldErrors });
            }

            // Update email in supabase db
            const { data, error } = await supabaseClient.auth.updateUser({ email });
            // console.log({ data });
            response.status = 302;
            response.headers.set('Location', '/login');
            response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
            if (error) {
                throw new Error(error);
            }
            // TODO: Sign out user
            setSuccessMessage(session, "Check both emails to complete the process");
            // throw await logout(request, session);
            await supabaseClient.auth.signOut();
            return response
            break;
        }
    }
    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

    return { ok: true };
}

export default function EditProfile() {
    const { student } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();

    let [firstName, setFirstName] = useState(student.first_name);
    let [lastName, setLastName] = useState(student.last_name);
    let [phone, setPhone] = useState(student.phone);
    let [email, setEmail] = useState(student.email);

    let hasChanged = !(firstName.toLowerCase() === student.first_name.toLowerCase()
        && lastName.toLowerCase() === student.last_name.toLowerCase()
        && phone === student.phone
    );

    let hasEmailChanged = !(email.toLowerCase() === student.email.toLowerCase())
    const isSubmittingPersonalDetails = navigation.state === 'submitting' && navigation.formData.get('_action') === 'personalDetails';
    const isSubmittingEmail = navigation.state === 'submitting' && navigation.formData.get('_action') === 'email';

    return (
        <div className="pt-12 relative">
            {hasChanged || hasEmailChanged

                ? <div className="fixed top-[85px] md:top-[105px] lg:top-[117px] left-14 lg:left-72 right-0 transition ease-in-out duration-300 bg-brand-black h-10 flex items-center justify-center">
                    <p className="text-white flex gap-4 justify-center">
                        <TriangleAlert /> Unsaved changes
                    </p>
                </div>
                : null
            }
            <h2 className="font-semibold text-lg">Edit profile</h2>
            <div className="mt-4">
                <Form method="post" className="border border-gray-100 xl:max-w-4xl p-4 md:p-8 rounded">
                    <fieldset>
                        <h3 className="font-semibold">Personal details</h3>
                        <Grid>
                            <FormSpacer>
                                <Label htmlFor="firstName" className="capitalize">First name</Label>
                                <Input
                                    key={'firstName'}
                                    type='text'
                                    name='firstName'
                                    id='firstName'
                                    placeholder='John'
                                    defaultValue={student?.first_name}
                                    onChange={(event) => setFirstName(event.target.value)}
                                    className={`focus-visible:ring-brand-blue capitalize transition duration-300 ease-in-out ${actionData?.fieldErrors?.firstName ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.firstName
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.firstName}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    key={'lastName'}
                                    type='text'
                                    name='lastName'
                                    id='lastName'
                                    placeholder='Doe'
                                    defaultValue={student?.last_name}
                                    onChange={(event) => setLastName(event.target.value)}
                                    className={`focus-visible:ring-brand-blue capitalize transition duration-300 ease-in-out ${actionData?.fieldErrors?.lastName ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.lastName
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.lastName}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    key={'phone'}
                                    type='text'
                                    name='phone'
                                    id='phone'
                                    placeholder='0712 345 678'
                                    defaultValue={student?.phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.phone ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.phone
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.phone}</p>
                                    : null
                                }
                            </FormSpacer>
                        </Grid>
                        <div className="flex justify-end">
                            <Button
                                disabled={isSubmittingPersonalDetails || !hasChanged}
                                type="submit"
                                name="_action"
                                value="personalDetails"
                                className="mt-2 bg-brand-orange hover:bg-orange-400 focus:ring-brand-blue transition duration-300 ease-in-out text-brand-black capitalize px-4 py-2">
                                {isSubmittingPersonalDetails ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </fieldset>
                </Form>
                <div className="border border-gray-100 xl:max-w-4xl p-4 md:p-8 mt-4 rounded">
                    <h3 className="font-semibold">Login details</h3>
                    <Form method="post" className="mt-2">
                        <Grid>
                            <FormSpacer>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    key={'email'}
                                    type='email'
                                    name='email'
                                    id='email'
                                    placeholder='name@paragoneschool.com'
                                    defaultValue={student?.email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.email ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.email
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.email}</p>
                                    : null
                                }
                            </FormSpacer>
                        </Grid>
                        <div className="flex justify-end">
                            <Button
                                disabled={isSubmittingEmail || !hasEmailChanged}
                                type="submit"
                                name="_action"
                                value="email"
                                className="mt-2 bg-brand-orange hover:bg-orange-400 focus:ring-brand-blue transition duration-300 ease-in-out text-brand-black capitalize">
                                {isSubmittingEmail ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </Form>
                    <Outlet />

                </div>
            </div>

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
