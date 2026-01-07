
import { createClient } from '@supabase/supabase-js';

/**
 * CẢNH BÁO BẢO MẬT:
 * Bạn hiện đang sử dụng 'service_role' key. Khóa này có quyền ADMIN tối cao 
 * và KHÔNG ĐƯỢC PHÉP công khai ở phía client.
 * 
 * LỖI 'Key Leaked' xảy ra khi GitHub hoặc Supabase phát hiện khóa quan trọng bị lộ.
 * GIẢI PHÁP: Hãy sử dụng 'anon' key (Public Key) từ Supabase Dashboard.
 */

const supabaseUrl = 'https://olenmrbbnacuhrmmxeas.supabase.co';
// HÃY THAY THẾ GIÁ TRỊ DƯỚI ĐÂY BẰNG PUBLIC 'anon' key CỦA BẠN TRONG SUPABASE DASHBOARD
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZW5tcmJibmFjdWhybW14ZWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc3Mzg4MSwiZXhwIjoyMDgzMzQ5ODgxfQ.ikjFptrkbJhx9r9lVELtWU6x1RrSAqXp0xNOdlox7qY';

export const supabase = createClient(supabaseUrl, supabaseKey);
