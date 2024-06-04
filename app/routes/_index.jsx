import {
	Form,
	Link,
	isRouteErrorResponse,
	useActionData,
	useLoaderData,
	useNavigation,
	useRouteError,
} from '@remix-run/react';
import { useRef } from 'react';
// import { useCountUp } from "react-countup";
import {
	ArrowRightIcon,
	Computer,
	ErrorIllustration,
	Mailbox,
	Phone,
	StarIcon,
} from '../components/Icon';
import LinkButton from '../components/LinkButton';
import Input from '../components/Input';
import CardContainer from '../components/CardContainer';
import { getCategories } from '../models/course';
import { honeypot } from '~/.server/honeypot';
import { SpamError } from 'remix-utils/honeypot/server';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { sendEmail } from '~/.server/email';
import {
	badRequest,
	trimValue,
	validateEmail,
	validateMessage,
	validateName,
	validatePhone,
} from '~/.server/validation';

export const meta = () => {
	return [
		{ title: 'Paragon E-School' },
		{
			name: 'description',
			content:
				'Welcome to Paragon E-School! Compliment your school learning with carefully curated coding lessons',
		},
	];
};

export async function loader() {
	let categories = await getCategories();
	console.log({ categories });
	// FIXME: Holiday courses not showing
	// const holidayCourses = await getHolidayCourses();
	// console.log({ holidayCourses });

	return categories.result;
}

export async function action({ request, response }) {
	const formData = await request.formData();

	try {
		honeypot.check(formData);
	} catch (error) {
		if (error instanceof SpamError) {
			throw new Response('Form not submitted properly', { status: 400 });
		}
		throw error;
	}

	const action = formData.get('_action');

	let fieldErrors;

	switch (action) {
		case 'contact': {
			console.log('Contact');
			const email = formData.get('email');
			const name = formData.get('name');
			const phone = formData.get('phone');
			const message = formData.get('message');

			const trimmedPhone = trimValue(phone);

			fieldErrors = {
				name: validateName(name),
				email: validateEmail(email),
				phone: validatePhone(trimmedPhone),
				message: validateMessage(message),
			};

			if (Object.values(fieldErrors).some(Boolean)) {
				return badRequest({ fieldErrors });
			}

			await sendEmail(name, email, phone, message);
			response.status = 302;
			response.headers.set('Location', '/success');
			return response;
		}
	}

	return null;
}

export default function Index() {
	return (
		<main className="w-full text-brand-black">
			<Hero />
			<WhyUs />
			<CoursesIntro />
			<Trustees />
			<Contact />
		</main>
	);
}

