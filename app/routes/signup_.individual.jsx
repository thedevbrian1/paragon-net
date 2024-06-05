import { Form, Link, isRouteErrorResponse, useActionData, useLoaderData, useNavigation, useRouteError } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { ErrorIllustration, GoogleIcon, SignupIllustration } from "../components/Icon";
import Input from "../components/Input";
import { badRequest, trimString, trimValue, validateEmail, validateName, validatePassword, validatePhone } from "../.server/validation";
import { getSession, sessionStorage, setSuccessMessage } from "../.server/session";
import { createClient } from "../.server/supabase";
import { createStudent } from "~/models/student";
import { useEffect, useRef, useState } from "react";
import { honeypot } from "~/.server/honeypot";
import { SpamError } from "remix-utils/honeypot/server";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import FormSpacer from "~/components/FormSpacer";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { getCounties } from "~/models/county";
import { getGradeByTitle, getGrades } from "~/models/grade";
import { getSubCounties, getSubCountyByTitle } from "~/models/subcounty";


export async function loader({ request }) {
    const session = await getSession(request);
    const [
        { data: grades, headers: gradeHeaders },
        { data: counties, headers: countyHeaders },
        { data: subCounties, headers: subCountyHeaders }
    ] = await Promise.all([
        getGrades(request),
        getCounties(request),
        getSubCounties(request)
    ]);

    const page = Number(new URL(request.url).searchParams.get('page') ?? '1');

    let data;
    if (page === 4) {
        let page3Data = session.get('form-data-page-3') || {};
        let currentPageData = session.get(`form-data-page-${page}`) || {};
        data = { ...page3Data, ...currentPageData };
    } else {
        data = session.get(`form-data-page-${page}`) || {};
    }

    const allHeaders = {
        ...Object.fromEntries(gradeHeaders.entries()),
        ...Object.fromEntries(countyHeaders.entries()),
        ...Object.fromEntries(subCountyHeaders.entries())
    };
    return json({ page, data, grades, counties, subCounties }, {
        headers: allHeaders
    });
}

export async function action({ request, response }) {
    const formData = await request.formData();

    try {
        honeypot.check(formData);
    } catch (error) {
        if (error instanceof SpamError) {
            throw new Response('Form not submitted properly', { status: 400 });
        }
        throw error;
    }

    const { supabaseClient, headers } = createClient(request);

    const session = await getSession(request);

    const action = formData.get('_action');

    const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
    const nextPage = Number(page) + (action === 'next' ? 1 : -1);

    switch (page) {
        case 1: {
            const firstName = trimString(String(formData.get('firstName')));
            const lastName = trimString(String(formData.get('lastName')));
            const phone = formData.get('phone');
            // const gender = formData.get('gender');

            const trimmedPhone = trimValue(phone);

            const fieldErrors = {
                firstName: validateName(firstName),
                lastName: validateName(lastName),
                ...(phone && { phone: validatePhone(trimmedPhone) })
            };
            // break;

            if (action === 'next') {
                if (Object.values(fieldErrors).some(Boolean)) {
                    return badRequest({ fieldErrors });
                }
            }

            const data = { firstName, lastName, phone: trimmedPhone };
            session.set(`form-data-page-${page}`, data);
            break;
        }

        case 2: {
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            // break;

            const fieldErrors = {
                email: validateEmail(email),
                password: validatePassword(password),
                confirmPassword: validatePassword(confirmPassword)
            };

            if (action === 'next') {
                if (Object.values(fieldErrors).some(Boolean)) {
                    return badRequest({ fieldErrors });
                }
                if (password !== confirmPassword) {
                    return badRequest({ formError: 'Passwords do not match' })
                }

                // const data = {email,password};
                // session.set(`form-data-page-${page}`,data);

            }

            const data = { email, password, confirmPassword };
            session.set(`form-data-page-${page}`, data);

            break;
        }

        case 3: {
            const venue = String(formData.get('venue'));

            const data = { venue };
            session.set(`form-data-page-${page}`, data);

            break;
        }

        case 4: {
            const grade = formData.get('grade');

            const data = { grade };
            session.set(`form-data-page-${page}`, data);

            // TODO: Validation
            session.set(`form-data-page-${page}`, data);
            break;
        }

        case 5: {
            const county = String(formData.get('county'));
            const subcounty = String(formData.get('subcounty'));

            const { firstName, lastName, phone } = session.get('form-data-page-1');
            const { email, password } = session.get('form-data-page-2');
            const { venue } = session.get('form-data-page-3');
            const { grade } = session.get('form-data-page-4');

            const data = { county, subcounty };
            session.set(`form-data-page-${page}`, data);

            if (action === 'signup') {
                function getRedirectURL() {
                    if (process.env.NODE_ENV === 'production') {
                        return 'https://paragoneschool.com/courses'
                    } else if (process.env.NODE_ENV === 'development') {
                        return 'http://localhost:3000/courses'
                    }
                }

                // Create user in supabase
                const { data: signupUser, error: signupError } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: getRedirectURL()
                    }
                });

                if (signupError) {
                    throw new Error(signupError);
                }

                // Check if email is used
                if (signupUser && signupUser.user.identities && signupUser.user.identities.length === 0) {
                    return badRequest({ formError: 'Email address already in use. Try another email' });
                }

                const signupUserId = signupUser.user.id;

                // Get the necessary ids
                const [
                    { data: subCounty, headers: subCountyHeaders },
                    { data: gradeRes, headers: gradeHeaders }
                ] = await Promise.all([
                    getSubCountyByTitle(request, subcounty),
                    getGradeByTitle(request, grade)
                ]);

                let learningVenueId;
                if (venue === 'tech-village') {
                    learningVenueId = 1;
                } else if (venue === 'home-school') {
                    learningVenueId = 2;
                }

                const gradeId = gradeRes[0].id;
                const subCountyId = subCounty[0].id;
                response.status = 302;
                response.headers.set('Location', '/signup/individual');
                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                // Create student record in db

                const { data: student, headers } = await createStudent(request, signupUserId, firstName, lastName, phone, gradeId, subCountyId, learningVenueId);

                if (student) {
                    // Clear form session values
                    session.unset('form-data-page-1');
                    session.unset('form-data-page-2');

                    // Show successful signup toast
                    setSuccessMessage(session, 'Check your email to verify it.');
                }
                const allHeaders = {
                    ...headers,
                    ...Object.fromEntries(subCountyHeaders.entries()),
                    ...Object.fromEntries(gradeHeaders.entries()),
                    "Set-Cookie": await sessionStorage.commitSession(session)
                }
                return response;

            }
            break;
        }
    }
    response.status = 302;
    response.headers.set('Location', `?page=${nextPage}`);
    response.headers.append("Set-Cookie", await sessionStorage.commitSession(session));
    return response;
}

