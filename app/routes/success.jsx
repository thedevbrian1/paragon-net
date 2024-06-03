import { Link } from "@remix-run/react";
import { useMotionValue, useTransform, motion } from "framer-motion";
import { ArrowLeftIcon } from "~/components/Icon";

export function meta() {
    return [
        { title: 'Success | Nifty' }
    ];
}

export default function Success() {
    const x = useMotionValue(0);
    const xInput = [-100, 0, 100];
    const color = useTransform(x, xInput, [
        "rgb(211, 9, 225)",
        "rgb(68, 0, 255)",
        "rgb(3, 209, 0)"
    ]);
    const tickPath = useTransform(x, [10, 100], [0, 1]);
    // const crossPathA = useTransform(x, [-10, -55], [0, 1]);
    // const crossPathB = useTransform(x, [-50, -100], [0, 1]);

    return (
        <main className="h-screen w-full grid place-items-center">
            <div>
                <h1 className="font-heading text-3xl lg:text-6xl text-brand-black">Success</h1>
                <motion.div
                // style={{ x }}
                // drag="x"
                // dragConstraints={{ left: 0, right: 0 }}
                >


                    <svg viewBox="0 0 50 50">
                        <motion.path
                            fill="none"
                            strokeWidth="2"
                            stroke={color}
                            d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
                            style={{ translateX: 5, translateY: 5 }}
                        />
                        <motion.path
                            fill="none"
                            strokeWidth="2"
                            stroke={color}
                            d="M14,26 L 22,33 L 35,16"
                            strokeDasharray="0 1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1, stroke: "rgb(3, 209, 0)" }}
                            transition={{ duration: 1 }}
                        // style={{ pathLength: tickPath }}
                        />
                        {/* <motion.path
                            fill="none"
                            strokeWidth="2"
                            stroke={color}
                            d="M17,17 L33,33"
                            strokeDasharray="0 1"
                            style={{ pathLength: crossPathA }}
                        />
                        <motion.path
                            fill="none"
                            strokeWidth="2"
                            stroke={color}
                            d="M33,17 L17, 33"
                            strokeDasharray="0 1"
                            style={{ pathLength: crossPathB }}
                        /> */}
                    </svg>
                </motion.div>
                <Link to="/" className="text-brand-black hover:text-blue-600 underline flex justify-center gap-2 mt-2">
                    <ArrowLeftIcon /> Back to home
                </Link>

            </div>
        </main>
    );
}