import { redirect } from 'next/navigation';

export default function ClientDashboardRedirect() {
    redirect('/client_dashboard/production');
}
