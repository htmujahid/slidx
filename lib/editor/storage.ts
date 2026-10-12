const DB_NAME = "visx"
const DB_VERSION = 1
const STORE_NAME = "presentations"
const DRAFT_KEY = "draft"

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
) {
  const db = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(
        db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
      )
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export function readDraft() {
  return withStore<string | undefined>("readonly", (store) =>
    store.get(DRAFT_KEY)
  )
}

export function writeDraft(text: string) {
  return withStore("readwrite", (store) => store.put(text, DRAFT_KEY))
}

export function clearDraft() {
  return withStore("readwrite", (store) => store.delete(DRAFT_KEY))
}
