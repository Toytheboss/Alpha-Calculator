const STATE_KEY = "state";

export function generateShareToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function recordAccountId(r, accounts) {
  if (r.accountId) return r.accountId;
  if (r.account) {
    const acc = accounts.find((a) => a.name === r.account);
    return acc ? acc.id : null;
  }
  return null;
}

export function filterStateByAccount(full, accountId) {
  const accounts = (full.accounts || []).filter((a) => a.id === accountId);
  if (!accounts.length) return null;
  const records = (full.records || []).filter(
    (r) => recordAccountId(r, full.accounts || []) === accountId
  );
  return { accounts, records };
}

export async function loadFullState(kv) {
  const raw = await kv.get(STATE_KEY);
  if (!raw) return { accounts: [], records: [] };
  return JSON.parse(raw);
}
