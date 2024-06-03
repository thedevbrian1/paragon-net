import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { ExclamationIcon } from "../components/Icon";
import LinkButton from "../components/LinkButton";

const uniqueAttributes = [
    {
        title: 'Comprehensive Curriculum',
        description: 'Unlike traditional tech education providers, Paragon-eSchool goes beyond robotics or isolated programming languages. Our curriculum is designed to equip students with a comprehensive skill set ranging from coding to app development, web design, and robotics, that mirrors real-world needs. By progressively building upon foundational knowledge and anticipating future industry trends, we ensure that our students are not just competent but competitive in the global arena.',
        imageSrc: '/learning.svg',
        altText: ''
    },
    {
        title: 'World-Class Educators',
        description: 'Our passionate and experienced educators are not just mentors but also enablers of dreams. They inspire, guide, and nurture your child\'s unique potential.',
        imageSrc: '/educator.svg',
        altText: ''
    },
    {
        title: 'Fun and Engaging Learning',
        description: 'Learning at Nifty-eSchool is an adventure, not a chore. We make sure that every class is a delightful journey of discovery, where kids build, experiment, and explore.',
        imageSrc: '/teamwork.svg',
        altText: ''
    },
    {
        title: 'Income-Earning Potential',
        description: "Our focus isn't just on learning; it's also on creating opportunities. By equipping your child with essential digital skills, we're helping them take the first steps towards earning an income at an early age.",
        imageSrc: '/earning.svg',
        altText: ''
    },
    {
        title: 'Innovation & Entrepreneurship',
        description: "Beyond coding, we nurture entrepreneurial thinking. Your child will develop the skills and confidence to turn their dreams into reality, launch their own startups, and be the pioneers of Africa's future.",
        imageSrc: '/innovation.svg',
        altText: ''
    }
];


export default function About() {
    return (
        <main className="mt-8 text-black/80">
            <Info />
            <Mission />
            {/* <Team /> */}
            <OurStory />
            <OurApproach />
            {/* <Apart /> */}
            <Unique />
        </main>
    );
}

function Info() {
    return (
        <div className="px-6 xl:px-0 mt-20">
            <div className="lg:max-w-3xl mx-auto">
                <h1 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl">About us</h1>
                <p className="mt-8 text-center">Welcome to Paragon-eSchool, your premier destination for comprehensive technological education in Kenya. Founded with a passion for empowering communities with impactful and competitive skills, we are dedicated to nurturing the next generation of tech-savvy innovators.</p>
            </div>
            <div className="lg:max-w-5xl mx-auto grid md:grid-cols-2 mt-8">
                <div>
                    <img src="https://images.unsplash.com/photo-1573164574511-73c773193279?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGJsYWNrJTIwY29tcGFueXxlbnwwfHwwfHx8MA%3D%3D" alt="" className="max-w-full object-cover revealing-image" />
                </div>
                <div>
                    <img src="https://images.unsplash.com/photo-1573164574511-73c773193279?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGJsYWNrJTIwY29tcGFueXxlbnwwfHwwfHx8MA%3D%3D" alt="" className="max-w-full object-cover revealing-image" />
                </div>
            </div>
        </div>
    );
}

function Mission() {
    return (
        <div className="opacity-0 fading-in px-6 xl:px-0 lg:max-w-3xl mx-auto text-center mt-12 lg:mt-24">
            <h2 className="text-2xl lg:text-3xl text-center font-semibold">Our mission</h2>
            <p className="mt-4">At Paragon-eSchool, our mission is simple yet profound: to equip individuals with the technological expertise needed to excel on personal and corporate levels, both locally and globally. We strive to bridge the gap between aspiration and achievement by providing a well-crafted curriculum and abundant resources that make learning programming accessible to all.</p>
            <p className="mt-8 font-bold">
                From the tender age of 6 years, we're nurturing young innovators who will shape the future. Our unique approach focuses on creativity, problem-solving, and innovation, not only equipping kids with digital skills but also instilling the confidence and knowledge to transform their ideas into reality.
            </p>
        </div>

    );
}

function Team() {
    return (
        <div>
            <h2 className="text-2xl lg:text-3xl text-center font-semibold">Meet our team</h2>
            <div>
                {/* Team */}
            </div>
        </div>
    );
}

