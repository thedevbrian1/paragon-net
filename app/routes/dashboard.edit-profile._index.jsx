import { Link } from "@remix-run/react";

export default function EditProfileIndex() {
    return (
        <div>
            <Link
                to="change-password"
                className="underline focus:p-1 focus:outline-none focus:ring-2 focus:ring-brand-blue transition duration-300 ease-in-out rounded"
                preventScrollReset
            >Change password</Link>
        </div>
    );
}