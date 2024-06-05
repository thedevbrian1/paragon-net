import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./styles/tailwind.css";
import "./styles/no-script.css";
import "./styles/animations.css";
import { ErrorIllustration, FacebookIcon, InstagramIcon, LinkedInIcon, Logo, ThreeDots, TiktokIcon, TwitterIcon } from "./components/Icon";;
import { navLinks } from "./utils";
import Input from "./components/Input";
import { createClient } from "./.server/supabase";
import { honeypot } from "~/.server/honeypot";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { useSpinDelay } from 'spin-delay';
// import { Search } from "./routes/search";
import { getSession, sessionStorage } from "./.server/session";
import Nav from "./components/Nav";

export async function loader({ request, response }) {
  const { supabaseClient, headers } = createClient(request);
  const { data, error } = await supabaseClient.auth.getSession();

  // throw new Error('Kaboom!');
  if (error) {
    throw new Error(error);
  }

  const user = data.session?.user;

  let username;

  if (user) {
    const { data: student, error: studentError } = await supabaseClient.from('students').select('first_name, last_name').eq('user_id', user.id);
    username = student[0]?.first_name;
    if (studentError) {
      throw new Error(studentError);
    }
  }

  let isAdmin = user?.email === process.env.ADMIN_EMAIL || user?.email === process.env.ADMIN_EMAIL_2;

  const session = await getSession(request);
  const toastMessage = session.get('toastMessage');

  // const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

  for (let [key, value] of headers.entries()) {
    response.headers.append(key, value);

  }
  response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));

  if (!toastMessage) {
    return { user: user?.id, username, toastMessage: null, honeypotInputProps: honeypot.getInputProps(), isAdmin };
  }

  return { user: user?.id, username, toastMessage, honeypotInputProps: honeypot.getInputProps(), isAdmin };
}

export function Layout({ children }) {
  const { user, username, toastMessage, honeypotInputProps, isAdmin } = useLoaderData();
  let location = useLocation();

  let navigation = useNavigation();
  let isLoading = navigation.state === 'loading' && !navigation.formMethod;

  let hasCategory = navigation.location && navigation.location.pathname.includes('/category');

  let isFromCourseDetail = location.pathname.includes('/category') && navigation?.location?.pathname === '/courses';

  let showLoadingState = useSpinDelay(isLoading && !hasCategory && !isFromCourseDetail, {
    delay: 150,
    minDuration: 500
  });

  const isLoggedIn = user ? true : false;

  const appId = "KG5XNDOMR2";
  const apiKey = "8601346d113a7a8af3eb890f76f5c193";
  // const searchClient = algoliasearch(appId, apiKey);

  let toastId = useRef(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    console.log({ toastMessage });

    const { message, type } = toastMessage;

    switch (type) {
      case "success": {
        toastId.current = toast.success(message);
        break;
      }
      case "error": {
        toastId.current = toast.error(message);
      }

      default:
        break;
    }
    return () => {
      toast.dismiss(toastId.current);
    }
  }, [toastMessage]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {/* <noscript>
          <link rel="stylesheet" href={noScriptStyles} />
        </noscript> */}
      </head>
      <body>
        {showLoadingState
          ? <div className="w-full fixed z-10 flex items-center justify-center inset-0 bg-black/50">
            {/* <p className="text-white">Loading...</p> */}
            <span className="w-20 h-20"><ThreeDots /></span>
          </div>
          : null
        }

        {isLoggedIn
          ? (<header className="bg-brand-gray py-8 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto  xl:mx-0 px-4 md:px-8 lg:px-4 flex flex-col items-center gap-6">
              <div className="w-full flex justify-between items-center gap-6">
                <Link to="/" prefetch="intent">
                  <div className="w-24 sm:w-40 lg:w-64">
                    <Logo />
                  </div>
                </Link>

                <div className="flex gap-4 items-center">
                  <div className="order-2 lg:order-1">
                    <Nav isLoggedIn={isLoggedIn} />
                  </div>

                  <div className="capitalize order-1 lg:order-2 flex gap-2 items-center">
                    <span className="text-brand-blue">Hi {isAdmin ? 'Admin' : username}</span>
                    {/* <Link to="/courses">
                      <UserIcon />
                    </Link> */}
                    <form method="post" action="/logout" className="hidden landscape:inline md:inline">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-brand-red text-white rounded"
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>
          </header>)
          : (<header className="sticky top-0 left-0 z-10 right-0  py-8  bg-white shadow">
            <div className="max-w-6xl mx-auto px-8 lg:px-0 flex justify-between items-center">
              <Link to="/" prefetch="intent">
                <div className="w-40 lg:w-64">
                  <Logo />
                </div>
              </Link>
              {/* <Search /> */}
              <Nav />
            </div>
          </header>)}
        <HoneypotProvider {...honeypotInputProps}>
          {children}
        </HoneypotProvider>
        {
          (location.pathname.includes('/dashboard') || location.pathname.includes('/admin'))
            ? null
            : <Footer />
        }
        <ToastContainer position="top-center" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return <Outlet />
}

