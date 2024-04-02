import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';

const tableName = 'todoData';
const photosTableName = 'todoItemPhotos';

enablePromise(true);

export type DiaryItem = {
  id: number;
  date: string;
  name: string;
  value: string;
  photos: string;
};
export const getDBConnection = async () => {
  const db = await openDatabase({name: 'diaryDb.db', location: 'default'});
  await createTable(db);
  return db;
};

export const createTable = async (db: SQLiteDatabase) => {
  const createTodoDataTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName}(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        name TEXT NOT NULL,
        value TEXT
    );`;

  const createTodoItemPhotosTableQuery = `CREATE TABLE IF NOT EXISTS ${photosTableName}(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todoItemId INTEGER,
        photoPath TEXT,
        FOREIGN KEY(todoItemId) REFERENCES ${tableName}(id) ON DELETE CASCADE
    );`;

  await db.executeSql(createTodoDataTableQuery);
  await db.executeSql(createTodoItemPhotosTableQuery);

  const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
  const result = await db.executeSql(countQuery);
  const rowCount = result[0].rows.item(0).count;

  if (rowCount === 0) {
    console.log('Initial data is loaded');
    const currentDate = new Date().toISOString().split('T')[0];
    const initialData = {
      date: currentDate,
      name: 'Добро пожаловать!',
      value:
        'Сегодня вы начали пользоваться прекрасным приложением, поздравляем!',
    };
    await db.executeSql(
      `INSERT INTO ${tableName} (date, name, value) VALUES (?, ?, ?)`,
      [initialData.date, initialData.name, initialData.value],
    );
    const selectLastInsertIdQuery = 'SELECT last_insert_rowid() as id';
    const selectResult = await db.executeSql(selectLastInsertIdQuery);
    const todoItemId = selectResult[0].rows.item(0).id;
    const photosPaths = [
      '../../assets/images/welcome.png',
      '../../assets/images/smiley.png',
    ];
    for (const photoPath of photosPaths) {
      await db.executeSql(
        `INSERT INTO ${photosTableName} (todoItemId, photoPath) VALUES (?, ?)`,
        [todoItemId, photoPath],
      );
    }
  }
};

export const findDiaryItemNamesByDate = async (
  db: SQLiteDatabase,
  date: string,
): Promise<{id: number; name: string}[]> => {
  try {
    const diaryItems: {id: number; name: string}[] = [];
    const results = await db.executeSql(
      `SELECT id, name FROM ${tableName} WHERE date = ?`,
      [date],
    );
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        const row = result.rows.item(index);
        diaryItems.push({id: row.id, name: row.name});
      }
    });
    return diaryItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to find diary item names by date!');
  }
};

export const getDiaryItemById = async (
  db: SQLiteDatabase,
  id: number,
): Promise<DiaryItem | null> => {
  try {
    const results = await db.executeSql(
      `SELECT id, date, name, value FROM ${tableName} WHERE id = ?`,
      [id],
    );
    if (results[0].rows.length > 0) {
      const row = results[0].rows.item(0);
      const photosResults = await db.executeSql(
        `SELECT photoPath FROM ${photosTableName} WHERE todoItemId = ?`,
        [id],
      );
      const photos: string[] = [];
      for (let i = 0; i < photosResults[0].rows.length; i++) {
        const photoRow = photosResults[0].rows.item(i);
        if (photoRow) {
          photos.push(photoRow.photoPath);
        }
      }
      return {
        id: row.id,
        date: row.date,
        name: row.name,
        value: row.value,
        photos: photos.join(','),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    throw Error('Failed to get diary item by id!');
  }
};

export const insertTodoItem = async (
  db: SQLiteDatabase,
  newEvent: any,
): Promise<number> => {
  const insertQuery = `INSERT INTO ${tableName}(date, name, value) VALUES (?, ?, ?)`;
  const {date, name, value} = newEvent;
  try {
    const [result] = await db.executeSql(insertQuery, [date, name, value]);
    return result.insertId;
  } catch (error) {
    console.error('Error inserting todo item:', error);
    throw error;
  }
};

export const insertPhotosForTodoItem = async (
  db: SQLiteDatabase,
  todoItemId: number,
  photos: string[],
) => {
  const photoInsertQuery = `INSERT INTO ${photosTableName}(todoItemId, photoPath) VALUES (?, ?)`;

  try {
    for (const photo of photos) {
      await db.executeSql(photoInsertQuery, [todoItemId, photo]);
    }
  } catch (error) {
    console.error('Error inserting photos for todo item:', error);
    throw error;
  }
};

export const updateTodoItem = async (
  db: SQLiteDatabase,
  updatedEvent: any,
): Promise<void> => {
  const updateQuery = `UPDATE ${tableName} SET name = ?, value = ? WHERE id = ?`;
  const {id, name, value} = updatedEvent;
  try {
    await db.executeSql(updateQuery, [name, value, id]);
  } catch (error) {
    console.error('Error updating todo item:', error);
    throw error;
  }
};

export const updatePhotosForTodoItem = async (
  db: SQLiteDatabase,
  todoItemId: number,
  photos: string[],
): Promise<void> => {
  const deleteQuery = `DELETE FROM ${photosTableName} WHERE todoItemId = ?`;
  const photoInsertQuery = `INSERT INTO ${photosTableName}(todoItemId, photoPath) VALUES (?, ?)`;

  try {
    await db.executeSql(deleteQuery, [todoItemId]);

    for (const photo of photos) {
      await db.executeSql(photoInsertQuery, [todoItemId, photo]);
    }
  } catch (error) {
    console.error('Error updating photos for todo item:', error);
    throw error;
  }
};

export const deletePhotoForTodoItem = async (
  db: SQLiteDatabase,
  photoId: number,
): Promise<void> => {
  const deleteQuery = `DELETE FROM ${photosTableName} WHERE id = ?`;
  try {
    await db.executeSql(deleteQuery, [photoId]);
  } catch (error) {
    console.error('Error deleting photo for todo item:', error);
    throw error;
  }
};

export const deletePhotosForTodoItem = async (
  db: SQLiteDatabase,
  todoItemId: number,
): Promise<void> => {
  const deleteQuery = `DELETE FROM ${photosTableName} WHERE todoItemId = ?`;
  try {
    await db.executeSql(deleteQuery, [todoItemId]);
  } catch (error) {
    console.error('Error deleting photos for todo item:', error);
    throw error;
  }
};

export const deleteTodoItemAndPhotos = async (
  db: SQLiteDatabase,
  id: number,
): Promise<void> => {
  await db.transaction(async tx => {
    try {
      await deletePhotosForTodoItem(db, id);
      const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
      await tx.executeSql(deleteQuery, [id]);
    } catch (error) {
      console.error('Error deleting todo item and its photos:', error);
      throw error;
    }
  });
};