// TODO: Streamline the inputs styling
// TODO: Show the correct values for the select when navigating around. Currently when you go back and forth it shows nothing
export default function IndividualSignup() {
    const { page, data, grades, counties, subCounties } = useLoaderData();

    const actionData = useActionData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';
    const isSigningUp = isSubmitting && navigation.formData.get('_action') === 'signup';
    const isGoingNext = isSubmitting && navigation.formData.get('_action') === 'next';
    const isGoingBack = isSubmitting && navigation.formData.get('_action') === 'previous';

    const formRef = useRef();

    const [selectedCounty, setSelectedCounty] = useState('');

    let techVillageGrades;
    if (data?.venue === 'tech-village') {
        techVillageGrades = grades.slice(3);
    }

    let matchedSubCounties;

    if (selectedCounty) {
        let countyId = counties.find(county => county.title === selectedCounty).id;
        matchedSubCounties = subCounties.filter((subCounty) => subCounty.county_id === countyId);
    }

    useEffect(() => {
        if (!isSigningUp) {
            formRef?.current?.reset();
        }
    }, [isSigningUp]);

    return (
        <main className="min-h-screen max-w-4xl mx-auto mt-12 md:mt-0 xl:mt-14 px-8 flex flex-col md:flex-row items-center gap-8 py-12 lg:py-16 text-brand-black">
            <div className="order-2 md:order-1 mt-4 md:mt-0 flex-1 basis-0 w-48 lg:w-full">
                <SignupIllustration />
            </div>
            <div className="order-1 md:order-2 flex-1 basis-0 w-full md:w-auto landscape:max-w-sm space-y-6">
                <Form method="post" ref={formRef} preventScrollReset>
                    <HoneypotInputs />
                    <h1 className="font-semibold text-3xl">Signup</h1>
                    <div className="mt-4">
                        {
                            Number(page) === 1
                                ? <fieldset>
                                    <h2 className="font-semibold">Personal details</h2>
                                    <div>
                                        <label htmlFor="firstName">First Name</label>
                                        <Input
                                            key={'firstName'}
                                            type='text'
                                            name='firstName'
                                            id='firstName'
                                            placeholder='John'
                                            defaultValue={data?.firstName}
                                            fieldError={actionData?.fieldErrors.firstName}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName">Last Name</label>
                                        <Input
                                            key={'lastName'}
                                            type='text'
                                            name='lastName'
                                            id='lastName'
                                            placeholder='Doe'
                                            defaultValue={data?.lastName}
                                            fieldError={actionData?.fieldErrors.lastName}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone">Phone (optional)</label>
                                        <Input
                                            key={'phone'}
                                            type='text'
                                            name='phone'
                                            id='phone'
                                            placeholder='0712 345 678'
                                            defaultValue={data?.phone}
                                            fieldError={actionData?.fieldErrors.phone}
                                        />
                                    </div>
                                    {/* <div>
                                        <legend>Gender</legend>
                                        <div>
                                           
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                id="male"
                                                required
                                                defaultChecked={data?.gender === 'male'}

                                            />
                                            <label htmlFor="male" className="ml-2">Male</label>
                                        </div>
                                        <div>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                id="female"
                                                defaultChecked={data?.gender === 'female'}
                                            />
                                            <label htmlFor="female" className="ml-2">Female</label>
                                        </div>
                                    </div> */}
                                </fieldset>
                                : Number(page) === 2
                                    ? <fieldset>
                                        <h2 className="font-semibold">Create account</h2>
                                        <div>
                                            <label htmlFor="email">Email</label>
                                            <Input
                                                key={'email'}
                                                type='email'
                                                name='email'
                                                id='email'
                                                placeholder='name@gmail.com'
                                                defaultValue={data?.email}
                                                fieldError={actionData?.fieldErrors?.email}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="password">Password</label>
                                            <Input
                                                key={'password'}
                                                type='password'
                                                name='password'
                                                id='password'
                                                defaultValue={data?.password}
                                                fieldError={actionData?.fieldErrors?.password}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword">Confirm Password</label>
                                            <Input
                                                key={'confirm'}
                                                type='password'
                                                name='confirmPassword'
                                                id='confirmPassword'
                                                defaultValue={data?.confirmPassword}
                                                fieldError={actionData?.fieldErrors?.confirmPassword}
                                            />
                                        </div>
                                    </fieldset>
                                    : Number(page) === 3
                                        ? <fieldset>
                                            <h2 className="font-semibold mb-4">Choose your preferred learning venue</h2>
                                            <RadioGroup defaultValue={data?.venue ?? 'tech-village'} name="venue">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="tech-village" id="tech-village" />
                                                    <Label htmlFor="tech-village">Tech village</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="home-school" id="home-school" />
                                                    <Label htmlFor="home-school">Home school</Label>
                                                </div>
                                            </RadioGroup>
                                        </fieldset>
                                        : Number(page) === 4
                                            ? <fieldset>
                                                <h2 className="font-semibold">Current learning level</h2>
                                                <FormSpacer>
                                                    <Label htmlFor='grade'>Choose your current learning level</Label>
                                                    {/* FIXME: Select should only be required when clicking 'next' */}
                                                    <Select name="grade" id='grade' required defaultValue={data?.grade}>
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="--Select grade--" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {data?.venue === 'tech-village'
                                                                ? techVillageGrades.map((grade) => (
                                                                    <SelectItem
                                                                        // key={grade.id}
                                                                        key={crypto.randomUUID()}
                                                                        value={grade.title}
                                                                        className='capitalize'
                                                                    >
                                                                        {grade.title}
                                                                    </SelectItem>
                                                                ))
                                                                :
                                                                grades.map((grade) => (
                                                                    <SelectItem
                                                                        // key={grade.id}
                                                                        key={crypto.randomUUID()}
                                                                        value={grade.title}
                                                                        className='capitalize'
                                                                    >
                                                                        {grade.title}
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </FormSpacer>
                                            </fieldset>
                                            : Number(page) === 5
                                                ? <fieldset>
                                                    <h2 className="font-semibold mb-4">Location</h2>
                                                    <FormSpacer>
                                                        <Label htmlFor='county'>Which county are you in?</Label>
                                                        <Select
                                                            name="county"
                                                            id='county'
                                                            onValueChange={(value) => setSelectedCounty(value)}
                                                            defaultValue={data?.county ?? null}
                                                            required
                                                        >
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder="--Select county--" />
                                                                {/* <SelectValue>
                                                                {data?.county ?? '--Select county--'}
                                                            </SelectValue> */}
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {counties.map((county) => (
                                                                    <SelectItem
                                                                        // key={county.id}
                                                                        key={crypto.randomUUID()}
                                                                        value={county.title}
                                                                    >
                                                                        {county.title}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormSpacer>
                                                    <div className="mt-4">
                                                        {
                                                            selectedCounty
                                                                ? <FormSpacer>
                                                                    <Label htmlFor='subcounty'>Which sub-county are you in?</Label>
                                                                    <Select
                                                                        name="subcounty"
                                                                        id='subcounty'
                                                                        defaultValue={data?.subcounty}
                                                                        required
                                                                    >
                                                                        <SelectTrigger className="w-[180px]">
                                                                            <SelectValue placeholder="--Select sub-county--" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {matchedSubCounties.map((subCounty) => (
                                                                                <SelectItem
                                                                                    key={crypto.randomUUID()}
                                                                                    // key={subCounty.id}
                                                                                    value={subCounty.title}
                                                                                >
                                                                                    {subCounty.title}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormSpacer>
                                                                : null
                                                        }
                                                    </div>
                                                </fieldset>
                                                : null
                        }

                        <div className="flex justify-end gap-x-4">
                            {(Number(page) > 1) && (
                                <button
                                    type="submit"
                                    name="_action"
                                    value="previous"
                                    className="bg-transparent border border-brand-orange hover:bg-orange-100 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2">
                                    {isGoingBack ? 'Processing...' : 'Previous'}
                                </button>
                            )}
                            {(Number(page) < 5) && (
                                <button
                                    type="submit"
                                    name="_action"
                                    value="next"
                                    className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2">
                                    {isGoingNext ? 'Processing...' : 'Next'}
                                </button>
                            )}
                            {(Number(page) === 5) && (
                                <button
                                    type="submit"
                                    name="_action"
                                    value="signup"
                                    className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2">
                                    {isSigningUp ? 'Processing...' : 'Sign up'}
                                </button>
                            )}
                        </div>
                    </div>
                    {actionData?.formError
                        ? <p className="mt-2 text-red-600 transition ease-in-out duration-300">{actionData.formError}</p>
                        : null
                    }

                </Form>
                <div className="relative">
                    <div className="before:flex-1 before:h-0.5 before:mt-0.5 before:mr-3 before:bg-slate-200 flex justify-center items-center after:flex-1 after:h-0.5 after:bg-slate-200 after:mt-0.5 after:ml-3">
                        <p className="">or</p>
                    </div>
                </div>

                <div className="flex justify-center border border-slate-300 rounded py-3">
                    <div className="flex gap-2 items-center">
                        <div className="w-5 h-5 text-[#8e8f92]">
                            <GoogleIcon />
                        </div>
                        {/* TODO: Google auth */}
                        Sign up with Google
                    </div>
                </div>
                <div>
                    <Link
                        to="/login"
                        prefetch="intent"
                        className="underline hover:text-blue-500"
                    >
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
        </main>
    );
}

function RadioInput({ name, value, id }) {
    return (
        <input
            type="radio"
            name={name}
            value={value}
            id={id}
            required
        />
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
                        <div className="w-60 lg:w-72">
                            <ErrorIllustration />
                        </div>
                        <h1 className="text-3xl font-semibold mt-4">{error.status} {error.statusText}</h1>
                        <p>{error.data}</p>
                    </div>
                    <Link to='.' className="underline text-brand-black">
                        Try again
                    </Link>
                </div>
            </div>
        );
    } else if (error instanceof Error) {
        console.log({ error });
        return (
            <div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <div className="w-60 lg:w-72">
                            <ErrorIllustration />
                        </div>
                        <h1 className="text-3xl font-semibold mt-4">Error</h1>
                        <p>{error.message}</p>
                    </div>
                    <Link to="." className="underline text-brand-black">
                        Try again
                    </Link>
                </div>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}





// Check if email is in use
// const res = await fetch('https://mail.zoho.com/api/organization/833073661/accounts', {
//     headers: {
//         Authorization: 'Zoho-oauthtoken 1000.0b1fb98319876748886ebf5d7d2b1def.2b18588290c7c31615b76066d52f7a81'
//     }
// });
// const results = await res.json();
// const emails = results.data.map(email => email.primaryEmailAddress);
// console.log({ emails });
// if (emails.includes(email)) {
//     return badRequest({ formError: 'Email address already in use. Try another email' });
// }

// Create email address in zoho
// const body = JSON.stringify({
//     primaryEmailAddress: email,
//     password,
//     displayName: `${firstName} ${lastName}`,
//     role: 'member',
//     country: 'ke',
//     language: 'En',
// });

// const postres = await fetch('https://mail.zoho.com/api/organization/833073661/accounts', {
//     method: "POST",
//     headers: {
//         Authorization: 'Zoho-oauthtoken 1000.0b1fb98319876748886ebf5d7d2b1def.2b18588290c7c31615b76066d52f7a81',
//         "Content-Type": "application/json"
//     },
//     body
// });
// const addr = await postres.json();
// console.log({ addr });