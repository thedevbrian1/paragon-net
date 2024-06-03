import { Form, isRouteErrorResponse, useActionData, useLoaderData, useLocation, useNavigation, useRouteError, useSearchParams, useSubmit } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useEffect, useRef } from "react";
import { useEventSource } from "remix-utils/sse/react";
import { createClient, requireUser } from "../.server/supabase";
import Input from "../components/Input";
import { badRequest, trimValue, } from "../.server/validation";
import { getSession, sessionStorage, setSuccessMessage } from "../.server/session";
import { ExclamationIcon } from "../components/Icon";
import LinkButton from "../components/LinkButton";
import { createTransaction, getTransactionByCode } from "~/models/transaction";
import { getStudentByUUID } from "~/models/student";
import { enrolCourse } from "~/models/enrolment";
import { getCourseIds } from "~/models/course";

let steps = ['Payment', 'Enroll'];

export async function loader({ request, response }) {
    let { user, headers } = await requireUser(request);
    // console.log({ user });

    // Redirect to courses if there are no searchparams

    let url = new URL(request.url);
    let searchParams = url.searchParams;

    let id = searchParams.get('id');
    let title = searchParams.get('title');

    if (!id || !title) {
        response.status = 302;
        response.headers.set('Location', '/courses');
        throw response;
    }

    let session = await getSession(request);
    let page = Number(new URL(request.url).searchParams.get('page') ?? '1');


    // TODO: Supabase error handling

    let data;
    if (page < 4) {
        data = session.get(`form-data-page-${page}`) ?? {};
    }

    // console.log({ data });

    return { page, data };
}

