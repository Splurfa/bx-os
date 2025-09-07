import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UrgencyNotificationRequest {
  urgencyLevel: 'standard' | 're_integration' | 'urgent';
  title: string;
  message: string;
  data: {
    studentName: string;
    teacherName: string;
    behaviors: string[];
    contextId?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { urgencyLevel, title, message, data }: UrgencyNotificationRequest = await req.json();

    console.log('Processing urgency notification:', { urgencyLevel, title, data });

    // Get admin users for urgent notifications
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('role', ['admin', 'super_admin']);

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
    }

    let notifications = [];

    // Handle urgent submissions
    if (urgencyLevel === 'urgent') {
      // Send Slack notification for urgent cases
      await sendSlackNotification('urgent', {
        title: `🚨 URGENT BEHAVIOR SUPPORT REQUEST`,
        message: `Student: ${data.studentName}\nTeacher: ${data.teacherName}\nBehaviors: ${data.behaviors.join(', ')}\nTime: ${new Date().toLocaleString()}`,
        color: '#ff4444'
      });

      // Send email to all admins for urgent cases
      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          await sendEmailNotification({
            to: admin.email,
            subject: `🚨 URGENT BSR - ${data.studentName}`,
            message: `An urgent behavior support request has been created for ${data.studentName} by ${data.teacherName}.\n\nBehaviors: ${data.behaviors.join(', ')}\n\nPlease review immediately in the admin dashboard.`
          });
        }
      }

      notifications.push({
        type: 'slack_urgent',
        status: 'sent',
        recipients: ['urgent-channel']
      });

      notifications.push({
        type: 'email_admin',
        status: 'sent',
        recipients: adminUsers?.map(u => u.email) || []
      });
    }

    // Handle re-integration submissions
    else if (urgencyLevel === 're_integration') {
      // Send Slack notification for re-integration
      await sendSlackNotification('reintegration', {
        title: `⚠️ Re-Integration BSR Created`,
        message: `Student: ${data.studentName}\nTeacher: ${data.teacherName}\nBehaviors: ${data.behaviors.join(', ')}\nTime: ${new Date().toLocaleString()}`,
        color: '#ffaa00'
      });

      notifications.push({
        type: 'slack_reintegration',
        status: 'sent',
        recipients: ['reintegration-channel']
      });
    }

    console.log('Urgency notifications sent:', notifications);

    return new Response(JSON.stringify({
      success: true,
      urgencyLevel,
      notifications
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-urgency-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function sendSlackNotification(channel: 'urgent' | 'reintegration', payload: {
  title: string;
  message: string;
  color: string;
}) {
  try {
    const webhookUrl = channel === 'urgent' 
      ? Deno.env.get('SLACK_URGENT_WEBHOOK_URL')
      : Deno.env.get('SLACK_REINTEGRATION_WEBHOOK_URL');

    if (!webhookUrl) {
      console.warn(`No Slack webhook URL configured for ${channel} channel`);
      return;
    }

    const slackPayload = {
      attachments: [{
        color: payload.color,
        title: payload.title,
        text: payload.message,
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log(`Slack notification sent to ${channel} channel`);
  } catch (error) {
    console.error(`Failed to send Slack notification to ${channel}:`, error);
  }
}

async function sendEmailNotification(payload: {
  to: string;
  subject: string;
  message: string;
}) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.warn('No Resend API key configured for email notifications');
      return;
    }

    const emailPayload = {
      from: 'BX-OS Alerts <alerts@hillelhebrew.org>',
      to: [payload.to],
      subject: payload.subject,
      text: payload.message,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    console.log(`Email notification sent to ${payload.to}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

serve(handler);