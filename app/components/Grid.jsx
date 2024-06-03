export function Grid({ children }) {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            {children}
        </div>
    );
}