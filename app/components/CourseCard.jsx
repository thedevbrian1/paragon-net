export default function CourseCard({ title, bgImg, description }) {
    return (
        <div className="bg-gray-100 border border-slate-300 rounded overflow-hidden hover:shadow-lg transition ease-in-out duration-300">
            <div>
                <img src={bgImg} alt="" className="h-36 lg:h-48 w-full object-cover object-top" />
            </div>
            <div className="py-6 px-4">
                <h3 className="text-brand-black text-lg  font-semibold">{title}</h3>
                <p className="line-clamp-2 text-gray-500 mt-2">{description}</p>

            </div>
        </div>
    );
}