export async function action({ request, response }) {
    let { supabaseClient, headers } = createClient(request);

    let session = await getSession(request);

    let formData = await request.formData();
    let action = formData.get('_action');


    let page = Number(new URL(request.url).searchParams.get('page') ?? '1');
    let nextPage = Number(page) + 1;

    let url = new URL(request.url);
    let searchParams = url.searchParams;

    switch (page) {
        case 1: {
            // Payment

            if (action === 'recordTransaction') {
                // Record transaction in the database if the number returned from Safaricom matches the one that did the request

                let mpesaCode = formData.get('mpesaCode');
                let amount = formData.get('amount');
                let transactionPhone = formData.get('transactionPhone');


                let formDataPage1 = session.get('form-data-page-1');
                let clientPhone = formDataPage1?.mpesa;
                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                // Record entries only if the returned number is equal to the number provided
                if (mpesaCode && transactionPhone === clientPhone) {
                    console.log('Phone numbers match!!!');

                    let { data: student, headers: studentHeaders } = await getStudentByUUID(request);
                    let { status, headers: transactionHeaders } = await createTransaction(request, mpesaCode, amount, student[0].id);

                    if (status === 201) {
                        setSuccessMessage(session, 'Transaction was successful');
                    }

                    searchParams.set('page', nextPage);

                    session.set('mpesaCode', mpesaCode);

                    let allHeaders = {
                        ...Object.fromEntries(transactionHeaders.entries()),
                        ...Object.fromEntries(studentHeaders.entries()),
                        "Set-Cookie": await sessionStorage.commitSession(session)
                    };
                    response.status = 302;
                    response.headers.set('Location', `${url.href}`);
                    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                    return response;
                }

                return { ok: true };
            }

            // Initiate stk push from the client's phone
            let mpesa = formData.get('mpesa');
            let trimmedPhone = trimValue(mpesa);

            let fieldErrors = {
                mpesa: validatePhone(trimmedPhone)
            };

            if (action === 'next') {
                if (Object.values(fieldErrors).some(Boolean)) {
                    return badRequest({ fieldErrors });
                }

                //////////////////////////////////////////////////////////////////////////////////////////
                // TODO: Test using live api
                // 
                //  Handle mpesa payment
                // Steps to handle payment
                // 1 Generate access token if one hour has passed
                // 2 Initiate stk push
                // 3 Show successful prompt message
                // 4 Record transaction in the database
                // 
                //////////////////////////////////////////////////////////////////////////////////////////


                // Generate access token
                let accessTokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
                    method: 'GET',
                    headers: {
                        Authorization: `Basic ${btoa(`${process.env.SAFARICOM_CONSUMER_KEY}:${process.env.SAFARICOM_SECRET_KEY}`)}`
                    }
                });
                let token = await accessTokenRes.json();
                let accessToken = token.access_token;

                // Initiate stk push
                let modifiedPhone = null;
                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
                if (trimmedPhone.length === 10) {
                    modifiedPhone = trimmedPhone.replace(0, "254");
                } else if (trimmedPhone.length === 13) {
                    modifiedPhone = trimmedPhone.substring(1);
                } else {
                    modifiedPhone = trimmedPhone;
                }

                let date = new Date();
                let dateString = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
                let now = date.toLocaleTimeString([], { hour12: false });
                let timeStamp = String(dateString + now).replace(/\D+/g, '');


                let passwordString = '174379' + 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919' + timeStamp;

                let encodedPassword = Buffer.from(passwordString).toString('base64');

                let res = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        "BusinessShortCode": 174379,
                        "Password": encodedPassword,
                        "Timestamp": timeStamp,
                        "TransactionType": "CustomerPayBillOnline",
                        "Amount": 1,
                        "PartyA": modifiedPhone,
                        "PartyB": 174379,
                        "PhoneNumber": modifiedPhone,
                        "CallBackURL": "https://thick-jobs-fail.loca.lt/saf",
                        "AccountReference": "Paragon",
                        "TransactionDesc": "Course Payment"
                    })
                });

                let resBody = await res.json();
                if (resBody.errorCode) {
                    throw new Error(resBody.errorMessage);
                }

                // Show success prompt message
                if (resBody.ResponseCode === '0') {
                    setSuccessMessage(session, "Request initiated. Check your phone to complete the request");
                }

                // Set the number to the session

                let data = { mpesa: modifiedPhone };
                session.set(`form-data-page-${page}`, data);

                return { ok: true };
            }
        }
        case 2: {
            /////////////////////////////////////////////////////////////////////////////////////////
            // Steps to enrol
            // 
            // 1) Check if course is valid
            // 2) Check if the mpesa code exists in the database
            // 3) If it does, check if the course id is valid
            // 4) If it does not exist show a toast showing that the payment cannot be found
            // 5) Redirect to schedule
            // 
            /////////////////////////////////////////////////////////////////////////////////////////

            // Check if course is valid
            let courseId = searchParams.get('id');
            let courses = await getCourseIds();
            response.status = 302;
            response.headers.set('Location', '/schedule');
            response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
            let courseIds = courses.result.map(course => course._id);

            if (!courseIds.includes(courseId)) {
                throw new Response('Course not found', {
                    status: 404,
                    statusText: 'Not Found'
                });
            }

            // Check if the mpesa code esists in the database
            let mpesaCode = session.get('mpesaCode');
            let { data: transaction, headers: transactionHeaders } = await getTransactionByCode(request, mpesaCode);

            // Enrol if the transaction exists
            if (transaction.length === 0) {
                throw new Response('Transaction not found!', {
                    status: 404,
                    statusText: 'Not Found'
                });
            }

            let { data: student, headers: studentHeaders } = await getStudentByUUID(request);
            let studentId = student[0].id;

            let { data: enrolment, headers: enrolmentHeaders } = await enrolCourse(request, studentId, courseId);

            setSuccessMessage(session, "Enrolled successfully!");
            session.unset('form-data-page-1');

            let allHeaders = {
                ...Object.fromEntries(transactionHeaders.entries()),
                ...Object.fromEntries(studentHeaders.entries()),
                ...Object.fromEntries(enrolmentHeaders.entries()),
                "Set-Cookie": await sessionStorage.commitSession(session)

            }
            return response;
        }
        case 4: {
            // Clear the input fields from the session
            session.unset('form-data-page-1');
            session.unset('form-data-page-2');
            response.status = 302;
            response.headers.set('Location', '/schedule');
            response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
            session.unset('form-data-page-3');
            return response;
        }

    }
    response.status = 302;
    response.headers.set('Location', `?page=${nextPage}`);
    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

    return response;
}

