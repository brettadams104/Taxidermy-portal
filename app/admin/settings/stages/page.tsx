import Link from 'next/link';
import { getBusinessSettings } from '@/lib/actions/business';
import { StageEditor } from './stage-editor';

export default async function SettingsPage() {
  const { business, hasInProgressSkulls } = await getBusinessSettings();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link
          href="/admin/dashboard"
          className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8">
          <StageEditor
            initialStages={business.stages}
            hasInProgressSkulls={hasInProgressSkulls}
          />
        </div>
      </div>
    </div>
  );
}
