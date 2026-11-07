import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { today, isOpenNow } from "./time";
import { requireStaff } from "./auth";
import { orderSchema, inventorySchema } from "./validation";

test("Denver dates and hours handle UTC day boundaries, Sunday, and DST", () => {
  assert.equal(today(new Date("2026-11-07T02:00:00Z")), "2026-11-06");
  assert.equal(isOpenNow(new Date("2026-11-06T12:00:00Z")), true);
  assert.equal(isOpenNow(new Date("2026-11-07T00:00:00Z")), false);
  assert.equal(isOpenNow(new Date("2026-11-08T15:00:00Z")), false);
  assert.equal(isOpenNow(new Date("2026-11-09T12:00:00Z")), true);
});
test("staff auth fails closed and validates supplied PIN", () => {
  const old=process.env.STAFF_PIN; process.env.STAFF_PIN="1234";
  try {
    assert.throws(()=>requireStaff(new Request("http://localhost")), e => e instanceof Response && e.status===401);
    assert.throws(()=>requireStaff(new Request("http://localhost", {headers:{"x-staff-pin":"wrong"}})));
    requireStaff(new Request("http://localhost", {headers:{"x-staff-pin":"1234"}}));
    delete process.env.STAFF_PIN;
    assert.throws(()=>requireStaff(new Request("http://localhost")));
  } finally { if(old===undefined) delete process.env.STAFF_PIN; else process.env.STAFF_PIN=old; }
});
test("stock holds, statuses, date filtering, levels, overrides, and concurrent local orders", async () => {
  const original=process.cwd(); const temp=await mkdtemp(path.join(os.tmpdir(),"donut-test-"));
  assert.ok(!process.env.UPSTASH_REDIS_REST_URL, "Tests must never use production Redis");
  process.chdir(temp);
  try {
    const s=await import("./store"); await s.resetStore();
    const base={ customerName:"Test", pickupDate:today(), pickupTime:"07:30", items:[{menuItemId:"raised-glazed",qty:14}], source:"staff_form" as const };
    const order=await s.createOrder(base);
    let stock=await s.getInventory(); assert.equal(stock.groups[0].available,6); assert.equal(stock.groups[0].level,"low");
    await s.createOrder({...base,pickupDate:"2099-01-01"});
    assert.equal((await s.getInventory()).groups[0].held,14);
    await s.updateOrderStatus(order.id,"ready"); assert.equal((await s.getInventory()).groups[0].available,20);
    await s.updateOrderStatus(order.id,"new");
    await s.setCounts([{groupId:"raised",count:3}],"photo");
    stock=await s.getInventory(); assert.equal(stock.groups[0].available,0); assert.equal(stock.groups[0].level,"sold_out"); assert.equal(stock.source,"photo");
    await s.updateOrderStatus(order.id,"cancelled"); assert.equal((await s.getInventory()).groups[0].available,3);
    await s.setSoldOutToggle(true); assert.equal((await s.getInventory()).shopSoldOut,true);
    await s.setSoldOutToggle(false); assert.equal((await s.getInventory()).shopSoldOut,false);
    await s.setCounts(s.stockGroups.map(groupId=>({groupId,count:0})),"manual"); assert.equal((await s.getInventory()).shopSoldOut,true);
    const before=(await s.listOrders()).length;
    await Promise.all(Array.from({length:20},()=>s.createOrder({...base,items:[{menuItemId:"fritter",qty:1}]})));
    assert.equal((await s.listOrders()).length,before+20);
    assert.equal(await s.updateOrderStatus("missing","ready"),null);
    assert.equal(orderSchema.safeParse({...base,pickupDate:"2026-02-30"}).success,false);
    assert.equal(orderSchema.safeParse({...base,items:[{menuItemId:"bogus",qty:1}]}).success,false);
    assert.equal(orderSchema.safeParse({...base,items:[{menuItemId:"fritter",qty:-1}]}).success,false);
    assert.equal(inventorySchema.safeParse({groups:[{groupId:"cake",count:-1}],source:"manual"}).success,false);
    assert.equal(inventorySchema.safeParse({groups:[{groupId:"cake",count:1},{groupId:"cake",count:2}],source:"manual"}).success,false);
  } finally {process.chdir(original);await rm(temp,{recursive:true,force:true});}
});
