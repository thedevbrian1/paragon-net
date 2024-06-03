import { Link } from "@remix-run/react";
import CardContainer from "../components/CardContainer";
import CourseCard from "../components/CourseCard";

export const handle = {
    breadcrumb: () => <Link to={`/courses/category`}>Category</Link>
}

// TODO: Replace 'category' in the url with the actual category

export default function CourseCategory() {
    const courses = [
        {
            title: 'Python',
            bgImg: '/python.jpg',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat? Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat? Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat?'
        },
        {
            title: 'Javascript',
            bgImg: '/javascript.jpg',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat?'
        },
        {
            title: 'Python',
            bgImg: '/python.jpg',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat?'
        },
        {
            title: 'Javascript',
            bgImg: '/javascript.jpg',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat? Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat? Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat?'
        },
        {
            title: 'Python',
            bgImg: '/python.jpg',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum, quaerat?'
        },

    ]
    return (
        <main className=" text-brand-black">
            {/* TODO: Use pagination maybe */}
            <div className="mt-4 w-full h-60 md:h-80 grid place-items-center bg-[url('https://images.unsplash.com/photo-1541178735493-479c1a27ed24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29tcHV0ZXIlMjBzdHVkZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60')] bg-center bg-cover bg-no-repeat bg-black bg-opacity-70 bg-blend-overlay rounded">
                <h1 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl text-white">
                    Top courses
                </h1>
            </div>
            <div className="mt-12">
                <CardContainer>
                    {courses.map((course, index) => (
                        <Link key={index} to={`1`}>
                            <CourseCard
                                title={course.title}
                                bgImg={course.bgImg}
                                description={course.description}
                            />
                        </Link>
                    ))}
                </CardContainer>
            </div>
        </main>
    );
}