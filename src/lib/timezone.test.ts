import assert from "node:assert/strict";
import test from "node:test";
import { dateFromKampalaLocal, toDatetimeLocalValue } from "./timezone";

test("Kampala local input is stored as UTC+3", () => {
  const date = dateFromKampalaLocal("2026-03-15T09:00");
  assert.ok(date);
  assert.equal(date.toISOString(), "2026-03-15T06:00:00.000Z");
});

test("datetime-local round trip uses Africa/Kampala", () => {
  const date = new Date("2026-03-15T06:00:00.000Z");
  assert.equal(toDatetimeLocalValue(date), "2026-03-15T09:00");
});
