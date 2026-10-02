# Part 4: API Testing (Postman)

## API Under Test

Swagger Petstore
Base URL: https://petstore.swagger.io/v2
Swagger definition: https://petstore.swagger.io/v2/swagger.json

## Test Data Strategy

- A unique Pet ID is generated at runtime with Postman's `{{$timestamp}}` variable (created ID: `1790889381`).
- The "Create Pet - Valid" test script stores the returned ID in the **collection variable** `petId` (no Postman environment was used; "No Environment" is selected).
- Retrieve, Update and Delete use `{{petId}}` in the URL or body. No ID is hardcoded.
- The collection also stores the created `category`, `tags` and `photoUrls` in collection variables, so Retrieve and Update can compare the "other fields" against the created object.

## Valid Pet Payload (Create)

```json
{
  "id": {{$timestamp}},
  "category": {"id": 1001, "name": "zentixsoft-category"},
  "name": "ZentixSoft Test Pet",
  "photoUrls": ["https://example.com/zentixsoft-pet.jpg"],
  "tags": [{"id": 1, "name": "qa"}, {"id": 2, "name": "assignment"}],
  "status": "available"
}
```

`name` and `photoUrls` are required in the published Pet schema. `status` accepts `available`, `pending` or `sold`.

---

## Step 1: Create Pet

| Request | Body | Status | Response |
|---|---|---|---|
| **Valid:** `POST {{baseUrl}}/pet` | Valid payload above | **200 OK** | Returned `id` 1790889381, `name` "ZentixSoft Test Pet", `status` "available", `category` {1001, "zentixsoft-category"}, two tags, one photo URL |
| **Missing required fields:** `POST {{baseUrl}}/pet` | `{"id": {{$timestamp}}, "category": {"id":1001,"name":"zentixsoft-category"}, "status":"available"}` | **200 OK** | A record was created: `id` 1790889418, `category`, `photoUrls: []`, `tags: []`, `status` "available". No `name`. |

Test results (valid request): 7/7 passed (status, ID, name, status, category, tags, photoUrls).
Screenshots: `01_Create_Pet_-_Valid.png`, `01_Create_Pet_-_Missing_Required_Fields.png`

## Step 2: Retrieve Pet

| Request | Status | Response |
|---|---|---|
| **Valid:** `GET {{baseUrl}}/pet/{{petId}}` | **200 OK** | Same `id`, name, status, category, tags and photoUrls as created. 7/7 tests passed. |
| **Missing path value:** `GET {{baseUrl}}/pet/` | **405 Method Not Allowed** | `{"code": 405, "type": "unknown"}` |

Screenshots: `02_Retrieve_Pet_-_Valid.png`, `02_Retrieve_Pet_-_Missing_Required_Path_Value.png`

## Step 3: Update Pet

| Request | Body | Status | Response |
|---|---|---|---|
| **Valid:** `PUT {{baseUrl}}/pet` | Same pet; `id` `{{petId}}`, `name` "ZentixSoft Updated Pet", `status` "sold" | **200 OK** | `name` "ZentixSoft Updated Pet", `status` "sold"; `id`, `category`, `tags`, `photoUrls` unchanged. 8/8 tests passed. |
| **Missing body fields:** `PUT {{baseUrl}}/pet` | `{}` | **200 OK** | `{"id": 9223372036854775505, "photoUrls": [], "tags": []}`: a new, empty record with a server-generated ID |

Screenshots: `03_Update_Pet_-_Valid.png`, `03_Update_Pet_-_Missing_Required_Body.png`

## Step 4: Find Pets by Status

| Request | Status | Response |
|---|---|---|
| **Valid:** `GET {{baseUrl}}/pet/findByStatus?status=available` | **200 OK** (about 44 KB) | Array of pets. Test "every pet is `available`" passed (3/3). |
| **Missing query:** `GET {{baseUrl}}/pet/findByStatus` | **200 OK** | `[]` |

Screenshots: `04_Find_Pets_by_Status_-_Valid.png`, `04_Find_Pets_by_Status_-_Missing_Required_Query.png`

## Step 5: Delete Pet

| Request | Status | Response |
|---|---|---|
| **Valid:** `DELETE {{baseUrl}}/pet/{{petId}}` | **200 OK** | `{"code": 200, "type": "unknown", "message": "1790889381"}` |
| **Verify deleted:** `GET {{baseUrl}}/pet/{{petId}}` | **404 Not Found** | `{"code": 1, "type": "error", "message": "Pet not found"}` |
| **Missing path value:** `DELETE {{baseUrl}}/pet/` | **405 Method Not Allowed** | `{"code": 405, "type": "unknown"}` |
| **Nonexistent ID:** `DELETE {{baseUrl}}/pet/999999999` | **404 Not Found** | Empty body |

