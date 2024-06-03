import { Form, isRouteErrorResponse, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import Input from "../components/Input";
import { badRequest, trimValue, validateEmail, validateMessage, validateName, validatePhone } from "../.server/validation";
import { ExclamationIcon, Phone } from "../components/Icon";
import LinkButton from "../components/LinkButton";
import { redirect } from "@remix-run/node";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { honeypot } from "~/.server/honeypot";
import { SpamError } from "remix-utils/honeypot/server";
import { institutionSignupRequest } from "~/.server/email";

export async function action({ request, response }) {
    const formData = await request.formData();
    try {
        honeypot.check(formData);
    } catch (error) {
        if (error instanceof SpamError) {
            console.log({ error });
            throw new Response('Form not submitted properly', { status: 400 });
        }
        throw error;
    }
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const institution = formData.get('institution');
    const message = formData.get('message');

    // throw new Error('Kaboom!!');

    const fieldErrors = {
        name: validateName(name),
        email: validateEmail(email),
        phone: validatePhone(trimValue(phone)),
        institution: validateName(institution),
        message: validateMessage(message)
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }

    // const res = await sendEmail(name, email, phone, message, institution);
    // if (res.status === 200) {
    //     return redirect('/success');
    // }
    const { data } = await institutionSignupRequest(name, email, phone, institution, message);
    console.log({ data });
    if (data) {
        response.status = 302;
        response.headers.set('Location', '/success');
        response;
    }
    return null;
}

export default function InstitutionSignup() {
    const actionData = useActionData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

    return (
        <main className="bg-[url('/institution.jpg')] bg-cover bg-center bg-no-repeat bg-black bg-opacity-70 bg-blend-overlay w-full">
            <div className="px-6 xl:px-0 lg:max-w-4xl mx-auto text-gray-200 py-20">
                <h1 className="font-semibold text-3xl text-center">Contact us to enroll your institution</h1>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div>
                        <div className="flex flex-col items-center">
                            <h2 className="font-semibold text-xl">Give us a call</h2>
                            <div className="w-14 md:w-20 mt-4">
                                <Phone />
                            </div>
                            <p>0792 717 119</p>
                        </div>
                    </div>
                    <Form method="post">
                        <h2 className="font-semibold text-xl">Send us a message</h2>
                        <fieldset className="mt-4">
                            <HoneypotInputs />
                            <div>
                                <label htmlFor="name">Your name</label>
                                <Input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="John Doe"
                                    fieldError={actionData?.fieldErrors?.name}
                                />
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <Input
                                    type="text"
                                    name="email"
                                    id="email"
                                    placeholder="johndoe@email.com"
                                    fieldError={actionData?.fieldErrors?.email}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone">Phone</label>
                                <Input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    placeholder="0712 345 678"
                                    fieldError={actionData?.fieldErrors?.phone}
                                />
                            </div>
                            <div>
                                <label htmlFor="institution">Institution name</label>
                                <Input
                                    type="text"
                                    name="institution"
                                    id="institution"
                                    placeholder="Aga Khan academy"
                                    fieldError={actionData?.fieldErrors?.institution}
                                />
                            </div>
                            <div>
                                <label htmlFor="message">Message</label>
                                <Input
                                    type="textarea"
                                    name="message"
                                    id="message"
                                    placeholder="Enter your message here..."
                                    fieldError={actionData?.fieldErrors?.message}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2 w-full">
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </fieldset>
                    </Form>
                </div>
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