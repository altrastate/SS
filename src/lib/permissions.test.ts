import assert from "node:assert/strict";
import test from "node:test";
import { can, normalizeRole, resolveContentStatus } from "./permissions";

test("legacy admin role maps to super admin", () => {
  assert.equal(normalizeRole("admin"), "super_admin");
  assert.equal(can("admin", "users"), true);
});

test("editor cannot publish or manage users", () => {
  assert.equal(can("editor", "news"), true);
  assert.equal(can("editor", "news.publish"), false);
  assert.equal(can("editor", "users"), false);
  assert.equal(can("editor", "enquiries"), false);
  assert.equal(resolveContentStatus("published", false), "review");
});

test("admissions officer is limited to enquiries", () => {
  assert.equal(can("admissions_officer", "enquiries"), true);
  assert.equal(can("admissions_officer", "dashboard"), true);
  assert.equal(can("admissions_officer", "news"), false);
  assert.equal(can("admissions_officer", "users"), false);
});

test("alumni officer cannot open enquiries or users", () => {
  assert.equal(can("alumni_officer", "alumni"), true);
  assert.equal(can("alumni_officer", "alumni.accounts"), true);
  assert.equal(can("alumni_officer", "donations"), true);
  assert.equal(can("alumni_officer", "projects"), true);
  assert.equal(can("alumni_officer", "enquiries"), false);
  assert.equal(can("alumni_officer", "users"), false);
  assert.equal(can("alumni_officer", "integrations"), false);
});

test("communications officer cannot open donations or users", () => {
  assert.equal(can("communications_officer", "communications"), true);
  assert.equal(can("communications_officer", "communications.send"), true);
  assert.equal(can("communications_officer", "donations"), false);
  assert.equal(can("communications_officer", "alumni.accounts"), false);
  assert.equal(can("communications_officer", "users"), false);
});

test("school admin cannot manage users or integrations", () => {
  assert.equal(can("school_admin", "communications.send"), true);
  assert.equal(can("school_admin", "donations"), true);
  assert.equal(can("school_admin", "users"), false);
  assert.equal(can("school_admin", "integrations"), false);
});

test("unknown roles are treated as editor", () => {
  assert.equal(normalizeRole("mystery"), "editor");
  assert.equal(can("mystery", "users"), false);
});