Screenshots: `05_Delete_Pet_-_Valid.png`, `05_Verify_Deleted_Pet_-_Not_Found.png`, `05_Delete_Pet_-_Missing_Required_Path_Value.png`, `05_Delete_Pet_-_Nonexistent_ID.png`

---

## Negative Scenarios

### NEG-01: Retrieve nonexistent Pet
- **Objective:** Validate not-found handling.
- **Request:** `GET {{baseUrl}}/pet/999999999`
- **Expected (Swagger):** 404 "Pet not found".
- **Actual:** **404 Not Found**, body `{"code": 1, "type": "error", "message": "Pet not found"}`.
- **Matches Swagger:** Yes.
- **Screenshot:** `NEG-01.png`

### NEG-02: Invalid status value
- **Objective:** Validate query parameter validation.
- **Request:** `GET {{baseUrl}}/pet/findByStatus?status=invalid-status`
- **Expected (Swagger):** 400 "Invalid status value".
- **Actual:** **200 OK**, body `[]`.
- **Matches Swagger:** **No.** The invalid value is not rejected.
- **Screenshot:** `NEG-02.png`

### NEG-03: Create Pet without required fields
- **Objective:** Validate required Pet fields (`name`, `photoUrls`).
- **Request:** `POST {{baseUrl}}/pet`, body `{"status": "available"}`
- **Expected (Swagger):** `name` and `photoUrls` are required; the documented error is 405 "Invalid input".
- **Actual:** **200 OK**, body `{"id": 9223372036854775656, "photoUrls": [], "tags": [], "status": "available"}`. A record was created without a name, with a server-generated ID.
- **Matches Swagger:** **No.**
- **Screenshot:** `NEG-03.png`

---

## Comparison with the Swagger documentation

| Operation | Documented | Observed |
|---|---|---|
| POST /pet (valid) | Only 405 is documented; no success code | 200 OK |
| POST /pet (missing required fields) | `name`, `photoUrls` required; 405 on invalid input | 200 OK, record created |
| PUT /pet (empty body) | 400, 404 or 405 | 200 OK, new record created |
| GET /pet/findByStatus (no or invalid status) | `status` required; 400 on invalid value | 200 OK, `[]` |
| DELETE /pet/{id} (success) | Only 400 and 404 are documented | 200 OK, `{"code":200,"type":"unknown","message":"<id>"}` |
| DELETE /pet/999999999 | 404 "Pet not found" | 404, but empty body (GET returns a JSON "Pet not found" message) |
| GET or DELETE /pet/ (no ID) | Not documented | 405 Method Not Allowed |

## Summary

**Assumptions.** I assumed the API enforces its published contract: that requests missing the required `name` and `photoUrls` would be rejected (400 or the documented 405), that an invalid `status` filter would return 400, and that an update with an empty body would be refused. I generated a unique Pet ID with `{{$timestamp}}`, stored it in a collection variable and reused it for the whole flow. I treated Petstore as a shared public sandbox, so other data may change between runs.

**Behaviour vs expectations.** The happy path behaved as expected: create, retrieve, update, find by status and delete all returned 200, the returned fields matched the created object, only the name and status changed on update, and the deleted pet returned 404 on the follow-up GET. The nonexistent-ID cases returned 404 as documented.

**Unexpected behaviour worth raising with developers.**
1. Validation is not enforced. POST /pet without `name` or `photoUrls` returns 200 and creates a record, although the schema marks both as required and Swagger documents a 405 for invalid input.
2. PUT /pet with an empty body returns 200 and creates a new record with a generated ID instead of failing or returning 404, so an "update" can create data.
3. GET /pet/findByStatus returns 200 and an empty array for a missing or invalid status, although Swagger documents 400.
4. The documentation lists no success response for POST /pet (only 405), and none for DELETE (only 400 and 404). The live API returns 200.
5. Error bodies are inconsistent: GET returns `{"code":1,"type":"error","message":"Pet not found"}`, DELETE of an unknown ID returns an empty body, and a missing path returns `{"code":405,"type":"unknown"}` with no message. The delete success message returns the ID with type "unknown".
6. Records created with missing fields remain in the shared data and appear in the sandbox. Because the service is shared, this can pollute other users' results.

## Execution notes

- Tool: Postman desktop; collection `petstore_collection.json`; no environment (collection variables).
- Screenshots are in `screenshots/` and are named after the request they show.

## Sources

- Swagger schema: https://petstore.swagger.io/v2/swagger.json
- Swagger UI: https://petstore.swagger.io/
