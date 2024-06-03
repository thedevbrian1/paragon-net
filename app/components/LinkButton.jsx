import { Link } from "@remix-run/react";

export default function LinkButton({ href, text, size }) {
    return (
        <Link to={href} className={` bg-brand-orange hover:bg-orange-400 transition duration-300 ease-in-out text-black rounded capitalize text-center whitespace-nowrap ${size === 'sm' ? 'text-sm px-3 py-2' : 'px-5 py-3'}`}>
            {text}
        </Link>
    );
}