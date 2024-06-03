import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import FormSpacer from "~/components/FormSpacer";
import { EyeIcon, EyeslashIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function ChangePassword() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmittingPassword = navigation.state === 'submitting' && navigation.formData.get('_action') === 'password';

    return (
        <Form method="post">
            <fieldset>
                <h4 className="font-semibold">Change password</h4>
                <div className="grid lg:grid-cols-2 gap-4 mt-2">
                    <FormSpacer>
                        <Label htmlFor="password">New Password</Label>
                        <PasswordInput
                            keyValue={'password'}
                            name='password'
                            fieldError={actionData?.fieldErrors?.password}
                        />
                        {actionData?.fieldErrors?.password
                            ? <p className="text-red-500 text-sm">{actionData.fieldErrors.password}</p>
                            : null
                        }
                    </FormSpacer>
                    <FormSpacer>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <PasswordInput
                            keyValue={'confirmPassword'}
                            name='confirmPassword'
                            fieldError={actionData?.fieldErrors?.confirmPassword}
                        />
                        {actionData?.fieldErrors?.confirmPassword
                            ? <p className="text-red-500 text-sm">{actionData.fieldErrors.confirmPassword}</p>
                            : null
                        }
                    </FormSpacer>
                </div>
                <div className="flex justify-end mt-2">
                    <Button
                        type="submit"
                        name="_action"
                        value="password"
                        className="bg-brand-orange hover:bg-orange-400  focus:ring-brand-blue transition duration-300 ease-in-out text-brand-black capitalize">
                        {isSubmittingPassword ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </fieldset>
        </Form>
    );
}

function PasswordInput({ keyValue, name, fieldError }) {
    const [isShowingPassword, setIsShowingPassword] = useState(false);

    return (
        <>
            <Input
                key={keyValue}
                type={isShowingPassword ? 'text' : 'password'}
                name={name}
                id={name}
                className={`focus-visible:ring-brand-blue transition duration-300 ease-in-out ${fieldError ? 'border border-red-500' : ''}`}
            />
            <span
                className="flex gap-1 cursor-pointer text-sm"
                onClick={() => setIsShowingPassword(!isShowingPassword)}>{isShowingPassword
                    ? (
                        <><EyeslashIcon />Hide password</>)
                    : (<><EyeIcon />Show password</>)
                }</span>
        </>
    );
}