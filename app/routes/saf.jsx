import { json } from "@remix-run/node";
import { emitter } from "~/services/emitter";
import { getSession, sessionStorage } from "~/.server/session";

export async function action({ request }) {
    let session = await getSession(request);
    let callbackData = request.body;
    console.log({ callbackData });


    let reader = callbackData.getReader();

    let stream = new ReadableStream({
        async start(controller) {
            async function pump() {
                let { done, value } = await reader.read();
                if (done) {
                    controller.close();
                    return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
            }
            await pump();
        }
    });

    let newResponse = new Response(stream);
    let data = await newResponse.json();
    console.log({ data });

    // let transaction = data.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
    // let transactionCode = transaction.Value;

    let transaction = {
        amount: data.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'Amount').Value,
        code: data.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value,
        phone: data.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber').Value
    };

    emitter.emit("message", JSON.stringify(transaction));

    // let resultCode = callbackData.Body.stkCallback.ResultCode;

    // if (resultCode !== 0) {
    //     throw new Error(callbackData.Body.stkCallback.ResultDesc);
    // }

    // let amount = callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.name === 'Amount').Value;
    // console.log({ amount });
    // let mpesaCode = callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.name === 'MpesaReceiptNumber').Value;
    // console.log({ mpesaCode });

    return json({ ok: true }, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session)
        }
    });
}