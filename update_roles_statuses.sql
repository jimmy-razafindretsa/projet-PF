-- 1. Add supplier_note column to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS supplier_note TEXT;

-- 2. Clear existing statuses (assuming safe to do so or they map ID-for-ID. Let's explicitly delete and recreate to be safe, or just update existing.)
-- To avoid foreign key conflicts with existing orders, let's update ID 1-6 and insert 7.

INSERT INTO order_status (id, order_status_name) VALUES 
(1, 'To be submitted'),
(2, 'Submitted'),
(3, 'Checking'),
(4, 'Review Needed'),
(5, 'In production'),
(6, 'Shipped'),
(7, 'Review completed')
ON CONFLICT (id) DO UPDATE SET order_status_name = EXCLUDED.order_status_name;
