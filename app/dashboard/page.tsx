import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div className="space-y-8">
      <div className="bg-canvas-soft rounded-md p-8 border border-mute">
        <h1 className="display-lg mb-2">Welcome back, {user?.name}</h1>
        <p className="text-body-lg text-body-mid">
          You are logged in as <span className="font-semibold text-ink">{user?.role}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-content border border-mute">
          <h2 className="display-sub-sm mb-4">RACI Matrix</h2>
          <p className="text-body-sm text-body mb-6">
            View and manage role assignments and task responsibilities.
          </p>
          <a href="/dashboard/raci" className="btn-secondary inline-block">Go to Matrix</a>
        </div>
        <div className="card-content border border-mute">
          <h2 className="display-sub-sm mb-4">Document Tracking</h2>
          <p className="text-body-sm text-body mb-6">
            Track task progress, deadlines, and current blockers across all divisions.
          </p>
          <a href="/dashboard/tracking" className="btn-secondary inline-block">View Tracking</a>
        </div>
        {(user?.role === "SUPER_ADMIN" || user?.role === "BENDAHARA" || user?.role === "PENASIHAT") && (
          <div className="card-content border border-mute bg-ink text-on-primary">
            <h2 className="display-sub-sm mb-4">RAB Module</h2>
            <p className="text-body-sm text-mute mb-6">
              View and manage budget plans and approvals.
            </p>
            <a href="/dashboard/rab" className="btn-primary inline-block bg-primary text-on-primary border-none">View Budgets</a>
          </div>
        )}
      </div>
    </div>
  );
}
