import { Form, redirect, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import FormSpacer from "~/components/FormSpacer";
import { Grid } from "~/components/Grid";
import { EyeIcon, EyeslashIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
// import Input from "~/components/Input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { getCourses } from "~/models/course";
import { getSession, sessionStorage, setSuccessMessage } from "~/.server/session";
import { createClient } from "~/.server/supabase";
import { badRequest, trimValue, validateEmail, validateName, validatePassword, validatePhone } from "~/.server/validation";

export const meta = () => {
    return [
        { title: "Add student | Paragon e-School" },
    ];
};

export async function loader() {
    const courses = await getCourses();
    return courses.result;
}

export async function action({ request, response }) {
    const session = await getSession(request);

    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const phone = formData.get('phone');
    const course = String(formData.get('course'));

    const trimmedPhone = trimValue(phone);
    const fieldErrors = {
        email: validateEmail(email),
        password: validatePassword(password),
        firstName: validateName(firstName),
        lastName: validateName(lastName),
        phone: validatePhone(trimmedPhone)
    }

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }


    const { supabaseClient, headers } = createClient(request);

    function getRedirectURL() {
        if (process.env.NODE_ENV === 'production') {
            return 'https://paragoneschool.com/courses'
        } else if (process.env.NODE_ENV === 'development') {
            return 'http://localhost:3000/courses'
        }
    }
    // Steps to enrol a student
    // 1.Create user in supabase
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

    // 2.Create student record in db
    const { data: student, error: studentError } = await supabaseClient
        .from('students')
        .insert([
            {
                first_name: firstName.toLowerCase(),
                last_name: lastName.toLowerCase(),
                phone: trimmedPhone,
                user_id: signupUser.user.id,
                // gender
            }
        ])
        .select();

    const studentId = student[0].id;

    if (studentError) {
        throw new Error(studentError);
    }
    response.status = 302;
    response.headers.set('Location', `/admin/students/${studentId}`);
    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

    // 3.Create enrolment record
    const { data: enrolment, error: enrolmentError } = await supabaseClient
        .from('enrolments')
        .insert([
            { student_id: studentId, course_id: course }
        ])
        .select();

    if (enrolmentError) {
        throw new Error(enrolmentError);
    }

    setSuccessMessage(session, 'Created successfully!');

    const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) }
    // return null;
    return response;
}

export default function NewStudent() {
    const courses = useLoaderData();

    const actionData = useActionData();
    const navigation = useNavigation();
    const isSigningUp = navigation.state === 'submitting';

    const [isShowingPassword, setIsShowingPassword] = useState(false);

    // TODO: Separate enrol student from sign up student
    // Select a student to enrol from the available students. If the student is not present, sign them up first then enrol a course

    return (
        <div className="mt-8 lg:mt-12 max-w-4xl">
            <h2 className="font-semibold text-lg">Enrol student</h2>
            <Form method="post" className="mt-4 space-y-4">
                <fieldset>
                    <legend className="font-semibold">Account details</legend>
                    <Grid>
                        <FormSpacer>
                            <label htmlFor="email">Email</label>
                            <Input
                                key={'email'}
                                type='email'
                                name='email'
                                id='email'
                                placeholder='name@gmail.com'
                                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.email ? 'border border-red-500' : ''}`}

                            />
                            {actionData?.fieldErrors?.email
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.email}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <label htmlFor="password">Password</label>
                            <Input
                                key={'password'}
                                type={isShowingPassword ? 'text' : 'password'}
                                name='password'
                                id='password'
                                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.password ? 'border border-red-500' : ''}`}
                            />
                            <span
                                className="flex gap-1 cursor-pointer text-sm"
                                onClick={() => setIsShowingPassword(!isShowingPassword)}>{isShowingPassword
                                    ? (
                                        <><EyeslashIcon />Hide password</>)
                                    : (<><EyeIcon />Show password</>)
                                }</span>
                            {actionData?.fieldErrors?.password
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.password}</p>
                                : null
                            }
                        </FormSpacer>
                    </Grid>
                </fieldset>
                <fieldset className="">
                    <legend className="font-semibold">Personal info</legend>
                    <Grid>
                        <FormSpacer>
                            <label htmlFor="firstName">First Name</label>
                            <Input
                                key={'firstName'}
                                type='text'
                                name='firstName'
                                id='firstName'
                                placeholder='John'
                                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.firstName ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.firstName
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.firstName}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <label htmlFor="lastName">Last Name</label>
                            <Input
                                key={'lastName'}
                                type='text'
                                name='lastName'
                                id='lastName'
                                placeholder='Doe'
                                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.lastName ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.lastName
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.lastName}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <label htmlFor="phone">Phone</label>
                            <Input
                                key={'phone'}
                                type='text'
                                name='phone'
                                id='phone'
                                placeholder='0712 345 678'
                                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.phone ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.phone
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.phone}</p>
                                : null
                            }
                        </FormSpacer>
                    </Grid>

                </fieldset>
                <fieldset>
                    <legend className="font-semibold">Course</legend>
                    <Label htmlFor='course'>Choose a course</Label>
                    <Select name="course" id='course' className="">
                        <SelectTrigger className="w-[180px] focus-visible:ring-brand-blue mt-2 transition duration-300 ease-in-out">
                            <SelectValue placeholder="--Select Course--" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(course => (
                                <SelectItem key={course._id} value={course._id}>{course.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </fieldset>
                <Button
                    type="submit"
                    name="_action"
                    value="signup"
                    className="bg-brand-orange hover:bg-orange-400 focus-visible:ring-brand-blue transition duration-300 ease-in-out capitalize text-brand-black">
                    {isSigningUp ? 'Processing...' : 'Enroll'}
                </Button>
                {actionData?.formError
                    ? <p className="mt-2 text-red-600 transition ease-in-out duration-300">{actionData.formError}</p>
                    : null
                }
            </Form>
        </div>
    );
}