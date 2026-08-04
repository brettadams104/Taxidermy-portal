import { StatusProgressBar } from '@/components/status-progress-bar';
import { requireBusiness } from '@/lib/supabase/server';
import { getFinalStage } from '@/lib/queries/stages';
import { getAllSkullsByBusiness } from '@/lib/queries/skulls';

export default async function DashboardPage() {
  // Get current user's business (required)
  const business = await requireBusiness();
  const finalStage = getFinalStage(business.stages);

  // Get skulls for this business using multi-tenant query
  const skulls = await getAllSkullsByBusiness(business.id);

  // Filter based on dynamic final stage (not hardcoded 'Finished'/'Picked Up')
  const activeProjects = skulls.filter(s => s.status !== finalStage);
  const completedProjects = skulls.filter(s => s.status === finalStage);

  // Get counts by stage
  const stageCounts = business.stages.map(stage => ({
    stage,
    count: skulls.filter(s => s.status === stage).length,
  }));

  return (
    <div className="p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Total Projects</h3>
          <p className="text-3xl font-bold">{skulls.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">In Progress</h3>
          <p className="text-3xl font-bold">{activeProjects.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">Completed</h3>
          <p className="text-3xl font-bold">{completedProjects.length}</p>
        </div>
      </div>

      {/* Active Projects Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
        <div className="grid gap-4">
          {activeProjects.length === 0 ? (
            <p className="text-gray-500">No active projects</p>
          ) : (
            activeProjects.map(skull => (
              <div key={skull.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">{skull.client_id}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {skull.status}
                  </span>
                </div>
                {/* Pass dynamic stages to progress bar */}
                <StatusProgressBar
                  currentStatus={skull.status}
                  allStages={business.stages}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Projects Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Completed Projects</h2>
        <div className="grid gap-4">
          {completedProjects.length === 0 ? (
            <p className="text-gray-500">No completed projects</p>
          ) : (
            completedProjects.map(skull => (
              <div key={skull.id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-semibold">Client: {skull.client_id}</p>
                <p className="text-sm text-gray-600">Status: {skull.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Projects by Stage</h2>
        <div className="grid gap-2">
          {stageCounts.map(({ stage, count }) => (
            <div key={stage} className="flex justify-between bg-gray-50 p-3 rounded">
              <span>{stage}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
