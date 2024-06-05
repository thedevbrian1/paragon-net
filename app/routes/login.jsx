import { Form, Link, isRouteErrorResponse, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import { ExclamationIcon, GoogleIcon, SignupIllustration } from "../components/Icon";
import Input from "../components/Input";
import LinkButton from "../components/LinkButton";
import { badRequest, validateEmail, validatePassword } from "../.server/validation";
import { getSession, sessionStorage, setSuccessMessage } from "../.server/session";
import { createClient } from "../.server/supabase";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { honeypot } from "~/.server/honeypot";
import { SpamError } from "remix-utils/honeypot/server";

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

    const email = formData.get('email');
    const password = formData.get('password');

    const fieldErrors = {
        email: validateEmail(email),
        password: validatePassword(password)
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }
    const { data: signinUser, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    // console.log({ signinUser });

    if (error) {
        throw new Error(error);
    }

    setSuccessMessage(session, "Logged in successfully!");

    // const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

    response.status = 302;
    for (let [key, value] of headers.entries()) {
        response.headers.append(key, value);
    }

    response.headers.append("Set-Cookie", await sessionStorage.commitSession(session))

    if (signinUser.user.email === process.env.ADMIN_EMAIL || signinUser.user.email === process.env.ADMIN_EMAIL_2) {
        response.headers.set('Location', '/admin');
        // throw response;
        return response;
    }
    response.status = 302;
    response.headers.set('Location', '/dashboard');
    // throw response;
    return response;
}

export default function Login() {
    const actionData = useActionData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

    return (
        <main className="min-h-screen max-w-4xl mx-auto mt-12 md:mt-0 xl:mt-14 px-8 flex flex-col md:flex-row items-center gap-8 py-12 lg:py-16 text-brand-black">
            <div className="order-2 md:order-1 mt-4 md:mt-0 flex-1 basis-0 w-48 lg:w-full">
                <SignupIllustration />
            </div>
            <div className="order-1 md:order-2 flex-1 basis-0 w-full md:w-auto landscape:max-w-sm space-y-6">
                <Form method="post" >
                    <HoneypotInputs />
                    <h1 className="font-semibold text-3xl">Login</h1>
                    <fieldset className="mt-4">
                        <div>
                            <label htmlFor="email">Email</label>
                            <Input
                                type='email'
                                name='email'
                                id='email'
                                placeholder='johndoe@email.com'
                                fieldError={actionData?.fieldErrors?.email}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <Input
                                type='password'
                                name='password'
                                id='password'
                                fieldError={actionData?.fieldErrors?.password}
                            />
                        </div>
                        <div className="flex justify-between">
                            {/* TODO: Remember me */}
                            <div className="flex gap-1">
                                <Input
                                    type="checkbox"
                                    name="remember"
                                    id="remember"
                                />
                                <label htmlFor="remember" className="whitespace-nowrap">Remember me</label>
                            </div>
                            {/* TODO: Forgot password */}
                            <Link to="/forgot-password" className="focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-orange transition ease-in-out duration-300 hover:text-blue-500 underline">Forgot password</Link>
                        </div>
                        <button
                            type="submit"

                            className="mt-4 bg-brand-orange hover:bg-orange-400 transition duration-300 ease-in-out text-black rounded capitalize px-5 py-3 w-full">
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </button>
                    </fieldset>
                </Form>

                <div className="before:flex-1 before:h-0.5 before:mt-0.5 before:mr-3 before:bg-slate-200 flex justify-center items-center after:flex-1 after:h-0.5 after:bg-slate-200 after:mt-0.5 after:ml-3">
                    <p className="">or</p>
                </div>

                <div className="flex justify-center border border-slate-300 rounded py-3">
                    <div className="flex gap-2 items-center">
                        <div className="w-5 h-5 text-[#8e8f92]">
                            <GoogleIcon />
                        </div>
                        {/* TODO: Google auth */}
                        Log in with Google
                    </div>
                </div>
                <div>
                    <Link
                        to="/signup"
                        prefetch="intent"
                        className="underline hover:text-blue-500"
                    >
                        Don't have an account? Sign up
                    </Link>
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