function SubscribeForm() {
  const fetcher = useFetcher();
  // const actionData = useActionData();
  const emailRef = useRef(null);

  const isSubmitting = fetcher.state === 'submitting';

  return (
    <fetcher.Form method="post" className="flex justify-center lg:justify-start ">
      <fieldset className="flex md:flex-col justify-center gap-2 md:gap-0  items-center">
        <div className="">
          <label htmlFor="email">Email</label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="johndoe@email.com"
            fieldError={fetcher.data?.fieldErrors.email}
            ref={emailRef}
          />
        </div>
        <button
          type="submit"
          name="_action"
          value="waitlist"
          className="bg-brand-orange hover:bg-orange-400 focus:border-none focus:outline-none focus:ring-2 focus:ring-brand-black transition duration-300 ease-in-out text-black rounded capitalize px-4 py-2 md:w-full md:-mt-4">
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </fieldset>
    </fetcher.Form>
  );
}

function Footer() {

  return (
    <footer className="bg-brand-gray mt-20 py-16 divide-y divide-slate-300">
      <div className="px-6 xl:px-0 lg:max-w-4xl mx-auto  grid gap-4 landscape:grid-cols-2 landscape:gap-5 md:grid-cols-3 md:landscape:grid-cols-3 md:landscape:gap-4 lg:grid-cols-3 md:justify-items-center" >
        <div className="w-48 lg:w-64">
          <Logo />
        </div>
        <div>
          <h2 className="font-semibold mt-4 md:mt-0">Quick links</h2>
          <ul className="space-y-2 mt-2">
            {navLinks.map((navLink, index) => (
              <li key={index}>
                <Link to={navLink.path} className="hover:text-brand-orange transition duration-300 ease-in-out">
                  {navLink.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* <div>
          <h2 className="font-semibold">Subscibe to our newsletter</h2>
          <SubscribeForm />
        </div> */}
        <div>
          <h2 className="font-semibold">Follow us on social media</h2>
          <div className="flex gap-x-3 flex-wrap mt-3">
            {/* TODO: Use links to social media accounts instead */}
            <div className="w-6 hover:text-brand-orange transition ease-in-out duration-300">
              <a href="https://www.tiktok.com/@paragon.e_school?_t=8kXDAUzzDRV&_r=1" target="_blank" rel="noopener noreferrer">
                <TiktokIcon />
              </a>
            </div>
            <div className="w-6 hover:text-brand-orange transition ease-in-out duration-300">
              <a href="https://www.instagram.com/paragon.e_school?igsh=MWhldHNudTE0b21taw==" target="_blank" rel="noopener noreferrer">
                <InstagramIcon />
              </a>
            </div>
            <div className="w-6 hover:text-brand-orange transition ease-in-out duration-300">
              <TwitterIcon />
            </div>
            <div className="w-6 hover:text-brand-orange transition ease-in-out duration-300">
              <FacebookIcon />
            </div>
            <div className="w-6 hover:text-brand-orange transition ease-in-out duration-300">
              <LinkedInIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-6 pt-6">
        Paragon e-School&copy; {new Date().getFullYear()}
      </div>
    </footer>
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
            <h1 className="text-3xl font-semibold mt-4">{error.status} {error.statusText}</h1>
            <p>{error.data}</p>
          </div>
          <Link to='.' className="underline text-brand-black">
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
