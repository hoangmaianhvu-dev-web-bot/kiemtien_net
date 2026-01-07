
import { createClient } from '@supabase/supabase-js';

/**
 * CẢNH BÁO BẢO MẬT:
 * Hãy sử dụng 'anon' key (Public Key) từ Supabase Dashboard cho môi trường Client.
 * Nếu bị báo 'Key Leaked', bạn cần thu hồi key cũ và tạo key mới trong Supabase.
 */

const supabaseUrl = 'https://olenmrbbnacuhrmmxeas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZW5tcmJibmFjdWhybW14ZWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc3Mzg4MSwiZXhwIjoyMDgzMzQ5ODgxfQ.ikjFptrkbJhx9r9lVELtWU6x1RrSAqXp0xNOdlox7qY';

export const supabase = createClient(supabaseUrl, supabaseKey);
