# Test History: Implementation Plan

This document outlines the plan for implementing saving and reading test history for prompt versions in the database.

---

## 1. **Data Model**

- **Table:** `PromptTestHistory`
- **Fields:**
  - `id` (string, primary key)
  - `promptId` (string, foreign key)
  - `promptVersionId` (string, foreign key)
  - `userId` (string, foreign key)
  - `input` (text)
  - `output` (text)
  - `tokensUsed` (int)
  - `duration` (int)
  - `createdAt` (datetime)
  - `updatedAt` (datetime)
  - (Relations to `PromptVersion`, `PromptTest`, `PromptRating` as needed)

---

## 2. **API Endpoints**

### **Save Test History**
- **POST** `/api/prompts/[id]/test-history`
- **Body:**
  ```json
  {
    "promptVersionId": "string",
    "input": "string",
    "output": "string",
    "tokensUsed": 123,
    "duration": 456
  }
  ```
- **Response:**
  - Saved test history entry (with relations)

### **Read Test History**
- **GET** `/api/prompts/[id]/test-history?promptVersionId=...`
- **Response:**
  - Array of test history entries for the given prompt/version, ordered by `createdAt desc`

---

## 3. **Frontend Integration**

- **Saving:**
  - After a test is run, POST the test input/output and metadata to the save endpoint.
  - On success, optionally update the UI with the new test result.

- **Reading:**
  - When viewing a version's test history, fetch data from the GET endpoint.
  - Display results in a scrollable, card-based layout with input, output, ratings, feedback, and timestamp.

---

## 4. **Future Enhancements**
- Add filtering/searching by user, date, or rating.
- Show test history in the test modal for quick context.
- Add pagination or infinite scroll for large histories.
- Allow exporting test history as CSV/JSON.

---

**Owner:** PromptCraft Team

_Last updated: 2024-06-10_ 