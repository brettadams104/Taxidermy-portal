import { createClient } from '@/lib/supabase/server'
import { TemplateEditor } from './template-editor'

export default async function NotificationsSettingsPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase.from('notification_templates').select('*')

  const emailTemplate = templates?.find(t => t.type === 'email')
  const smsTemplate = templates?.find(t => t.type === 'sms')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notification Templates</h1>
      <p className="text-sm text-gray-500">
        Sent automatically when you mark a skull as Finished. Available variables:{' '}
        <code className="bg-gray-100 px-1 rounded">{'{name}'}</code>{' '}
        <code className="bg-gray-100 px-1 rounded">{'{points}'}</code>{' '}
        <code className="bg-gray-100 px-1 rounded">{'{dnr_tag}'}</code>{' '}
        <code className="bg-gray-100 px-1 rounded">{'{business_name}'}</code>
      </p>
      {emailTemplate && <TemplateEditor template={emailTemplate} label="Email Template" />}
      {smsTemplate && <TemplateEditor template={smsTemplate} label="SMS Message" />}
    </div>
  )
}
