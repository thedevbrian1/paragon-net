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

export const meta = ({ data }) => {
    return [
        { title: `Instructor ${data.instructor[0].first_name} ${data.instructor[0].last_name} | Paragon e-School` },
    ];
};

export async function loader({ request, params }) {
    const instructorId = Number(params.id);

    const { data: instructor, headers } = await getInstructorById(request, instructorId);

    return { instructor };
}

export async function action({ request, params, response }) {
    const instructorId = params.id;

    const session = await getSession(request);

    const formData = await request.formData();
    const action = formData.get('_action');

    switch (action) {
        case 'update': {
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const phone = formData.get('phone');

            const trimmedPhone = trimValue(phone);

            // Validation
            const fieldErrors = {
                firstName: validateName(firstName),
                lastName: validateName(lastName),
                phone: validatePhone(trimmedPhone)
            }

            if (Object.values(fieldErrors).some(Boolean)) {
                return badRequest({ fieldErrors });
            }

            // Update instructor record in the db
            const { data, headers } = await updateInstructor(request, instructorId, firstName, lastName, trimmedPhone);
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
            const { status, headers } = await deleteInstructor(request, instructorId);
            if (status === 204) {
                setSuccessMessage(session, 'Deleted successfully!');

                // const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };
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
    const { instructor } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const doubleCheckDelete = useDoubleCheck();

    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="mt-8 lg:mt-12 max-w-4xl text-brand-black">
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