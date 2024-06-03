import { Honeypot } from "remix-utils/honeypot/server";

export const honeypot = new Honeypot({
    randomizeNameFieldName: true,
    nameFieldName: "name__confirm",
    validFromFieldName: "from__confirm", // null to disable it
    encryptionSeed: process.env.HONEYPOT_ENCRYPTED_SEED, // Ideally it should be unique even between processes
});