function OurStory() {
    return (
        <div className="mt-12 lg:mt-24 px-6 xl:px-0 lg:max-w-5xl mx-auto">
            {/* <div className="relative hidden lg:flex">
                <img
                    src="https://images.pexels.com/photos/9431436/pexels-photo-9431436.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt=""
                    className="w-full h-full aspect-w-3 aspect-h-4 lg:aspect-none lg:h-[500px] object-cover saturate-100 relative after:w-full after:h-full after:block after:absolute after:inset-0 after:bg-black"
                />
                <div className="bg-white/90  drop-shadow  rounded w-full lg:w-1/2 mx-auto absolute inset-0 lg:-bottom-32 lg:top-auto left-0 right-0 p-6">
                    <h2 className="text-2xl lg:text-3xl text-center font-semibold">Our story</h2>
                    <p className="mt-4 px-4 lg:px-0">The genesis of Paragon-eSchool stems from the firsthand experiences of our founders, who navigated the tech industry's demands while working remotely for international companies. Witnessing the transformative power of technology and the opportunities it presented, they felt compelled to pay it forward. Motivated by the stark reality of unemployment in Africa and the need for practical skills, they embarked on a journey to democratize tech education.</p>
                </div>
            </div> */}
            <div className="bg-[url('https://images.pexels.com/photos/9431436/pexels-photo-9431436.jpeg?auto=compress&cs=tinysrgb&w=600')] bg-cover bg-no-repeat bg-black/70 bg-blend-overlay text-gray-200 text-center py-20 md:py-24 px-6 md:px-12 lg:px-20 rounded-lg revealing-image">
                <h2 className="text-2xl lg:text-3xl text-center font-semibold">Our story</h2>
                <p className="mt-4">The genesis of Paragon-eSchool stems from the firsthand experiences of our founders, who navigated the tech industry's demands while working remotely for international companies. Witnessing the transformative power of technology and the opportunities it presented, they felt compelled to pay it forward. Motivated by the stark reality of unemployment in Africa and the need for practical skills, they embarked on a journey to democratize tech education.</p>
            </div>
        </div>
    );
}

function OurApproach() {
    return (
        <div className="mt-12 lg:mt-24 px-6 md:px-10 xl:px-0 lg:max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-5 items-center ">
                <div className="lg:order-2">
                    <h2 className="text-2xl lg:text-3xl text-center lg:text-left font-semibold">Our approach</h2>
                    <p className="mt-4 text-center lg:text-left">We understand the challenges of learning programming firsthand, which is why we've developed a curriculum that streamlines the learning process. Our approach is not just about teaching coding; it's about fostering a mindset of innovation and adaptability. We believe that to thrive in today's rapidly evolving tech landscape, individuals need more than just technical skills – they need creativity, critical thinking, and a holistic understanding of the technology ecosystem.</p>
                </div>

                <img
                    src="/next-option.svg"
                    alt=""
                    className="max-w-full md:max-w-sm mx-auto lg:order-1"
                />
            </div>
        </div>
    );
}

function Apart() {
    return (
        <div className="mt-12 lg:mt-24 px-6 md:px-10 xl:px-0 lg:max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-5 items-center">
                <div className="">
                    <h2 className="text-2xl lg:text-3xl text-center lg:text-left font-semibold">What sets us apart?</h2>
                    <p className="mt-4 text-center lg:text-left">Unlike traditional tech education providers, Paragon-eSchool goes beyond robotics or isolated programming languages. Our curriculum is designed to equip students with a comprehensive skill set ranging from coding to app development, web design, and robotics, that mirrors real-world needs. By progressively building upon foundational knowledge and anticipating future industry trends, we ensure that our students are not just competent but competitive in the global arena.</p>
                </div>

                <img
                    src="/progressive-learning.svg"
                    alt=""
                    className="max-w-full md:max-w-sm mx-auto"
                />
            </div>
        </div>
    );
}

function Unique() {
    return (
        <div className="opacity-0 fading-in mt-12 lg:mt-24 bg-gray-50 py-20">
            <div className="px-6 xl:px-0 lg:max-w-5xl mx-auto">
                <h2 className="text-2xl lg:text-3xl text-center font-semibold">What sets us apart?</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    {
                        uniqueAttributes.map((attribute, index) => (
                            <div key={index} className="border border-slate-200 rounded p-6">
                                <img src={attribute.imageSrc} alt={attribute.altText} className="h-28 mx-auto" />
                                <h3 className="mt-4 text-brand-orange text-lg">{attribute.title}</h3>
                                <p className="mt-2">{attribute.description}</p>
                            </div>
                        ))
                    }

                </div>
            </div>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        console.log({ error });
        return (
            <div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <ExclamationIcon />
                        <h1 className="text-3xl font-semibold">{error.status} {error.statusText}</h1>
                        <p>{error.data}</p>
                    </div>
                    <LinkButton text='Try again' href='.' size='sm' />
                </div>
            </div>
        );
    } else if (error instanceof Error) {
        console.log({ error });
        return (
            <div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <ExclamationIcon />
                        <h1 className="text-3xl font-semibold">Error</h1>
                        <p>{error.message}</p>
                    </div>
                    <LinkButton text='Try again' href='.' size='sm' />
                </div>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}

