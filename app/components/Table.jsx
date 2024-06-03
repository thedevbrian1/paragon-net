export function Table({ children }) {
    return (
        <table className="table-auto border-collapse border border-slate-500 w-full">
            {children}
        </table>
    );
}