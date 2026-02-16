
-- Enable the pg_net extension to make HTTP requests
create extension if not exists "pg_net";

-- Create a function to handle the webhook logic
create or replace function public.handle_orders_webhook()
returns trigger
language plpgsql
security definer
as $$
declare
  -- CHANGE THIS URL FOR PRODUCTION DEPLOYMENT
  -- Local: http://host.docker.internal:54321/functions/v1/handle-orders
  -- Prod: https://[YOUR_PROJECT_REF].supabase.co/functions/v1/handle-orders
  request_url text := 'https://tsqwbyeuyvmigmyqfzla.supabase.co/functions/v1/handle-orders'; 
  payload jsonb;
begin
  -- Construct the payload
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', row_to_json(OLD)
  );

  -- Send the HTTP POST request
  -- Note: net.http_post is asynchronous
  perform net.http_post(
    url := request_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  return null;
end;
$$;

-- Create the trigger
drop trigger if exists send_order_email on public."Order";
create trigger send_order_email
after insert or update or delete
on public."Order"
for each row
execute function public.handle_orders_webhook();