function Hero() {
	return (
		<section className="w-full  lg:h-3/4  pb-8 ">
			<div className="bg-[#AEE8E2] pt-28  pb-32">
				<div className=" max-w-6xl mx-auto  px-4 md:px-8 lg:px-0 flex flex-col gap-y-4 items-center">
					<div className="hidden lg:inline absolute top-[165px] left-4 lg:top-60 lg:left-20">
						<StarIcon fill="#FFA500" />
					</div>
					<div className="hidden lg:inline absolute top-[250px] right-8 md:right-16 lg:top-[350px] lg:right-36">
						<StarIcon fill="#FFA500" />
					</div>
					<div className="hero-animation">
						<h1 className="text-center font-bold text-3xl md:text-4xl lg:text-6xl text-brand-black">
							Invest in your child's future today
						</h1>
						<p className="text-center text-brand-black lg:text-xl mt-4">
							Where young minds learn to code, excel in tech, and
							shape the world
						</p>
						<div className="mt-8 flex justify-center">
							<LinkButton
								href="/courses"
								text="Check out our programs"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function HeroImage({ imageSrc, bgColor }) {
	return (
		<div className={`w-60 h-40 md:w-68 md:h-72 lg:w-96 ${bgColor} rounded`}>
			<div className="w-full">
				<img
					src={imageSrc}
					alt=""
					className="w-full h-full object-cover"
				/>
			</div>
		</div>
	);
}

function WhyUs() {
	return (
		<div className="revealing-image max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-40  mt-8 md:mt-16 py-28 lg:py-40 bg-[url('https://res.cloudinary.com/organic-zones/image/upload/v1696767722/photo1696571941_maxmht.jpg')] bg-center bg-cover bg-no-repeat bg-black bg-opacity-70 bg-blend-overlay text-gray-200 flex flex-col items-center gap-4 rounded">
			<h2 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl">
				Why choose Paragon?
			</h2>
			<p className="text-center  lg:text-lg">
				In a fast-evolving digital age, the need for tech-savvy
				individuals has never been more apparent. Africa's young minds
				deserve every opportunity to thrive in this tech-centric world,
				and that's where Paragon steps in
			</p>
			<LinkButton href="/signup" text="Get started now" />
		</div>
	);
}

function CoursesIntro() {
	const data = useLoaderData();

	const images = [
		'https://res.cloudinary.com/organic-zones/image/upload/w_400/v1709300261/photo_5981293249253458217_x_qjjyyo.jpg',
		'https://res.cloudinary.com/organic-zones/image/upload/w_400/v1709300373/photo_5981293249253458218_x_oiwvoo.jpg',
		'https://res.cloudinary.com/organic-zones/image/upload/w_400/v1709300372/photo_5981293249253458219_x_hsu1u7.jpg',
		'https://res.cloudinary.com/organic-zones/image/upload/w_400/v1709300372/photo_5981293249253458221_x_eu5sv0.jpg',
		'https://res.cloudinary.com/organic-zones/image/upload/w_400/v1699628290/seth-ebenezer-tetteh-DeqswsZEO3Y-unsplash_hvgpv4.jpg',
	];
	const categories = data.filter(
		(item) => item.title !== 'Holiday Programmes',
	);

	function moveItem(arr, fromIndex, toIndex) {
		let itemToMove = arr.splice(fromIndex, 1)[0];
		arr.splice(toIndex, 0, itemToMove);
	}

	moveItem(categories, 4, 0);
	moveItem(categories, 2, 4);
	return (
		<section className="max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  mt-8 md:mt-16">
			<div className="grid md:grid-cols-2 gap-8 items-center">
				<div className="">
					<h2 className="text-center md:text-left font-semibold text-3xl md:text-4xl lg:text-5xl">
						Well-curated courses available on programming and
						robotics
					</h2>
					<p className="text-center md:text-left mt-4 lg:text-lg">
						Learn from the best educators in a professional and
						practical manner
					</p>
				</div>
				<div className="w-56 md:w-96 lg:w-[450px] justify-self-center">
					<Computer />
				</div>
			</div>
			<div className="px-4 md:px-0">
				<h3 className="font-semibold text-lg mt-8">
					Explore our programs
				</h3>
				<CardContainer>
					{/* TODO: Link to the id of the course */}
					{categories.map((category, index) => (
						<CourseCard
							key={category._id}
							title={category.title}
							bgImg={images[index]}
						>
							<LinkButton
								href={`/courses`}
								text="View courses"
								size="sm"
							/>
						</CourseCard>
					))}
				</CardContainer>
				<h3 className="font-semibold text-lg mt-8">
					Weekend & holiday programs
				</h3>
				<CardContainer></CardContainer>
				<div className="flex justify-center mt-8">
					<Link
						to="/courses"
						prefetch="intent"
						className="hover:text-brand-orange transition ease-in-out duration-300 flex gap-2"
					>
						View all courses <ArrowRightIcon />
					</Link>
				</div>
			</div>
		</section>
	);
}

function CourseCard({ title, bgImg, children }) {
	return (
		<div className="opacity-0 fading-in bg-gray-100 border border-slate-300  hover:shadow-slate-200 rounded overflow-hidden hover:shadow-lg transition ease-in-out suration-300">
			<div>
				<img src={bgImg} alt="" className="h-48 w-full object-cover" />
			</div>
			<div className="p-6">
				<h4 className="text-brand-black text-lg mb-4">{title}</h4>
				{children}
			</div>
		</div>
	);
}

function Trustees() {
	const logos = ['/saints.jpeg', '/tassia-school-logo.png'];
	// useCountUp({ ref: 'counter', end: 100, enableScrollSpy: true, scrollSpyOnce: true });

	return (
		<section className="opacity-0 fading-in mt-20 max-w-6xl mx-auto px-4 md:px-8">
			{/* <h2 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl">Partnered with <span className="text-brand-orange" id="counter"></span><span className="text-brand-orange">+</span> schools</h2> */}
			<h2 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl">
				Partnered with
			</h2>
			<div className="flex justify-center mt-8">
				<div className="flex flex-col md:flex-row flex-wrap gap-5 justify-center">
					{logos.map((logo, index) => (
						<div key={index} className="w-20 md:w-36">
							<img
								src={logo}
								alt=""
								className="w-full h-full object-contain"
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function Contact() {
	const actionData = useActionData();

	const nameRef = useRef(null);
	const emailRef = useRef(null);
	const phoneRef = useRef(null);
	const messageRef = useRef(null);

	const navigation = useNavigation();
	const isSubmitting =
		navigation.state === 'submitting' &&
		navigation.formData.get('_action') === 'contact';

	return (
		<section
			id="contact"
			className="opacity-0 fading-in mt-20 max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8"
		>
			<h2 className="text-center font-semibold text-3xl md:text-4xl lg:text-5xl">
				Get in touch with us
			</h2>
			<div className="mt-8 flex flex-col landscape:flex-row landscape:items-start items-center md:items-start md:flex-row gap-4 lg:gap-10 justify-center">
				{/* No & email */}
				<div className="flex justify-center gap-4 items-end">
					<div className="flex flex-col items-center">
						<div className="w-14 md:w-20">
							<Phone />
						</div>
						<p>0792 717 119</p>
					</div>

					<div className="flex flex-col items-center">
						<div className="w-20">
							<Mailbox />
						</div>
						<p>info@paragoneschool.com</p>
					</div>
				</div>
				<div className="landscape:mt-8 md:mt-8">or</div>
				{/* Contact form */}
				<Form method="post" className="w-4/5 landscape:w-auto grow">
					<h3 className="text-center font-semibold">
						Send us a quick message
					</h3>
					<HoneypotInputs />
					<fieldset>
						<div>
							<label htmlFor="name">Name</label>
							<Input
								type="text"
								name="name"
								id="name"
								placeholder="John Doe"
								fieldError={actionData?.fieldErrors?.name}
								ref={nameRef}
							/>
						</div>
						<div>
							<label htmlFor="email">Email</label>
							<Input
								type="email"
								name="email"
								id="email"
								placeholder="johndoe@email.com"
								fieldError={actionData?.fieldErrors?.email}
								ref={emailRef}
							/>
						</div>
						<div>
							<label htmlFor="phone">Phone</label>
							<Input
								type="text"
								name="phone"
								id="phone"
								placeholder="John Doe"
								fieldError={actionData?.fieldErrors?.phone}
								ref={phoneRef}
							/>
						</div>
						<div>
							<label htmlFor="message">Message</label>
							<Input
								type="textarea"
								name="message"
								id="message"
								placeholder="Enter message here"
								fieldError={actionData?.fieldErrors?.message}
								ref={messageRef}
							/>
						</div>
						<button
							type="submit"
							name="_action"
							value="contact"
							className="bg-brand-orange hover:bg-orange-400 transition duration-300 ease-in-out text-black rounded capitalize px-5 py-3"
						>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</button>
					</fieldset>
				</Form>
			</div>
		</section>
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
						<div className="w-60 lg:w-72">
							<ErrorIllustration />
						</div>
						<h1 className="text-3xl font-semibold mt-4">
							{error.status} {error.statusText}
						</h1>
						<p>{error.data}</p>
					</div>
					<Link to="." className="underline text-brand-black">
						Try again
					</Link>
				</div>
			</div>
		);
	} else if (error instanceof Error) {
		console.log({ error });
		return (
			<div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center">
						{/* <div className="w-60 lg:w-72">
              <ErrorIllustration />
            </div> */}
						<h1 className="text-3xl font-semibold mt-4">Error</h1>
						<p>{error.message}</p>
					</div>
					<Link to="." className="underline text-brand-black">
						Try again
					</Link>
				</div>
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
