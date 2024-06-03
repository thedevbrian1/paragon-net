import { Link } from "@remix-run/react";
import { Logo } from "../components/Icon";
import Nav from "../components/Nav";

export default function Signup() {
    return (
        <main className="h-screen w-full bg-[url('/code.jpg')] bg-cover bg-center bg-no-repeat bg-black bg-opacity-70 bg-blend-overlay text-gray-200">
            <div className="h-full max-w-lg mx-auto grid place-items-center px-8 -mt-16">
                <div className="w-full">
                    <h1 className="font-semibold text-3xl">Signup</h1>
                    <div className="flex flex-col gap-4 mt-8">
                        <Link to="individual" className="border border-slate-300 rounded py-3 px-6 text-center hover:bg-brand-orange focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-orange transition ease-in-out duration-300">
                            Sign up as an individual
                        </Link>
                        <Link to="institution" className="border border-slate-300 rounded py-3 px-6 text-center hover:bg-brand-orange focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-orange transition ease-in-out duration-300">
                            Sign up as an institution
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}