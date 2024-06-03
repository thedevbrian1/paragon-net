export default function CardContainer({ children }) {
    return (
        <div className="mt-4 grid  max-w-sm sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4 sm:max-w-none gap-5 mx-auto">
            {children}
        </div>
    );
}