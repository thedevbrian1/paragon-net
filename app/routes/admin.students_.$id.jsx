import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import FormSpacer from "~/components/FormSpacer";
import { Grid } from "~/components/Grid";
import { ArrowLeftIcon, PlusIcon, XIcon } from "~/components/Icon";
import { Legend } from "~/components/Legend";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getCounties } from "~/models/county";
import { getCourseById, getCourses } from "~/models/course";
import { enrolCourse, getPersonalEnrolments, unenrolCourse } from "~/models/enrolment";
import { deleteStudent, getStudentById, updateStudent } from "~/models/student";
import { getSubCounties, getSubCountyByTitle } from "~/models/subcounty";
import { getSession, sessionStorage, setSuccessMessage } from "~/.server/session";
import { useDoubleCheck } from "~/utils";
import { badRequest, trimValue, validateName, validatePhone } from "~/.server/validation";
import { updateLocation } from "~/models/location";
import { TriangleAlert } from "lucide-react";

export const meta = ({ data }) => {
    return [
        { title: `Student ${data.student[0].first_name} ${data.student[0].last_name} | Paragon e-School` },
    ];
};

export async function loader({ request, params, response }) {
    const studentId = Number(params.id);

    const session = await getSession(request);

    const [
        { data: student, headers: studentHeaders },
        { data: courseIds, headers: enrolHeaders },
        res,
        { data: counties, headers: countyHeaders },
        { data: subCounties, headers: subCountyHeaders }
    ] = await Promise.all([
        getStudentById(request, Number(params.id)),
        getPersonalEnrolments(request, studentId),
        getCourses(),
        getCounties(request),
        getSubCounties(request)
    ]);

    const allCourses = res.result.map(course => {
        return {
            id: course._id,
            title: course.title
        }
    });

    const courses = await Promise.all(
        courseIds.map(async (course) => {
            let res = await getCourseById(course.course_id);
            let courseObj = {
                id: res.result[0]._id,
                enrolmentId: course.id,
                title: res.result[0].title,
                imageSrc: res.result[0].mainImage.asset.url
            }
            return courseObj;
        })
    );

    // const allHeaders = {
    //     ...Object.fromEntries(studentHeaders.entries()),
    //     ...Object.fromEntries(enrolHeaders.entries()),
    //     ...Object.fromEntries(countyHeaders.entries()),
    //     ...Object.fromEntries(subCountyHeaders.entries()),
    //     "Set-Cookie": await sessionStorage.commitSession(session)
    // }
    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

    return { student, courses, allCourses, counties, subCounties };

}

