insert into public.notification_templates (type, subject, body) values
(
  'email',
  'Your skull is ready for pickup!',
  'Hi {name},

Great news! Your {points}-point skull (DNR Tag: {dnr_tag}) has been completed and is ready for pickup.

Please contact us to arrange pickup at your convenience.

Thanks for choosing {business_name}!'
),
(
  'sms',
  null,
  'Hi {name}, your skull is finished and ready for pickup! Contact us to schedule. - {business_name}'
);