export default function Enroll() {
    let { page, data } = useLoaderData();
    // console.log({ data });

    let actionData = useActionData();
    let navigation = useNavigation();
    let isSubmitting = navigation.state === 'submitting';

    let firstNameRef = useRef(null);
    let lastNameRef = useRef(null);
    let phoneRef = useRef(null);
    let mpesaRef = useRef(null);
    let emailRef = useRef(null);
    let passwordRef = useRef(null);
    let confirmPasswordRef = useRef(null);

    let [searchParams] = useSearchParams();
    let title = searchParams.get('title');
    let courseId = searchParams.get('id');


    let submit = useSubmit();
    // let message = 'NLJ7RT61SV';
    let message = useEventSource("/sse");
    let transaction = JSON.parse(message);

    useEffect(() => {
        if (message) {
            submit({
                mpesaCode: transaction.code,
                amount: transaction.amount,
                transactionPhone: transaction.phone,
                _action: 'recordTransaction'
            },
                { method: "post" }
            );
        }
    }, [message]);

    return (
        <main className="max-w-3xl lg:max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-brand-black">
            <div className="border border-gray-100 mt-8 lg:mt-24 p-8 rounded">
                <h1 className="font-bold text-xl">Enroll for course ({title})</h1>
                <div className="flex gap-4 mt-2">
                    {steps.map((step, index) => (
                        <span
                            key={index}
                            className={`${index + 1 === Number(page) ? 'text-brand-orange' : ''}`}
                        >{index + 1}) {step}</span>
                    ))}
                </div>
                <Form method="post" className="mt-4">
                    {Number(page) === 1
                        ? (
                            <fieldset>
                                <h2 className="font-semibold">Payment</h2>
                                <div>
                                    <label htmlFor="mpesa">MPESA number</label>
                                    <Input
                                        type="text"
                                        name="mpesa"
                                        id="mpesa"
                                        placeholder="0712 345 678"
                                        defaultValue={data?.mpesa}
                                        fieldError={actionData?.fieldErrors?.mpesa}
                                        ref={mpesaRef}
                                    />
                                </div>
                            </fieldset>
                        )
                        : Number(page) === 2
                            ? (
                                <fieldset>
                                    <h2 className="font-semibold">Enroll course</h2>
                                    <p>You will be enrolled in the course {title}</p>
                                    <button
                                        type="submit"
                                        name="_action"
                                        value="enroll"
                                        className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2 mt-4"
                                    >
                                        {isSubmitting ? 'Enrolling...' : 'Enroll course'}
                                    </button>
                                </fieldset>
                            )
                            : null
                    }
                    <div>
                        {actionData?.formError
                            ? (<p className="text-red-500">{actionData.formError}</p>)
                            : null
                        }
                    </div>
                    <div className="flex justify-end gap-x-4">
                        {/* {(Number(page) > 1 && Number(page) < 4) && (
                        <button
                            type="submit"
                            name="_action"
                            value="previous"
                            className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2">
                            {isSubmitting ? 'Processing...' : 'Previous'}
                        </button>
                    )} */}
                        {(Number(page) === 1) && (
                            <button
                                type="submit"
                                name="_action"
                                value="next"
                                className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2">
                                {isSubmitting ? 'Processing...' : 'Next'}
                            </button>
                        )}
                        {/* {(Number(page) === 4) && (
                        <button
                            type="submit"
                            name="_action"
                            value="finish"
                            className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2">
                            {isSubmitting ? 'Processing...' : 'Finish'}
                        </button>
                    )} */}
                    </div>
                </Form>


            </div>
        </main>
    );
}

export function ErrorBoundary() {
    let error = useRouteError();

    let location = useLocation();
    // let searchParams = new URLSearchParams(location.search);

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
                    {
                        location.search
                            ? <LinkButton text='Try again' href={`${location.pathname}${location.search}`} size='sm' />
                            : <LinkButton text='Try again' href={`${location.pathname}`} size='sm' />
                    }
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
                    {
                        location.search
                            ? <LinkButton text='Try again' href={`${location.pathname}${location.search}`} size='sm' />
                            : <LinkButton text='Try again' href={`${location.pathname}`} size='sm' />
                    }
                </div>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}
