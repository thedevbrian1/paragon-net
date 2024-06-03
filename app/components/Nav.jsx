import { Link, NavLink } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { HamburgerIcon, XIcon } from "./Icon";
import { navLinks } from "../utils";

export default function Nav({ isLoggedIn }) {
    const [isMenuShowing, setIsMenuShowing] = useState(false);
    function toggleMenu() {
        setIsMenuShowing(!isMenuShowing);
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
    };

    return (
        <nav>
            {/* Desktop nav */}
            <div className="hidden lg:flex gap-4 items-center">
                <ul className="flex gap-4">
                    {
                        navLinks.map((navLink, index) => (
                            <li key={index}>
                                <NavLink
                                    to={navLink.path}
                                    prefetch="intent"
                                    end
                                    className={({ isActive }) => `hover:text-yellow-300 transition duration-300 ease-in-out ${isActive ? "text-brand-orange" : ""}`}
                                >
                                    {navLink.name}
                                </NavLink>
                            </li>
                        ))
                    }
                </ul>
                {
                    isLoggedIn
                        ? null
                        : (
                            <div className="flex gap-4 items-center">
                                <Link to="/login" className="underline">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-brand-orange hover:bg-orange-400 transition duration-300 ease-in-out text-black px-5 py-3 rounded">
                                    Get started now
                                </Link>
                            </div>
                        )
                }

            </div>

            {/* Mobile nav */}

            <div className="lg:hidden flex">
                <HamburgerIcon toggleMenu={toggleMenu} />
                {
                    isMenuShowing && (
                        <div className='flex flex-col justify-center items-center bg-black opacity-90 w-full h-screen fixed z-10 top-0 left-0 transition duration-500 ease-in-out'>
                            <span className="absolute top-[41px] right-8 text-white" onClick={toggleMenu}>
                                <XIcon />
                            </span>
                            <motion.ul
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="text-center mr-4 text-white space-y-4">
                                {navLinks.map((navLink, index) => (
                                    <motion.li key={index} variants={item} onClick={() => setIsMenuShowing(false)}>
                                        <Link
                                            to={navLink.path}
                                            prefetch="intent"
                                        >
                                            {navLink.name}
                                        </Link>
                                    </motion.li>
                                ))}
                                {
                                    isLoggedIn
                                        ? (
                                            <motion.li
                                                variants={item}
                                                className="pt-2"
                                            >
                                                <form
                                                    method="post"
                                                    action="/logout"
                                                >
                                                    <button
                                                        type="submit"
                                                        className="px-5 py-2 bg-brand-red text-white rounded"
                                                    >
                                                        Logout
                                                    </button>
                                                </form>
                                            </motion.li>
                                        )
                                        : (
                                            <motion.li variants={item} className="pt-2" onClick={() => setIsMenuShowing(false)}>
                                                <Link
                                                    to="/signup"
                                                    prefetch="intent"
                                                    className="bg-brand-orange mt-2 px-4 py-2 rounded text-brand-black"
                                                >
                                                    Get started
                                                </Link>
                                            </motion.li>
                                        )
                                }

                            </motion.ul>
                        </div>
                    )
                }
            </div>
        </nav>
    );
}