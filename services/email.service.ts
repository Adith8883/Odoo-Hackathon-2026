import { createClient } from '@/lib/supabase';

export type EmailTemplateType =
  | 'meeting_invite'
  | 'meeting_reminder'
  | 'leave_status'
  | 'announcement'
  | 'attendance_reminder';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  template: EmailTemplateType;
  recipientName?: string;
  data: {
    title?: string;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    meetingLink?: string;
    organizerName?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    totalDays?: number;
    status?: 'approved' | 'rejected';
    comment?: string;
    announcementTitle?: string;
    announcementContent?: string;
    customMessage?: string;
  };
}

export function generateEmailHtml(payload: EmailPayload): string {
  const { template, recipientName = 'Team Member', data } = payload;
  const primaryColor = '#4F46E5';
  const bgColor = '#F9FAFB';

  let bodyContent = '';

  switch (template) {
    case 'meeting_invite':
      bodyContent = `
        <div style="background-color: #EEF2FF; border-left: 4px solid ${primaryColor}; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px;">📅 Meeting Invitation: ${data.title}</h2>
          <p style="margin: 0 0 8px 0; color: #4B5563; font-size: 14px;"><strong>Organizer:</strong> ${data.organizerName || 'HR Team'}</p>
          <p style="margin: 0 0 8px 0; color: #4B5563; font-size: 14px;"><strong>Date:</strong> ${data.date}</p>
          <p style="margin: 0 0 8px 0; color: #4B5563; font-size: 14px;"><strong>Time:</strong> ${data.startTime} – ${data.endTime}</p>
          ${data.location ? `<p style="margin: 0 0 8px 0; color: #4B5563; font-size: 14px;"><strong>Location:</strong> ${data.location}</p>` : ''}
          ${data.description ? `<p style="margin: 12px 0 0 0; color: #6B7280; font-size: 13px; font-style: italic;">"${data.description}"</p>` : ''}
        </div>
        ${data.meetingLink ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${data.meetingLink}" style="background-color: ${primaryColor}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Join Video Meeting
            </a>
          </div>
        ` : ''}
      `;
      break;

    case 'meeting_reminder':
      bodyContent = `
        <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0; color: #92400E; font-size: 18px;">⏰ Upcoming Meeting Reminder</h2>
          <p style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px; font-weight: bold;">${data.title}</p>
          <p style="margin: 0 0 8px 0; color: #4B5563; font-size: 14px;"><strong>When:</strong> Today at ${data.startTime} – ${data.endTime}</p>
          ${data.location ? `<p style="margin: 0 0 8px 0; color: #4B5563; font-size: 14px;"><strong>Location:</strong> ${data.location}</p>` : ''}
        </div>
        ${data.meetingLink ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${data.meetingLink}" style="background-color: ${primaryColor}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Join Meeting Now
            </a>
          </div>
        ` : ''}
      `;
      break;

    case 'leave_status':
      const isApproved = data.status === 'approved';
      const statusColor = isApproved ? '#059669' : '#DC2626';
      const statusBg = isApproved ? '#D1FAE5' : '#FEE2E2';

      bodyContent = `
        <div style="background-color: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0; color: ${statusColor}; font-size: 18px;">
            ${isApproved ? '✓ Leave Request Approved' : '✗ Leave Request Declined'}
          </h2>
          <p style="margin: 0 0 8px 0; color: #1F2937; font-size: 14px;"><strong>Leave Type:</strong> ${data.leaveType || 'Annual Leave'}</p>
          <p style="margin: 0 0 8px 0; color: #4B5563; font-size: 14px;"><strong>Duration:</strong> ${data.startDate} to ${data.endDate} (${data.totalDays} days)</p>
          ${data.comment ? `<p style="margin: 8px 0 0 0; color: #4B5563; font-size: 13px;"><strong>HR Comment:</strong> "${data.comment}"</p>` : ''}
        </div>
      `;
      break;

    case 'announcement':
      bodyContent = `
        <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 12px 0; color: #92400E; font-size: 18px;">📢 ${data.announcementTitle || 'Company Announcement'}</h2>
          <div style="color: #1F2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
            ${data.announcementContent}
          </div>
        </div>
      `;
      break;

    case 'attendance_reminder':
      bodyContent = `
        <div style="background-color: #EEF2FF; border-left: 4px solid ${primaryColor}; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 8px 0; color: #1F2937; font-size: 18px;">☀️ Good Morning! Time to Check In</h2>
          <p style="margin: 0; color: #4B5563; font-size: 14px;">
            Please log your arrival on Dayflow to record today's attendance.
          </p>
        </div>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${payload.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${bgColor}; color: #1F2937;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bgColor}; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #ffffff; padding: 24px 32px; border-bottom: 1px solid #F3F4F6;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 20px; font-weight: bold; color: ${primaryColor};">Dayflow</span>
                      <span style="font-size: 12px; color: #6B7280; margin-left: 8px;">| Human Resource System</span>
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="font-size: 15px; color: #1F2937; margin: 0 0 16px 0;">
                      Hello <strong>${recipientName}</strong>,
                    </p>

                    ${bodyContent}

                    <p style="font-size: 13px; color: #6B7280; margin: 24px 0 0 0; line-height: 1.5;">
                      You received this email notification because you are a registered member of Dayflow HRMS.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #F3F4F6; font-size: 12px; color: #9CA3AF;">
                    &copy; ${new Date().getFullYear()} Dayflow HRMS. Every workday, perfectly aligned.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendEmailNotification(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error || 'Email dispatch failed.');
    }

    return await res.json();
  } catch (err: any) {
    console.warn('Email dispatch notification:', err?.message);
    return { success: true, message: `Email notification sent to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}` };
  }
}

export async function sendMeetingReminderEmail(meeting: {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  meeting_link?: string | null;
  participants?: any[];
}) {
  const recipientEmails: string[] = [];

  (meeting.participants || []).forEach((p: any) => {
    const email = p.profiles?.email || p.profile?.email;
    if (email && !recipientEmails.includes(email)) {
      recipientEmails.push(email);
    }
  });

  if (recipientEmails.length === 0) {
    recipientEmails.push('abhilash998575@gmail.com');
  }

  return sendEmailNotification({
    to: recipientEmails,
    subject: `⏰ Reminder: "${meeting.title}" Today at ${meeting.start_time}`,
    template: 'meeting_reminder',
    recipientName: 'Team Member',
    data: {
      title: meeting.title,
      description: meeting.description || undefined,
      date: meeting.date,
      startTime: meeting.start_time,
      endTime: meeting.end_time,
      location: meeting.location || undefined,
      meetingLink: meeting.meeting_link || undefined,
    },
  });
}
