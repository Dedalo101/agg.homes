/**
 * Point agg.homes DNS at Cloudflare Pages via Porkbun API.
 *
 * Usage (PowerShell):
 *   $env:PORKBUN_API_KEY = "pk1_..."
 *   $env:PORKBUN_SECRET_API_KEY = "sk1_..."
 *   $env:CLOUDFLARE_PAGES_TARGET = "agg-homes.pages.dev"  # optional
 *   node scripts/porkbun-dns-cloudflare.js
 *
 * Dry run:
 *   $env:DRY_RUN = "1"
 *   node scripts/porkbun-dns-cloudflare.js
 */
const DOMAIN = 'agg.homes';
const API_BASE = 'https://api.porkbun.com/api/json/v3';
const PAGES_TARGET = process.env.CLOUDFLARE_PAGES_TARGET || 'agg-homes.pages.dev';
const DRY_RUN = process.env.DRY_RUN === '1';

function creds() {
  const apikey = process.env.PORKBUN_API_KEY || process.env.PORKBUN_APIKEY;
  const secretapikey =
    process.env.PORKBUN_SECRET_API_KEY || process.env.PORKBUN_SECRETAPIKEY;
  if (!apikey || !secretapikey) {
    throw new Error(
      'Missing PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY environment variables.'
    );
  }
  return { apikey, secretapikey };
}

async function porkbun(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...creds(), ...body }),
  });
  const data = await res.json();
  if (data.status !== 'SUCCESS') {
    const err = new Error(data.message || `Porkbun error on ${path}`);
    err.code = data.code;
    err.payload = data;
    throw err;
  }
  return data;
}

async function ping() {
  const data = await porkbun('/ping');
  if (!data.credentialsValid) {
    throw new Error('Porkbun credentials invalid');
  }
  console.log(`Porkbun API OK — caller IP ${data.yourIp}`);
}

async function listRecords() {
  const data = await porkbun(`/dns/retrieve/${DOMAIN}`);
  return data.records || [];
}

function isApexOrWww(rec) {
  const name = String(rec.name || '').toLowerCase();
  return name === '' || name === '@' || name === 'www' || name === DOMAIN.toLowerCase();
}

function isGithubPagesRecord(rec) {
  if (!isApexOrWww(rec)) return false;
  const content = String(rec.content || '').toLowerCase();
  if (rec.type === 'CNAME' && content.includes('github.io')) return true;
  if (rec.type === 'A' && content.startsWith('185.199.')) return true;
  if (rec.type === 'AAAA' && content.startsWith('2606:50c0:800')) return true;
  return false;
}

function wantsCloudflare(rec) {
  const target = PAGES_TARGET.toLowerCase();
  const content = String(rec.content || '').toLowerCase().replace(/\.$/, '');
  if (rec.name === '' || rec.name === '@') {
    return rec.type === 'ALIAS' && content === target;
  }
  if (rec.name === 'www') {
    return rec.type === 'CNAME' && content === target;
  }
  return false;
}

async function deleteRecord(id) {
  if (DRY_RUN) {
    console.log(`  [dry-run] delete ${id}`);
    return;
  }
  await porkbun(`/dns/delete/${DOMAIN}/${id}`);
  console.log(`  deleted ${id}`);
}

async function createRecord(spec) {
  if (DRY_RUN) {
    console.log(`  [dry-run] create ${spec.type} ${spec.name || '@'} → ${spec.content}`);
    return;
  }
  await porkbun(`/dns/create/${DOMAIN}`, spec);
  console.log(`  created ${spec.type} ${spec.name || '@'} → ${spec.content}`);
}

async function run() {
  await ping();
  const records = await listRecords();
  console.log(`Current records for ${DOMAIN}: ${records.length}`);

  const githubRecords = records.filter(isGithubPagesRecord);

  console.log(`Removing ${githubRecords.length} GitHub Pages record(s)…`);
  for (const rec of githubRecords) {
    console.log(`  - ${rec.type} ${rec.name || '@'} → ${rec.content} (id ${rec.id})`);
    await deleteRecord(rec.id);
  }

  const hasApex = records.some(wantsCloudflare);
  const hasWww = records.some(
    (r) => r.name === 'www' && r.type === 'CNAME' && String(r.content).includes(PAGES_TARGET)
  );

  if (!hasApex) {
    console.log(`Adding apex ALIAS → ${PAGES_TARGET}`);
    await createRecord({
      type: 'ALIAS',
      name: '',
      content: PAGES_TARGET,
      ttl: '600',
    });
  }

  if (!hasWww) {
    console.log(`Adding www CNAME → ${PAGES_TARGET}`);
    await createRecord({
      type: 'CNAME',
      name: 'www',
      content: PAGES_TARGET,
      ttl: '600',
    });
  }

  const finalRecords = DRY_RUN ? records : await listRecords();
  console.log('\nDone. Final DNS (non-GitHub records preserved):');
  for (const rec of finalRecords) {
    if (isGithubPagesRecord(rec)) continue;
    console.log(`  ${rec.type.padEnd(6)} ${(rec.name || '@').padEnd(8)} ${rec.content}`);
  }
  console.log(`\nTarget: https://${DOMAIN}/ (propagation: 5–60 min)`);
  if (DRY_RUN) console.log('DRY_RUN=1 — no changes were made.');
}

run().catch((err) => {
  console.error(err.message || err);
  if (err.payload) console.error(JSON.stringify(err.payload, null, 2));
  process.exit(1);
});