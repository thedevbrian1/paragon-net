import { createClient } from "~/.server/supabase";

export async function createTransaction(request, mpesaReceiptNo, amount, studentId) {
    let { supabaseClient, headers } = createClient(request);

    let { status, error } = await supabaseClient
        .from('transactions')
        .insert([
            {
                mpesa_receipt_number: mpesaReceiptNo,
                amount: Number(amount),
                student_id: Number(studentId)

            }
        ]);

    if (error) {
        throw error;
    }

    return { status, headers };

}

export async function getTransactionByCode(request, mpesaReceiptNo) {
    let { supabaseClient, headers } = createClient(request);
    let { data, error } = await supabaseClient
        .from('transactions')
        .select('id,mpesa_receipt_number')
        .eq('mpesa_receipt_number', mpesaReceiptNo);

    if (error) {
        throw error;
    }

    return { data, headers };
}