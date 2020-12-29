import { v4 as uuidv4 } from 'uuid';

type ObjectStoreDataTypes = typeof Object | typeof String | typeof Number | typeof Date;

interface ObjectStoreWhere {
  [key: string]: string | number;
}

interface Columns {
  [key: string]: ObjectStoreDataTypes | ColumnOption;
}

interface ColumnOption {
  type: ObjectStoreDataTypes;
  index?: boolean;
}

export default class GitNotesDB {
  public static DB_NAME = 'gitnotes';
  private static instance: GitNotesDB | null = null;
  private _version = 0;
  private _db: IDBDatabase | null = null;
  private _stores: Map<string, Columns> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    if (!GitNotesDB.instance) {
      GitNotesDB.instance = new GitNotesDB();
    }
    return GitNotesDB.instance;
  }

  private objectStoreColumnValidator(
    storeName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetObject: { [key: string]: any },
  ): boolean {
    // const columns = this._stores.get(storeName);
    // if (!columns) return false;
    // return (
    //   Object.keys(targetObject).every(targetKey => targetKey in columns && targetKey) &&
    //   Object.entries(columns).every(
    //     ([column, option]) =>
    //       targetObject[column] === null ||
    //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //       (option as ObjectStoreDataTypes).prototype === targetObject[column].__proto__ ||
    //       (option as ColumnOption).type?.prototype === targetObject[column].__proto__,
    //   )
    // );
    return true;
  }

  private open() {
    return new Promise((resolve: (value: IDBDatabase) => void, reject: (value: Event) => void) => {
      if (this._db) {
        resolve(this._db);
        return;
      }

      const request = self.indexedDB.open('gitnotes', this._version);
      request.onerror = reject;
      request.onsuccess = () => {
        this._db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        this._stores.forEach((columns, name) => {
          const objectStore = db.createObjectStore(name, { keyPath: '_id', autoIncrement: true });
          Object.keys(columns)
            .filter(column => (columns[column] as ColumnOption)?.index)
            .forEach(column => {
              objectStore.createIndex(column, column);
            });
        });
      };
    });
  }

  store(name: string, columns: Columns) {
    if (this._stores.has(name)) {
      throw Error(`${name} objectstore alraedy exist`);
    } else if ('_id' in columns) {
      throw Error(`_id column is reserved`);
    }

    this._stores.set(name, columns);
    return this;
  }

  version(version: number) {
    if (version < 0) {
      throw new Error('Database version must be >= 0');
    }
    this._version = version;
  }

  async select<T>(storeName: string, where?: ObjectStoreWhere, limit?: number) {
    if (where && !this.objectStoreColumnValidator(storeName, where)) {
      throw new Error(`${storeName} object store columns and where condition columns is mismatch`);
    }

    let cursorPosition = 0;
    const db = await this.open();
    const transaction = db.transaction(storeName);

    return new Promise<T[]>((resolve, reject) => {
      const cursorRequest = transaction.objectStore(storeName).openCursor();
      const records: T[] = [];
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const record = cursor.value as T;
          if (typeof limit === 'number' && limit < cursorPosition++) {
            resolve(records);
            return;
          }

          if (!where) {
            records.push(record);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } else if (Object.keys(where).every(key => (record as any)[key] === where[key])) {
            records.push(record);
          }
          cursor.continue();
        } else {
          resolve(records);
        }
      };
      cursorRequest.onerror = reject;
    });
  }

  async insert<T>(storeName: string, value: T) {
    if (!this.objectStoreColumnValidator(storeName, value)) {
      throw new Error(`${storeName} object store columns and value columns(or type) is mismatch`);
    }

    const db = await this.open();
    return new Promise<Event>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.add({ _id: uuidv4(), ...value });

      transaction.onabort = reject;
      transaction.onerror = reject;
      transaction.oncomplete = resolve;
    });
  }

  async update<T>(storeName: string, value: T, where?: ObjectStoreWhere) {
    if (!this.objectStoreColumnValidator(storeName, value)) {
      throw new Error(`${storeName} object store columns and value columns is mismatch`);
    } else if (where && !this.objectStoreColumnValidator(storeName, where)) {
      throw new Error(`${storeName} object store columns and where condition columns is mismatch`);
    }

    const db = await this.open();

    return new Promise<number>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const cursorRequest = transaction.objectStore(storeName).openCursor();
      let affectedRows = 0;

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (where && Object.keys(where).every(key => (cursor.value as any)[key] === where[key])) {
          cursor.update(value);
          ++affectedRows;
        }
      };

      transaction.onabort = reject;
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve(affectedRows);
    });
  }

  async delete<T>(storeName: string, where?: ObjectStoreWhere) {
    if (where && !this.objectStoreColumnValidator(storeName, where)) {
      throw new Error(`${storeName} object store columns and where condition columns is mismatch`);
    }

    const db = await this.open();
    return new Promise<number>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const cursorRequest = transaction.objectStore(storeName).openCursor();
      let deletedRecords = 0;

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;

        if (!cursor) {
          return;
        }

        if (!where) {
          cursor.delete();
          ++deletedRecords;
        } else if (
          where &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.keys(where).every(key => (cursor.value as any)[key] === where[key])
        ) {
          cursor.delete();
          ++deletedRecords;
        }
      };

      transaction.onabort = reject;
      transaction.onerror = reject;
      transaction.oncomplete = () => resolve(deletedRecords);
    });
  }
}
