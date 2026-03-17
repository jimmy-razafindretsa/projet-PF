-- Update existing product types to the new names based on their IDs
UPDATE product_type SET product_type_name = 'Tailored Suit' WHERE id = 1;
UPDATE product_type SET product_type_name = 'Tailored Tuxedo' WHERE id = 2;
UPDATE product_type SET product_type_name = 'Jacket/Blazer' WHERE id = 3;
UPDATE product_type SET product_type_name = 'Pants' WHERE id = 4;

-- Optional: If the 'waistcoat' (id=5) is no longer offered, you can delete it if no orders depend on it.
-- Otherwise, it's safe to just leave it in the database and it won't be shown in the new UI.
-- DELETE FROM product_type WHERE id = 5;
