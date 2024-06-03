import { DashboardCard } from "~/components/DashboardCard";

export default function DashboardIndex() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 lg:mt-12">
            <DashboardCard title='Completed courses' body='2' />
            <DashboardCard title='Certificates' body='2' />
            <DashboardCard title='Total hours spent' body='10' />
        </div>
    );
}

