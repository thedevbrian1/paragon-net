import { useState } from "react";

export function useDoubleCheck() {
    const [doubleCheck, setDoubleCheck] = useState(false);

    function getButtonProps(props) {
        function onBlur() {
            setDoubleCheck(false);
        }

        function onClick(e) {
            if (!doubleCheck) {
                e.preventDefault();
                setDoubleCheck(true);
            }
        }
        return {
            ...props,
            onBlur: callAll(onBlur, props?.onBlur),
            onClick: callAll(onClick, props?.onClick)

        }
    }

    return { doubleCheck, getButtonProps };
}

function callAll(...fns) {
    return (...args) => fns.forEach(fn => fn?.(...args));
}


// export async function sendEmail(name, email, phone, message, institution) {
//     const Mailjet = require('node-mailjet');
//     const mailjet = Mailjet.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

//     // const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)
//     let res;

//     try {
//         res = await mailjet
//             .post("send", { 'version': 'v3' })
//             .request({
//                 "FromEmail": "hello@paragoneschool.com",
//                 "FromName": "Paragon E-School",
//                 "Recipients": [
//                     // {
//                     //     "Email": "karanisylvia02@gmail.com",
//                     //     "Name": "Sylvia Karani"
//                     // }
//                     {
//                         "Email": "brayomwas95@gmail.com",
//                         "Name": "Brian Mwangi"
//                     }
//                 ],
//                 "Subject": "Institution signup request",
//                 "Text-part": "This is the text part of this email",
//                 "Html-part": `
//             <h3>Institution signup request</h3>
//             <p>${message}</p>
//             <p>Here are my contact details: </p>
//             <p>Name: ${name} </p>
//             <p>Email: ${email} </p>
//             <p>Phone: ${phone} </p>
//             <p>Institution: ${institution} </p>
//             `
//             });
//         // console.log('Email response: ', res);
//     } catch (err) {
//         throw new Response(err, { status: err.statusCode })
//     }
//     return res;
// }


export const navLinks = [
    {
        name: 'Home',
        path: '/'
    },
    {
        name: 'Programs',
        path: '/courses'
    },
    {
        name: 'About',
        path: '/about'
    },
    {
        name: 'Contact',
        path: '/#contact'
    }
];