export async function action({ request, params, response }) {
    const studentId = Number(params.id);

    const session = await getSession(request);
    const formData = await request.formData();
    const action = formData.get('_action');

    switch (action) {
        case 'save': {
            let firstName = formData.get('firstName');
            let lastName = formData.get('lastName');
            let phone = formData.get('phone');
            let county = String(formData.get('county'));
            let subcounty = String(formData.get('subcounty'));

            let trimmedPhone = trimValue(phone);
            // validation
            let fieldErrors = {
                firstName: validateName(firstName),
                lastName: validateName(lastName),
                phone: validatePhone(trimmedPhone)
            }

            if (Object.values(fieldErrors).some(Boolean)) {
                return badRequest({ fieldErrors });
            }

            // Check if the value has been modified. If so, update the value in the db
            let { data: student } = await getStudentById(request, Number(params.id));


            // If the students' details have changed, update them
            let updateObj = {};

            if (firstName.toLowerCase() !== student[0].first_name.toLowerCase()) {
                updateObj.first_name = firstName;
            }
            if (lastName.toLowerCase() !== student[0].last_name.toLowerCase()) {
                updateObj.last_name = lastName;
            }
            if (trimmedPhone !== student[0].phone) {
                updateObj.phone = trimmedPhone;
            }

            if ((firstName.toLowerCase() !== student[0].first_name.toLowerCase())
                || (lastName.toLowerCase() !== student[0].last_name.toLowerCase())
                || (trimmedPhone !== student[0].phone)
            ) {
                let { data, headers } = await updateStudent(request, studentId, updateObj);
                if (data) {
                    setSuccessMessage(session, 'Updated successfully!');
                    // const allHeaders = {
                    //     ...Object.fromEntries(headers.entries()),
                    //     ...Object.fromEntries(subCountyHeaders.entries()),
                    //     "Set-Cookie": await sessionStorage.commitSession(session)
                    // };
                    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                    return { ok: true };
                }
            }

            // Get location id
            // Get sublocation id
            // Update location values if they have changed
            if ((student[0].locations?.subcounties?.counties?.title.toLowerCase() !== county.toLowerCase())
                || (student[0].locations?.subcounties?.title)
            ) {
                let { data } = await getSubCountyByTitle(request, subcounty);

                let subcountyId = data[0].id;
                let locationId = student[0].location_id;

                let { status } = await updateLocation(request, locationId, subcountyId);

                if (status === 200) {
                    setSuccessMessage(session, "Updated successfully!");
                    response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                    return { ok: true };
                }
            }
            break;
        }
        case 'unenrol': {
            const enrolmentId = formData.get('enrolmentId');

            const { status, headers } = await unenrolCourse(request, enrolmentId);

            if (status === 204) {
                setSuccessMessage(session, 'Unenrolled successfully!');
                const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };
                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                return { ok: true }
            }
            break;
        }
        case 'enrol-new-course': {
            const course = String(formData.get('course'));
            // return null;
            // Validation
            const fieldErrors = {
                course: validateName(course)
            };
            if (Object.values(fieldErrors).some(Boolean)) {
                return badRequest({ fieldErrors });
            }

            // Check if they are already enrolled in that course
            const { data: courses, headers: enrolHeaders } = await getPersonalEnrolments(request, studentId);
            const courseIds = courses.map(course => course.course_id);

            if (courseIds.includes(course)) {
                return badRequest({ formError: 'Course already enrolled' });
            } else {
                // Create an enrolment entry to the db
                const { data, headers } = await enrolCourse(request, studentId, course);
                if (data) {
                    setSuccessMessage(session, 'Created successfully!');
                }
                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
                const allHeaders = {
                    ...Object.fromEntries(headers.entries()),
                    ...Object.fromEntries(enrolHeaders.entries()),
                    "Set-Cookie": await sessionStorage.commitSession(session)
                }
                return { ok: true };
            }
        }
        case 'delete': {
            const { status, headers } = await deleteStudent(request, studentId);
            if (status === 204) {
                setSuccessMessage(session, 'Deleted successfully!');

                const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };
                response.status = 302;
                response.headers.set('Location', '/admin/students');
                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                return response;
            }
        }
    }
    return null;
}

