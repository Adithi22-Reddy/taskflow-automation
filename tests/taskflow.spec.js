// taskflow.spec.js
// Automated version of your manual TaskFlow test suite.
// Several tests here are EXPECTED TO FAIL right now — they assert the
// CORRECT/spec behavior, and the app currently has bugs, same idea as
// the registration app before.
// Run with: npx playwright test

const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL = 'file://' + path.join(__dirname, '..', 'taskflow-app.html');

// Helper: fills the task form and clicks Add Task.
async function addTaskForm(page, overrides = {}) {
  const data = {
    title: 'Write quarterly report',
    dueDate: '2026-10-01',
    priority: 'High',
    email: 'alex@example.com',
    ...overrides,
  };
  await page.fill('#title', data.title);
  if (data.dueDate) await page.fill('#dueDate', data.dueDate);
  if (data.priority) await page.selectOption('#priority', data.priority);
  await page.fill('#email', data.email);
  await page.click('#addBtn');
}

// Today's date in YYYY-MM-DD, for the boundary test.
function todayStr() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

// TC-01: valid data succeeds
test('TC-01: valid task is added successfully', async ({ page }) => {
  await addTaskForm(page);
  await expect(page.locator('#msg')).toHaveText('Task added successfully!');
  await expect(page.locator('#taskList')).toContainText('Write quarterly report');
});

// TC-02: empty title rejected
test('TC-02: empty title is rejected', async ({ page }) => {
  await addTaskForm(page, { title: '' });
  await expect(page.locator('#msg')).toHaveText('Task title is required');
});

// TC-03: whitespace-only title — EXPECTED TO FAIL (known bug)
test('TC-03: whitespace-only title is rejected', async ({ page }) => {
  await addTaskForm(page, { title: '   ' });
  await expect(page.locator('#msg')).toHaveText('Task title is required');
});

// TC-04: past due date — EXPECTED TO FAIL (known bug)
test('TC-04: past due date is rejected', async ({ page }) => {
  await addTaskForm(page, { dueDate: '2020-01-01' });
  await expect(page.locator('#msg')).not.toHaveText('Task added successfully!');
});

// TC-05: email missing a TLD — EXPECTED TO FAIL (known bug)
test('TC-05: email without a valid domain is rejected', async ({ page }) => {
  await addTaskForm(page, { email: 'alex@gmail' });
  await expect(page.locator('#msg')).not.toHaveText('Task added successfully!');
});

// TC-06: very long title — EXPECTED TO FAIL (known bug, no cap enforced)
test('TC-06: excessively long title is rejected', async ({ page }) => {
  await addTaskForm(page, { title: 'A'.repeat(500) });
  await expect(page.locator('#msg')).not.toHaveText('Task added successfully!');
});

// TC-08: XSS via title — EXPECTED TO FAIL (known bug)
test('TC-08: HTML in title is NOT rendered as markup (XSS check)', async ({ page }) => {
  await addTaskForm(page, { title: '<b>Jane</b>' });
  const visibleTitleText = await page.locator('#taskList .task .info b').first().textContent();
  // Safe behavior: literal text, not actual bold formatting.
  expect(visibleTitleText).toBe('<b>Jane</b>');
});

// TC-09: delete-while-filtered targets the wrong task — EXPECTED TO FAIL (known bug)
test('TC-09: deleting a filtered task removes the correct item, not a mismatched one', async ({ page }) => {
  await addTaskForm(page, { title: 'Report' });
  await addTaskForm(page, { title: 'Meeting' });
  await addTaskForm(page, { title: 'Reporting' });

  await page.fill('#filter', 'Report');
  // Filtered view should now show: Report, Reporting (Meeting hidden)
  const filteredRows = page.locator('#taskList .task');
  await expect(filteredRows).toHaveCount(2);

  // Click Delete on the SECOND visible row ("Reporting").
  await filteredRows.nth(1).locator('.del').click();

  // Clear the filter to inspect the true full list.
  await page.fill('#filter', '');

  // Correct behavior: "Reporting" is gone, "Report" and "Meeting" remain.
  await expect(page.locator('#taskList')).toContainText('Report');
  await expect(page.locator('#taskList')).toContainText('Meeting');
  await expect(page.locator('#taskList')).not.toContainText('Reporting');
});

// TC-11: filter should be case-insensitive — EXPECTED TO FAIL (known bug)
test('TC-11: filter matches regardless of letter casing', async ({ page }) => {
  await addTaskForm(page, { title: 'Report submission' });
  await page.fill('#filter', 'report'); // lowercase search against a capitalized title
  await expect(page.locator('#taskList')).toContainText('Report submission');
});

// TC-13: due date of exactly today is accepted (boundary case)
test('TC-13: due date of today is accepted', async ({ page }) => {
  await addTaskForm(page, { dueDate: todayStr() });
  await expect(page.locator('#msg')).toHaveText('Task added successfully!');
});
