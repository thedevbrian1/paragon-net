import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EyeIcon, EyeslashIcon } from "./Icon";

const Input = forwardRef(({ type, name, id, placeholder, defaultValue, fieldError }, ref) => {
    // const actionData = useActionData();
    const [isClientError, setIsClientError] = useState(true);
    // const errorState = isClientError && fieldError;
    // const inputRef = useRef(null);

    const [isShowingPassword, setIsShowingPassword] = useState(false);

    function handleChange() {
        setIsClientError(false);
    }

    // useEffect(() => {
    //     if (transition.submission) {
    //         setIsClientError(true);
    //     }
    // }, [transition]);
    // TODO: Fix the flash of error message upon submission
    return (
        <>
            {type === 'textarea'
                ? (<textarea
                    ref={ref}
                    name={name}
                    id={id}
                    placeholder={placeholder}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border bg-gray-100 rounded text-gray-800 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-orange transition ease-in-out duration-300 ${fieldError ? 'border-red-700' : 'border-gray-400'}`}
                />)
                : (
                    <>
                        <input
                            ref={ref}
                            type={type === 'password' ? isShowingPassword ? 'text' : 'password' : type}
                            name={name}
                            id={id}
                            placeholder={placeholder}
                            onChange={handleChange}
                            defaultValue={defaultValue}
                            min={type === 'number' ? 1 : undefined}
                            // onBlur={handleBlur}
                            // onBlur={onBlur}
                            className={`block w-full px-3 py-2 border bg-gray-100 rounded border-gray-300 text-gray-800  focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-orange transition ease-in-out duration-300 ${fieldError ? 'border-red-700' : 'border-gray-400'}`}
                        />
                        {type === 'password'
                            ? <span
                                className="flex gap-1 cursor-pointer text-sm"
                                onClick={() => setIsShowingPassword(!isShowingPassword)}>{isShowingPassword
                                    ? (
                                        <><EyeslashIcon />Hide password</>)
                                    : (<><EyeIcon />Show password</>)
                                }</span>
                            : null
                        }
                    </>
                )
            }

            {
                fieldError
                    ? (<motion.span
                        className="pt-1 text-red-600 inline text-sm transition ease-in-out duration-300" id="email-error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                    >
                        {fieldError}
                    </motion.span>)
                    : <>&nbsp;</>
            }
        </>

    );
})

export default Input;