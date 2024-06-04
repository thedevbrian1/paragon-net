import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import FormSpacer from "~/components/FormSpacer";
import { Grid } from "~/components/Grid";
import { Legend } from "~/components/Legend";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { deleteInstructor, getInstructorById, updateInstructor } from "~/models/instructor";
import { getSession, sessionStorage, setSuccessMessage } from "~/.server/session";
import { useDoubleCheck } from "~/utils";
import { badRequest, trimValue, validateName, validatePhone } from "~/.server/validation";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";

export let meta = ({ data }) => {
    return [
        { title: `Instructor ${data.instructor[0].first_name} ${data.instructor[0].last_name} | Paragon e-School` },
    ];
};

export async function loader({ request, params }) {
    let instructorId = Number(params.id);

    let { data: instructor, headers } = await getInstructorById(request, instructorId);

    return { instructor };
}

export async function action({ request, params, response }) {
    let instructorId = params.id;

    let session = await getSession(request);

    let formData = await request.formData();
    let action = formData.get('_action');

    switch (action) {
        case 'update': {
            let firstName = formData.get('firstName');
            let lastName = formData.get('lastName');
            let phone = formData.get('phone');

            let trimmedPhone = trimValue(phone);

            // Validation
            let fieldErrors = {
                firstName: validateName(firstName),
                lastName: validateName(lastName),
                phone: validatePhone(trimmedPhone)
            }

            if (Object.values(fieldErrors).some(Boolean)) {
                return badRequest({ fieldErrors });
            }

            // Update instructor record in the db
            let { data, headers } = await updateInstructor(request, instructorId, firstName, lastName, trimmedPhone);
            if (data) {
                setSuccessMessage(session, 'Updated successfully!');

                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
                for (let [key, value] of headers.entries()) {
                    response.headers.append(key, value);
                }

                return { ok: true };
            }
        }
        case 'delete': {
            let { status, headers } = await deleteInstructor(request, instructorId);
            if (status === 204) {
                setSuccessMessage(session, 'Deleted successfully!');

                // let allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };
                response.status = 302;
                response.headers.set('Location', '/admin/instructors');
                response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

                for (let [key, value] of headers.entries()) {
                    response.headers.append(key, value);
                }

                return response;
            }
        }
    }
}

export default function Instructor() {
    let { instructor } = useLoaderData();
    let actionData = useActionData();
    let navigation = useNavigation();
    let doubleCheckDelete = useDoubleCheck();

    let [firstName, setFirstName] = useState(instructor[0].first_name);
    let [lastName, setLastName] = useState(instructor[0].last_name);
    let [phone, setPhone] = useState(instructor[0].phone);

    let hasChanged = !(firstName.toLowerCase() === instructor[0].first_name.toLowerCase()
        && lastName.toLowerCase() === instructor[0].last_name.toLowerCase()
        && phone === instructor[0].phone
    );


    let isSubmitting = navigation.state === 'submitting';

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
            <h2 className="font-semibold text-lg">Instructor details</h2>
            <p className="text-orange-500 bg-orange-100 border-l-2 border-l-orange-500 mt-4 p-4 text-sm font-bold">You can edit the instructor info from here</p>
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
                                defaultValue={instructor[0].first_name}
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
                                defaultValue={instructor[0].last_name}
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
                                defaultValue={instructor[0].phone}
                                onChange={(event) => setPhone(event.target.value)}
                                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${actionData?.fieldErrors?.phone ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.phone
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.phone}</p>
                                : null
                            }
                        </FormSpacer>
                    </Grid>
                    <div className="flex justify-end mt-4">
                        <Button
                            disabled={isSubmitting || !hasChanged}
                            type='submit'
                            name='_action'
                            value='update'
                            className='bg-brand-orange hover:bg-orange-300 transition duration-300 ease-in-out focus-visible:ring-brand-blue text-brand-black'
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </fieldset>
            </Form>

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
                            : 'Delete instructor'}
                    </Button>
                </Form>
            </div>
        </div>
    );
}