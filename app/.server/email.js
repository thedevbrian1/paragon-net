import { Resend } from "resend";

export async function sendEmail(name, email, phone, message) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: [process.env.TO_EMAIL],
        subject: 'Message from Paragon e-School contact form',
        html: `<div>
                    <p>Hi, I contacted you from the Paragon e-School website. Here are my details:</p>
                    <p>Name: ${name}</p>
                    <p>Email: ${email}</p>
                    <p>Phone: ${phone}</p>
                    <p>Message: ${message}</p>
                </div>
                `
    });

    if (error) {
        throw new Error(error);
    }

    return { data };
}

export async function institutionSignupRequest(name, email, phone, institution, message) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: [process.env.TO_EMAIL],
        subject: 'Institution signup request',
        html: `<div>
                    <p>Hi, I'm interested in joining Paragon e-School. Here are my details:</p>
                    <p>Name: ${name}</p>
                    <p>Email: ${email}</p>
                    <p>Phone: ${phone}</p>
                    <p>Institution: ${institution}</p>
                    <p>Message: ${message}</p>
                </div>
                `
    });

    if (error) {
        throw new Error(error);
    }

    return { data };
}