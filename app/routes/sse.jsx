import { eventStream } from "remix-utils/sse/server";
import { emitter } from "~/services/emitter";

export async function loader({ request }) {
    return eventStream(request.signal, function setup(send) {
        function listener(value) {
            send({ data: value });
        }

        emitter.on("message", listener);

        return function cleanup() {
            emitter.off("message", listener);
        };
    });
}