import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAnalyticsPath, sanitizeSearchTerm } from "./analytics";

test("analytics only accepts public paths", () => {
  assert.equal(isPublicAnalyticsPath("/"), true);
  assert.equal(isPublicAnalyticsPath("/news/example"), true);
  assert.equal(isPublicAnalyticsPath("/support"), true);
  assert.equal(isPublicAnalyticsPath("/parent-communications"), true);
  assert.equal(isPublicAnalyticsPath("/admin"), false);
  assert.equal(isPublicAnalyticsPath("/admin/enquiries"), false);
  assert.equal(isPublicAnalyticsPath("/api/analytics"), false);
  assert.equal(isPublicAnalyticsPath("/alumni/portal"), false);
  assert.equal(isPublicAnalyticsPath("/support/receipt/secret"), false);
  assert.equal(isPublicAnalyticsPath("/parent-communications/confirm"), false);
});

test("search terms that look like contact details are dropped", () => {
  assert.equal(sanitizeSearchTerm("boarding"), "boarding");
  assert.equal(sanitizeSearchTerm("parent@example.com"), null);
  assert.equal(sanitizeSearchTerm("+256 772 000000"), null);
});
