-- Initialize kiosk configurations
INSERT INTO kiosks (id, name, location, is_active, device_info) VALUES 
(1, 'Reflection Kiosk 1', 'Main Hallway', true, '{"type": "tablet", "screen_size": "10_inch"}'),
(2, 'Reflection Kiosk 2', 'Library Area', true, '{"type": "tablet", "screen_size": "10_inch"}'),
(3, 'Reflection Kiosk 3', 'Counselor Office', true, '{"type": "tablet", "screen_size": "10_inch"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active,
  device_info = EXCLUDED.device_info,
  updated_at = now();