export default function Student() {
    const { student, courses, allCourses, counties, subCounties } = useLoaderData();

    const actionData = useActionData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

    const isEnrollingNewCourse = isSubmitting && navigation.formData.get('_action') === 'enrol-new-course';

    const [isEnrolling, setIsEnrolling] = useState(false);
    const doubleCheckDelete = useDoubleCheck();

    let newCourseRef = useRef(null);

    let [firstName, setFirstName] = useState(student[0].first_name);
    let [lastName, setLastName] = useState(student[0].last_name);
    let [phone, setPhone] = useState(student[0].phone);
    let [county, setCounty] = useState(student[0].locations?.subcounties?.counties?.title);
    let [subcounty, setSubcounty] = useState(student[0].locations?.subcounties?.title);

    // FIXME: Show a default subcounty when one changes counties

    let matchedSubCounties;

    let countyId = counties.find(item => item.title === county)?.id;
    matchedSubCounties = subCounties.filter((subCounty) => subCounty.county_id === countyId);

    // TODO: Show if there are unsaved changes

    // If any of the values from the db do not match the input values show unsaved changes

    let hasChanged = !(firstName.toLowerCase() === student[0].first_name.toLowerCase()
        && lastName.toLowerCase() === student[0].last_name.toLowerCase()
        && phone === student[0].phone
        && county === student[0].locations?.subcounties?.counties?.title
        && subcounty === student[0].locations?.subcounties?.title
    );

    useEffect(() => {
        if (isEnrollingNewCourse) {
            newCourseRef?.current?.reset();
        }
    }, [isEnrollingNewCourse]);

    return (
        <div className="pt-12 max-w-4xl relative">
            {hasChanged

                ? <div className="fixed top-[85px] md:top-[105px] lg:top-[117px] left-14 lg:left-72 right-0 transition ease-in-out duration-300 bg-brand-black h-10 flex items-center justify-center">
                    <p className="text-white flex gap-4 justify-center">
                        <TriangleAlert /> Unsaved changes
                    </p>
                </div>
                : null
            }

            <Link
                to="/admin/students"
                className="flex gap-2 items-center hover:text-brand-orange transition ease-in-out duration-300"><ArrowLeftIcon /> Back to students</Link>
            <h2 className="font-semibold text-lg mt-8">Student details</h2>
            <p className="text-orange-500 bg-orange-100 border-l-2 border-l-orange-500 mt-4 p-4 text-sm font-bold">You can edit the student info from here</p>
            <Form method="post" className="mt-4 space-y-4">
                <fieldset>
                    <Legend>Personal info</Legend>
                    <Grid>
                        <FormSpacer>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                type='text'
                                name='firstName'
                                id='firstName'
                                defaultValue={student[0].first_name}
                                onChange={(event) => setFirstName(event.target.value)}
                                className={`focus-visible:ring-brand-blue capitalize transition duration-300 ease-in-out ${actionData?.fieldErrors?.firstName ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.firstName
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.firstName}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor='lastName'>Last Name</Label>
                            <Input
                                type='text'
                                name='lastName'
                                id='lastName'
                                defaultValue={student[0].last_name}
                                onChange={(event) => setLastName(event.target.value)}
                                className={`focus-visible:ring-brand-blue capitalize transition duration-300 ease-in-out ${actionData?.fieldErrors?.lastName ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.lastName
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.lastName}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor='phone'>Phone</Label>
                            <Input
                                type='text'
                                name='phone'
                                id='phone'
                                defaultValue={student[0].phone}
                                onChange={(event) => setPhone(event.target.value)}
                                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.phone ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.phone
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.phone}</p>
                                : null
                            }
                        </FormSpacer>
                    </Grid>
                    <div className="mt-4">
                        <Grid>
                            <FormSpacer>
                                <Label htmlFor="county">County</Label>
                                <Select
                                    name="county"
                                    id='county'
                                    onValueChange={(value) => setCounty(value)}
                                    defaultValue={student[0].locations?.subcounties?.counties?.title}
                                    required
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select county--" />
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
                            <FormSpacer>
                                <Label htmlFor="subcounty">Sub-county</Label>
                                <Select
                                    name="subcounty"
                                    id='subcounty'
                                    onValueChange={(value) => setSubcounty(value)}
                                    defaultValue={student[0].locations?.subcounties?.title}
                                    required
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select sub-county--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {matchedSubCounties?.map((subCounty) => (
                                            <SelectItem
                                                // key={county.id}
                                                key={crypto.randomUUID()}
                                                value={subCounty.title}
                                            >
                                                {subCounty.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormSpacer>
                        </Grid>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            disabled={(isSubmitting && navigation.formData.get('_action') === 'save') || !hasChanged}
                            type='submit'
                            name='_action'
                            value='save'
                            className='bg-brand-orange hover:bg-orange-300 transition duration-300 ease-in-out focus-visible:ring-brand-blue text-black'
                        >
                            {isSubmitting && navigation.formData.get('_action') === 'save' ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </fieldset>
            </Form>

            {/* Enrolled courses */}
            <div className="space-y-2 mt-4" id="enroled-courses">
                <h3 className="font-semibold">Enroled courses</h3>
                {/* <EnroledCourse /> */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map(course => (
                        <EnroledCourse
                            key={course.id}
                            title={course.title}
                            imageSrc={course.imageSrc}
                            enrolmentId={course.enrolmentId}
                        // courseId={course.id}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <Button
                    onClick={() => setIsEnrolling(!isEnrolling)}
                    className='flex gap-1 bg-brand-orange hover:bg-orange-300 focus-visible:ring-brand-blue transition duration-300 ease-in-out text-black'
                >
                    {isEnrolling ? <><XIcon /> Cancel</> : (<><PlusIcon /> Enrol new course</>)}

                </Button>
            </div>
            {
                isEnrolling
                    ? (
                        // TODO: Clear select after adding new course
                        <div className="mt-4">
                            <h3 className="font-semibold">Enrol new course</h3>
                            <Label htmlFor='course'>Choose a course</Label>
                            <Form
                                method="post"
                                className=""
                                ref={newCourseRef}
                            >
                                <Select name="course" id='course' required>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select Course--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCourses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type='submit'
                                    name='_action'
                                    value='enrol-new-course'
                                    className='bg-brand-orange hover:bg-orange-300 transition duration-300 ease-in-out text-black mt-2'
                                >
                                    {isEnrollingNewCourse ? 'Saving...' : 'Save'}
                                </Button>
                                {actionData?.formError
                                    ? <p className="mt-2 text-red-600 transition ease-in-out duration-300">{actionData.formError}</p>
                                    : null
                                }
                            </Form>
                        </div>
                    )
                    : null
            }

            <div className="mt-16 bg-red-100 p-6 rounded">
                <h3 className="font-semibold">Destructive action</h3>
                <Form method="post" className="mt-4">
                    <Button
                        type='submit'
                        variant='destructive'
                        name='_action'
                        value='delete'
                        className=' focus-visible:ring-brand-blue transition ease-in-out duration-300'
                        {...doubleCheckDelete.getButtonProps()}
                    >
                        {isSubmitting && navigation.formData.get('_action') === 'delete' ? 'Deleting...' : doubleCheckDelete.doubleCheck
                            ? 'Are you sure?'
                            : 'Delete student'}
                    </Button>
                </Form>
            </div>
        </div>
    );
}

function EnroledCourse({ title, imageSrc, enrolmentId }) {
    const fetcher = useFetcher();
    const doubleCheckDelete = useDoubleCheck();

    const isSubmitting = fetcher.state === 'submitting';

    return (
        <fetcher.Form
            method="post"
            hidden={fetcher.state !== 'idle'}
            className="bg-gray-50 border border-slate-100 shadow rounded"
        >
            {/* TODO: If the course is completed remove the unenrol btn and mark it as complete */}
            <img src={imageSrc} alt="" className="w-full h-40 md:h-52 object-cover rounded-t" />
            <div className="p-4">
                <p>{title}</p>
                <input type="hidden" name="enrolmentId" value={enrolmentId} />
                {/* <input type="hidden" name="courseId" value={courseId} /> */}
                <Button
                    disabled={isSubmitting && fetcher.formData?.get('_action') === 'unenrol'}
                    type="submit"
                    variant="destructive"
                    name="_action"
                    value="unenrol"
                    className="mt-2 focus-visible:ring-brand-blue transition duration-300 ease-in-out"
                    {...doubleCheckDelete.getButtonProps()}
                >
                    {/* {doubleCheckDelete.doubleCheck
                        ? isSubmitting && fetcher.formData?.get('_action') === 'unenrol'
                            ? 'Unenroling...'
                            : 'Are you sure?'
                        : 'Unenrol course'
                    } */}
                    {
                        isSubmitting && fetcher.formData?.get('_action') === 'unenrol'
                            ? 'Unenroling...'
                            : doubleCheckDelete.doubleCheck
                                ? 'Are you sure?'
                                : 'Unenrol course'
                    }
                </Button>
            </div>
        </fetcher.Form>
    );
}