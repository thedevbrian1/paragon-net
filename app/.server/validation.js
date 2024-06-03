import { json } from "@remix-run/node";

export function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (typeof email !== "string" || !pattern.test(email)) {
        return 'Email is invalid';
    }
}

export function validatePassword(password) {
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\-]/;

    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    } else if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password) || !numberRegex.test(password) || !specialCharRegex.test(password)) {
        return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
}

export function validateName(name) {
    if (typeof name !== "string" || name.length < 2) {
        return 'Name is invalid';
    }
}

export function trimValue(value) {
    return value.replace(/\D+/g, '');
}

export function trimString(string) {
    return string.trim().split(' ').join('').toLowerCase();
}

export function validatePhone(phone) {
    // if (typeof phone !== "string" || phone.length < 10) {
    //   return 'Phone number is invalid';
    // }
    const safariomRegex = /^(?:254|\+254|0)?([71](?:(?:0[0-8])|(?:[12][0-9])|(?:9[0-9])|(?:4[0-3])|(?:4[68]))[0-9]{6})$/;

    const airtelRegex = /^(?:254|\+254|0)?(7(?:(?:3[0-9])|(?:5[0-6])|(?:8[0-2])|(?:8[6-9]))[0-9]{6})$/;

    const telkomRegex = /^(?:254|\+254|0)?(77[0-9][0-9]{6})$/;

    if (!phone.match(safariomRegex) && !phone.match(airtelRegex) && !phone.match(telkomRegex)) {
        return 'Phone number is invalid';
    }
}

export function validateMessage(message) {
    if (typeof message !== "string" || message.length < 2) {
        return 'Message is invalid';
    }
}

export function badRequest(data) {
    return json(data, { status: 404 });
}