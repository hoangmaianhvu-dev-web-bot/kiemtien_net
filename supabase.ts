
import { createClient } from '@supabase/supabase-js';

/**
 * CẢNH BÁO BẢO MẬT QUAN TRỌNG:
 * Bạn hiện đang sử dụng 'service_role' key. Khóa này có quyền ADMIN tối cao 
 * và KHÔNG ĐƯỢC PHÉP công khai ở phía client (web trình duyệt). 
 * 
 * LỖI BẠN GẶP (Key Leaked) là do GitHub/Supabase phát hiện khóa admin bị lộ.
 * 
 * GIẢI PHÁP: 
 * 1. Vào Supabase Dashboard -> Settings -> API.
 * 2. Tìm 'anon' key (Public Key).
 * 3. Thay thế giá trị của supabaseKey ở dưới bằng 'anon' key đó.
 */

const supabaseUrl = 'https://olenmrbbnacuhrmmxeas.supabase.co';
// HÃY THAY THẾ KEY DƯỚI ĐÂY BẰNG 'anon' key CỦA BẠN
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZW5tcmJibmFjdWhybW14ZWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc3Mzg4MSwiZXhwIjoyMDgzMzQ5ODgxfQ.ikjFptrkbJhx9r9lVELtWU6x1RrSAqXp0xNOdlox7qY';

export const supabase = createClient(supabaseUrl, supabaseKey);
