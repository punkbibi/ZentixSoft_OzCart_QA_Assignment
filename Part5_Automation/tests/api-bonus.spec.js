const { test, expect } = require('@playwright/test');

const API_BASE = 'https://petstore.swagger.io/v2';

test('BONUS-API-01 create and retrieve a Pet using a dynamic ID', async ({ request }) => {
  const petId = Date.now();
  const payload = {
    id: petId,
    category: { id: 1001, name: 'zentixsoft-category' },
    name: 'ZentixSoft API Pet',
    photoUrls: ['https://example.com/zentixsoft-pet.jpg'],
    tags: [{ id: 1, name: 'qa' }],
    status: 'available'
  };

  const create = await request.post(`${API_BASE}/pet`, { data: payload });
  expect(create.status()).toBe(200);
  const created = await create.json();
  expect(created.id).toBe(petId);
  expect(created.name).toBe(payload.name);

  const get = await request.get(`${API_BASE}/pet/${petId}`);
  expect(get.status()).toBe(200);
  expect(await get.json()).toMatchObject(payload);

  // cleanup so the shared sandbox is left clean
  const del = await request.delete(`${API_BASE}/pet/${petId}`);
  expect(del.status()).toBe(200);
});

test('BONUS-API-02 an invalid status value is rejected with 400 (per Swagger)', async ({ request }) => {
  test.fail(true, 'KNOWN API DEVIATION: GET /pet/findByStatus?status=invalid-status returns 200, but Swagger documents 400 "Invalid status value". Third-party Petstore behavior, not a test defect.');
  const response = await request.get(`${API_BASE}/pet/findByStatus?status=invalid-status`);
  expect(response.status()).toBe(400);
});