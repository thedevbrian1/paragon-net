import { Form, redirect, useActionData, useNavigation } from "@remix-run/react";
import FormSpacer from "~/components/FormSpacer";
import { Grid } from "~/components/Grid";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createInstructor, getInstructors } from "~/models/instructor";
import { getSession, sessionStorage, setSuccessMessage } from "~/.server/session";
import { badRequest, trimValue, validateName, validatePhone } from "~/.server/validation";

export const meta = () => {
    return [
        { title: "Add instructor | Paragon e-School" },
    ];
};

export async function action({ request, response }) {
    const session = await getSession(request);

    const formData = await request.formData();
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

    // Check if instructor exists in the db
    const newInstructorObj = { firstName, lastName, phone };
    const { data: instructors } = await getInstructors(request);
    const match = instructors.some(instructor =>
        instructor.first_name === newInstructorObj.firstName &&
        instructor.last_name === newInstructorObj.lastName &&
        instructor.phone === newInstructorObj.phone
    );

    if (match) {
        return badRequest({ formError: 'Instructor already exists' });
    } else {
        // Create instructor entry to the db
        const { data, headers } = await createInstructor(request, firstName, lastName, trimmedPhone);

        if (data) {
            const instructorId = data[0].id;

            setSuccessMessage(session, 'Created successfully!');
            // const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };
            response.status = 302;
            response.headers.set('Location', `/admin/instructors/${instructorId}`);
            response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

            for (let [key, value] of headers.entries()) {
                response.headers.append(key, value);
            }

            return response;
        }
    }

}

export default function AddInstructor() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="mt-8 lg:mt-12 max-w-4xl text-brand-black">
            <h2 className="font-semibold text-lg">Add instructor</h2>
            <Form method="post" className="mt-4">
                <fieldset>
                    <legend className="font-semibold">Personal info</legend>
                    <Grid>
                        <FormSpacer>
                            <Label htmlFor="firstName">First Name</Label>
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
                            <Label htmlFor="lastName">Last Name</Label>
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
                            <Label htmlFor="phone">Phone</Label>
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
                    <Button
                        type="submit"
                        className="mt-4 bg-brand-orange hover:bg-orange-300 transition ease-in-out duration-300 focus-visible:ring-brand-blue text-brand-black"
                    >
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </Button>
                </fieldset>
                {actionData?.formError
                    ? <p className="mt-2 text-red-600 transition ease-in-out duration-300">{actionData.formError}</p>
                    : null
                }
            </Form>
        </div>
    );
}