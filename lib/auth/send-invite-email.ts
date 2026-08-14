'use server'

import { Resend } from 'resend'
import { generateInvitationLink } from './invitations'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function generateAndSendInvite(email: string) {
  if (!email) {
    throw new Error('Email is required')
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('Resend API key not configured')
  }

  const resend = new Resend(apiKey)

  // Generate the invitation link (WITHOUT sending email)
  const link = await generateInvitationLink(email)

  // Send email with the link
  try {
    await resend.emails.send({
      from: `noreply@guidestride.com`,
      to: email,
      subject: 'You\'re invited to Skull Studio',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2>You're invited to Skull Studio</h2>
          <p>An admin has invited you to join their business on Skull Studio.</p>
          <p style="margin: 24px 0;">
            <a href="${link}" style="background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy this link: <br/>
            <code>${link}</code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            This invitation expires in 7 days.
          </p>
        </div>
      `,
    })

    // Mark invitation as sent
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceRoleKey) {
      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)
      await supabase
        .from('invitations')
        .update({ sent_at: new Date().toISOString() })
        .match({ email })
        .order('created_at', { ascending: false })
        .limit(1)
    }

    return { success: true, link }
  } catch (error) {
    console.error('Failed to send invite email:', error)
    throw new Error('Failed to send email. The link was generated but email delivery failed.')
  }
}
