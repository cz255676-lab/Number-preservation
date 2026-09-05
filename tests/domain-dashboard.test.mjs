import assert from "node:assert/strict";
import worker from "../worker/worker.js";

class MemoryKV {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
    this.throwOnGet = new Set();
  }

  async get(key, options) {
    if (this.throwOnGet.has(key)) throw new Error(`KV read failed: ${key}`);
    if (!this.values.has(key)) return null;
    const value = this.values.get(key);
    if (options && options.type === "json") return JSON.parse(value);
    return value;
  }

  async put(key, value) {
    this.values.set(key, String(value));
  }

  async delete(key) {
    this.values.delete(key);
  }
}

const kv = new MemoryKV({ session_token_test_session: "valid" });
const env = { ESIM_DB: kv, TG_BOT_TOKEN: "test-token", TG_CHAT_ID: "test-chat" };

async function call(path, options = {}) {
  const response = await worker.fetch(new Request(`https://dashboard.example${path}`, options), env, {});
  return response;
}

const pageResponse = await call("/domains");
assert.equal(pageResponse.status, 200);
assert.match(pageResponse.headers.get("content-type"), /^text\/html/);
const domainPageHtml = await pageResponse.text();
assert.match(domainPageHtml, /域名资产看板/);
assert.match(domainPageHtml, />续费\/管理<\/a>/);

const unauthorized = await call("/api/domains");
assert.equal(unauthorized.status, 401);

const headers = { "Content-Type": "application/json", Authorization: "test_session" };
const created = await call("/api/domains", {
  method: "POST",
  headers,
  body: JSON.stringify({
    domain: "Example.COM.",
    label: "测试站点",
    registrar: "Cloudflare",
    expireDate: "2026-12-31",
    autoRenew: true,
    annualCost: "68 元/年",
    renewalUrl: "https://registrar.example/manage",
    notifyAdvance: 30,
    notifyInterval: 7,
    notifyCount: 5,
    remark: "测试记录"
  })
});
assert.equal(created.status, 200);
const createdBody = await created.json();
assert.equal(createdBody.success, true);
assert.equal(createdBody.domain.domain, "example.com");
assert.equal(createdBody.domain.autoRenew, true);

const duplicate = await call("/api/domains", {
  method: "POST",
  headers,
  body: JSON.stringify({ domain: "example.com", expireDate: "2027-01-01" })
});
assert.equal(duplicate.status, 409);

const unsafeLink = await call("/api/domains", {
  method: "POST",
  headers,
  body: JSON.stringify({
    domain: "unsafe.example",
    expireDate: "2027-01-01",
    renewalUrl: "http://localhost/manage"
  })
});
assert.equal(unsafeLink.status, 400);

const invalidReminderNumber = await call("/api/domains", {
  method: "POST",
  headers,
  body: JSON.stringify({
    domain: "bad-number.example",
    expireDate: "2027-01-01",
    notifyInterval: "1.5"
  })
});
assert.equal(invalidReminderNumber.status, 400);

const listResponse = await call("/api/domains", { headers });
assert.equal(listResponse.status, 200);
const list = await listResponse.json();
assert.equal(list.length, 1);

const updated = await call("/api/domains", {
  method: "PUT",
  headers,
  body: JSON.stringify({ id: createdBody.domain.id, expireDate: "2027-12-31", autoRenew: false })
});
assert.equal(updated.status, 200);
const updatedBody = await updated.json();
assert.equal(updatedBody.domain.expireDate, "2027-12-31");
assert.equal(updatedBody.domain.autoRenew, false);

const localToday = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
await kv.put("domain_list", JSON.stringify([{
  ...updatedBody.domain,
  expireDate: localToday,
  renewalUrl: "https://registrar.example/manage"
}]));
await kv.put("esim_list", "[]");

const originalFetch = globalThis.fetch;
const telegramPayloads = [];
globalThis.fetch = async (url, options) => {
  assert.match(String(url), /^https:\/\/api\.telegram\.org\/bot/);
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
}

assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /域名到期提醒/);
assert.equal(telegramPayloads[0].reply_markup.inline_keyboard[0][0].text, "续费/管理");

telegramPayloads.length = 0;
const expiredFourteenDaysAgo = new Date(
  Date.parse(`${localToday}T00:00:00Z`) - 14 * 86400000
).toISOString().slice(0, 10);
await kv.put("domain_list", JSON.stringify([{ ...updatedBody.domain, expireDate: expiredFourteenDaysAgo }]));
await kv.put("esim_list", "[]");
globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(telegramPayloads.length, 0);

telegramPayloads.length = 0;
await kv.put("domain_list", JSON.stringify([{ ...updatedBody.domain, expireDate: "2200-01-01" }]));
await kv.put("esim_list", JSON.stringify([{
  id: "sim_test",
  name: "测试卡",
  number: "+852 00000000",
  cycle: 365,
  expireDate: localToday,
  notifyAdvance: 15,
  notifyInterval: 1,
  notifyCount: 0,
  rechargeUrl: "https://carrier.example/recharge"
}]));

globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /eSIM 到期提醒/);
assert.equal(telegramPayloads[0].reply_markup.inline_keyboard[0][0].text, "续费/管理");

telegramPayloads.length = 0;
kv.throwOnGet.add("domain_list");
globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
  kv.throwOnGet.delete("domain_list");
}
assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /eSIM 到期提醒/);

await kv.put("domain_list", JSON.stringify([updatedBody.domain]));

const deleted = await call("/api/domains", {
  method: "DELETE",
  headers,
  body: JSON.stringify({ id: createdBody.domain.id })
});
assert.equal(deleted.status, 200);

console.log("domain dashboard tests: ok");
