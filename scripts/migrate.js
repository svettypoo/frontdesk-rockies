const https = require('https');

const SUPABASE_URL = 'https://xocfduqugghailalzlqy.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sql(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    // Use direct postgres connection via supabase SQL endpoint
    const req = https.request({
      hostname: 'xocfduqugghailalzlqy.supabase.co',
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Use Supabase Management API to run SQL
async function runSQL(sqlText) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sqlText });
    const req = https.request({
      hostname: 'xocfduqugghailalzlqy.supabase.co',
      path: '/pg/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data.substring(0, 200)}`);
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const migrations = [
    `CREATE TABLE IF NOT EXISTS fd_devices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_name TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'offline' CHECK (status IN ('online','offline','maintenance')),
      ip_address TEXT,
      last_active TIMESTAMPTZ,
      current_map TEXT,
      jitsi_room TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS fd_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      guest_name TEXT NOT NULL,
      guest_email TEXT,
      room_number TEXT NOT NULL,
      booking_date DATE NOT NULL,
      booking_time TEXT,
      booking_type TEXT NOT NULL CHECK (booking_type IN ('hot_tub','parking','locker')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
      notes TEXT,
      parking_spot TEXT,
      locker_number TEXT,
      device_id UUID REFERENCES fd_devices(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS fd_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id UUID REFERENCES fd_devices(id),
      guest_name TEXT,
      session_type TEXT DEFAULT 'video_chat' CHECK (session_type IN ('video_chat','support','payment')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active','ended')),
      jitsi_room TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      ended_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS fd_payment_instructions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id UUID REFERENCES fd_devices(id),
      guest_name TEXT,
      guest_email TEXT,
      guest_phone TEXT,
      amount NUMERIC(10,2) NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','paid','cancelled')),
      stripe_payment_link TEXT,
      stripe_payment_intent_id TEXT,
      sent_via TEXT,
      sent_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `ALTER TABLE fd_devices ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE fd_bookings ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE fd_sessions ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE fd_payment_instructions ENABLE ROW LEVEL SECURITY`,
    `CREATE POLICY IF NOT EXISTS "anon_all_fd_devices" ON fd_devices FOR ALL USING (true) WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "anon_all_fd_bookings" ON fd_bookings FOR ALL USING (true) WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "anon_all_fd_sessions" ON fd_sessions FOR ALL USING (true) WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "anon_all_fd_payment" ON fd_payment_instructions FOR ALL USING (true) WITH CHECK (true)`,
  ];

  for (const m of migrations) {
    const result = await runSQL(m);
    if (result.status !== 200 && result.status !== 201) {
      console.error('Migration may have failed:', m.substring(0, 60));
    }
  }
  console.log('Done');
}

main().catch(console.error);
