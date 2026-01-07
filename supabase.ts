import { createClient } from '@supabase/supabase-js';

// URL và Key được cấu hình từ dự án Supabase
const supabaseUrl = 'https://olenmrbbnacuhrmmxeas.supabase.co';

// Sử dụng Anon Key để truy cập các bảng công khai
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZW5tcmJibmFjdWhybW14ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NzM4ODEsImV4cCI6MjA4MzM0OTg4MX0.PijCMjyho9A0H8GX1MeGNhFBZbQqxxWOmjjpdrpEcwY';

export const supabase = createClient(supabaseUrl, supabaseKey);
