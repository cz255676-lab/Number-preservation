import assert from "node:assert/strict";
import worker from "../worker/worker.js";
import { VPN_HTML_CONTENT } from "../worker/vpn-page.js";

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

const kv = new MemoryKV({
  session_token_test_session: "valid",
  esim_list: "[]",
  domain_list: "[]"
});
const env = { ESIM_DB: kv, TG_BOT_TOKEN: "test-token", TG_CHAT_ID: "test-chat" };

async function call(path, options = {}) {
  return worker.fetch(new Request(`https://dashboard.example${path}`, options), env, {});
}

const inlineScripts = [...VPN_HTML_CONTENT.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1].trim())
  .filter(Boolean);
assert.equal(inlineScripts.length, 1);
for (const source of inlineScripts) new Function(source);
assert.ok(inlineScripts[0].includes("if (!/^\\d{6}$/.test(code))"));

const pageResponse = await call("/vpns");
assert.equal(pageResponse.status, 200);
assert.match(pageResponse.headers.get("content-type"), /^text\/html/);
assert.match(await pageResponse.text(), /VPN 资产看板/);

const rootResponse = await call("/");
assert.match(await rootResponse.text(), /href="\/vpns"/);
const domainPageResponse = await call("/domains");
assert.match(await domainPageResponse.text(), /href="\/vpns"/);

const unauthorized = await call("/api/vpns");
assert.equal(unauthorized.status, 401);

const headers = { "Content-Type": "application/json", Authorization: "test_session" };
const created = await call("/api/vpns", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "香港高速套餐",
    provider: "Example VPN",
    accountLabel: "主账号 ***88",
    plan: "年付 5 设备",
    expireDate: "2027-01-01",
    renewalDays: 365,
    cost: "HK$300/年",
    autoRenew: true,
    notifyAdvance: 7,
    notifyInterval: 1,
    notifyCount: 7,
    manageUrl: "https://vpn.example/account",
    remark: "续费前检查价格"
  })
});
assert.equal(created.status, 200);
const createdBody = await created.json();
assert.equal(createdBody.success, true);
assert.equal(createdBody.vpn.name, "香港高速套餐");
assert.equal(createdBody.vpn.renewalDays, 365);
assert.equal(createdBody.vpn.autoRenew, true);
assert.equal(JSON.parse(kv.values.get("vpn_list")).length, 1);
assert.equal(kv.values.get("esim_list"), "[]");
assert.equal(kv.values.get("domain_list"), "[]");

const invalidName = await call("/api/vpns", {
  method: "POST",
  headers,
  body: JSON.stringify({ name: "  ", expireDate: "2027-01-01" })
});
assert.equal(invalidName.status, 400);

const invalidDate = await call("/api/vpns", {
  method: "POST",
  headers,
  body: JSON.stringify({ name: "日期错误", expireDate: "2027-02-30" })
});
assert.equal(invalidDate.status, 400);

const invalidInteger = await call("/api/vpns", {
  method: "POST",
  headers,
  body: JSON.stringify({ name: "周期错误", expireDate: "2027-01-01", renewalDays: "1.5" })
});
assert.equal(invalidInteger.status, 400);

const invalidBoolean = await call("/api/vpns", {
  method: "POST",
  headers,
  body: JSON.stringify({ name: "状态错误", expireDate: "2027-01-01", autoRenew: "yes" })
});
assert.equal(invalidBoolean.status, 400);

const unsafeLink = await call("/api/vpns", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "危险链接",
    expireDate: "2027-01-01",
    manageUrl: "https://vpn.example/subscribe?token=secret"
  })
});
assert.equal(unsafeLink.status, 400);

const listResponse = await call("/api/vpns", { headers });
assert.equal(listResponse.status, 200);
assert.equal((await listResponse.json()).length, 1);

const updated = await call("/api/vpns", {
  method: "PUT",
  headers,
  body: JSON.stringify({
    id: createdBody.vpn.id,
    name: "香港稳定套餐",
    expireDate: "2027-12-31",
    renewalDays: 30,
    autoRenew: false
  })
});
assert.equal(updated.status, 200);
const updatedBody = await updated.json();
assert.equal(updatedBody.vpn.name, "香港稳定套餐");
assert.equal(updatedBody.vpn.renewalDays, 30);
assert.equal(updatedBody.vpn.autoRenew, false);

const localToday = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
await kv.put("vpn_list", JSON.stringify([{
  ...updatedBody.vpn,
  expireDate: localToday,
  manageUrl: "https://vpn.example/account"
}]));

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
assert.match(telegramPayloads[0].text, /VPN 到期提醒/);
assert.equal(telegramPayloads[0].reply_markup.inline_keyboard[0][0].text, "续费 / 管理");

telegramPayloads.length = 0;
globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
try {
  const manual = await call("/api/vpn-reminders/test", { method: "POST", headers });
  assert.equal(manual.status, 200);
  assert.equal((await manual.json()).sent, 1);
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /手动测试/);

telegramPayloads.length = 0;
const expiredFourteenDaysAgo = new Date(
  Date.parse(`${localToday}T00:00:00Z`) - 14 * 86400000
).toISOString().slice(0, 10);
await kv.put("vpn_list", JSON.stringify([{ ...updatedBody.vpn, expireDate: expiredFourteenDaysAgo }]));
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
kv.throwOnGet.add("vpn_list");
globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
  kv.throwOnGet.delete("vpn_list");
}
assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /eSIM 到期提醒/);

await kv.put("esim_list", "[]");
await kv.put("vpn_list", JSON.stringify([updatedBody.vpn]));
const deleted = await call("/api/vpns", {
  method: "DELETE",
  headers,
  body: JSON.stringify({ id: createdBody.vpn.id })
});
assert.equal(deleted.status, 200);
assert.equal(JSON.parse(kv.values.get("vpn_list")).length, 0);

console.log("vpn dashboard tests: ok");
