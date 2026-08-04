// app/admin/settings/stages/page.tsx
import { getBusinessSettings } from '@/lib/actions/business';
import { StageEditor } from './stage-editor';
import Link from 'next/link';

export default async function SettingsPage() {
  const { business, hasInProgressSkulls } = await getBusinessSettings();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/admin/dashboard"
          className="text-blue-600 hover:underline text-sm mb-6 block"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600 mt-2">Manage your workflow and configuration</p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Workflow Stages</h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize the stages of your skull processing workflow
            </p>
          </div>

          <div className="p-6">
            <StageEditor
              initialStages={business.stages}
              hasInProgressSkulls={hasInProgressSkulls}
            />
          </div>
        </div>

        {/* Info section */}
        {hasInProgressSkulls && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">Active Projects in Progress</h3>
            <p className="text-sm text-blue-800 mt-2">
              You currently have skulls in progress. If you change your workflow stages,
              in-progress skulls will be reset to the first stage of your new workflow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
