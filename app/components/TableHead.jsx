export function TableHead({ tableHeaders }) {
    return (
        <thead>
            <tr className="">
                {tableHeaders.map((heading, index) => (
                    <th key={index} className="border border-slate-600 p-2">{heading}</th>
                ))}
            </tr>
        </thead>
    );
}