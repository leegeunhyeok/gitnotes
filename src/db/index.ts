type ObjectStoreDataTypes = typeof String | typeof Number;

interface ObjectStoreWhere {
  [key: string]: string | number;
}

interface Columns {
  [key: string]: ObjectStoreDataTypes | ColumnOption;
}

interface ColumnOption {
  type: ObjectStoreDataTypes;
  unique?: boolean;
}

class GitNotesDB {
  public static DB_NAME = 'gitnotes';
  private static instance: GitNotesDB | null = null;
  private _db: IDBDatabase | null = null;
  private _stores: Map<string, Columns> = new Map();

  private constructor() {
    GitNotesDB.instance = this;
  }

  public static getInstance() {
    if (!GitNotesDB.instance) {
      new GitNotesDB();
    }
    return GitNotesDB.instance;
  }

  private objectStoreColumnValidator(storeName: string, targetObject: { [key: string]: any }) {
    const columns = this._stores.get(storeName);
    if (!columns) return false;
    return Object.keys(targetObject).every(targetKey => targetKey in columns);
  }

  store(name: string, columns: Columns) {
    if (this._stores.has(name)) {
      throw Error(`${name} objectstore alraedy exist`);
    }
    this._stores.set(name, columns);
    return this;
  }

  open(version: number) {
    return new Promise((resolve: (value: Event) => void, reject: (value: Event) => void) => {
      const request = self.indexedDB.open('gitnotes', version);
      request.onerror = reject;
      request.onsuccess = event => {
        this._db = request.result;
        resolve(event);
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        this._stores.forEach((columns, name) => {
          const objectStore = db.createObjectStore(name);
          Object.keys(columns).forEach(column => {
            const option = columns[column];
            objectStore.createIndex(column, column, {
              unique: (option as ColumnOption)?.unique,
            });
          });
        });
      };
    });
  }

  select<T>(storeName: string, where?: ObjectStoreWhere, limit?: number) {
    if (where && !this.objectStoreColumnValidator(storeName, where)) {
      throw new Error(`${storeName} object store columns and where condition columns is mismatch`);
    }

    return new Promise((resolve: (value: T[]) => void, reject: (value: Event) => void) => {
      const transaction = this._db!.transaction(storeName);
      const cursorRequest = transaction.objectStore(storeName).openCursor();
      const records: T[] = [];
      let cursorPosition = 0;
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const record = cursor.value as T;
          if (typeof limit === 'number' && limit < ++cursorPosition) {
            resolve(records);
            return;
          }

          if (!where) {
            records.push(record);
          } else if (Object.keys(where).every(key => (record as any)[key] === where[key])) {
            records.push(record);
          }
        } else {
          resolve(records);
        }
      };
    });
  }

  insert<T>(storeName: string, value: T | T[]) {
    return new Promise((resolve: (value: Event) => void, reject: (value: Event) => void) => {
      const transaction = this._db!.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.add(value);

      transaction.onabort = reject;
      transaction.onerror = reject;
      transaction.oncomplete = resolve;
    });
  }

  update<T>(storeName: string, value: T | T[], where?: ObjectStoreWhere) {
    if (Array.isArray(value) && !value.every(v => this.objectStoreColumnValidator(storeName, v))) {
      throw new Error(`${storeName} object store columns and value columns is mismatch`);
    } else if (where && !this.objectStoreColumnValidator(storeName, where)) {
      throw new Error(`${storeName} object store columns and where condition columns is mismatch`);
    }

    return new Promise((resolve: (value: number) => void, reject: (value: Event) => void) => {
      const transaction = this._db!.transaction(storeName, 'readwrite');
      const cursorRequest = transaction.objectStore(storeName).openCursor();
      let affectedRows = 0;

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;

        if (!cursor) {
          return;
        }

        if (where && Object.keys(where).every(key => (cursor.value as any)[key] === where[key])) {
          cursor.update(value);
          ++affectedRows;
        }
      };

      transaction.onabort = reject;
      transaction.onerror = reject;
      transaction.oncomplete = () => {
        resolve(affectedRows);
      };
    });
  }

  delete<T>(storeName: string, where?: ObjectStoreWhere) {
    if (where && !this.objectStoreColumnValidator(storeName, where)) {
      throw new Error(`${storeName} object store columns and where condition columns is mismatch`);
    }

    return new Promise((resolve: (value: Event) => void, reject: (value: Event) => void) => {
      const transaction = this._db!.transaction(storeName, 'readwrite');
      const cursorRequest = transaction.objectStore(storeName).openCursor();

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;

        if (!cursor) {
          return;
        }

        if (!where) {
          cursor.delete();
        } else if (
          where &&
          Object.keys(where).every(key => (cursor.value as any)[key] === where[key])
        ) {
          cursor.delete();
        }
      };

      transaction.onabort = reject;
      transaction.onerror = reject;
      transaction.oncomplete = resolve;
    });
  }
}
