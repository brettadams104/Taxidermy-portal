-- Add Pending Pickup and Picked Up status values to skulls.status CHECK constraint
alter table public.skulls
drop constraint "skulls_status_check";

alter table public.skulls
add constraint "skulls_status_check" check (status in (
  'Deer Head Received',
  'Skull Skinned',
  'Maceration Period',
  'Skull Cleaning',
  'Degreasing',
  'Whitening',
  'Finished',
  'Pending Pickup',
  'Picked Up'
));
