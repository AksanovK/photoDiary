import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';

const tableName = 'todoData';

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
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        name TEXT NOT NULL,
        value TEXT,
        photos TEXT
    );`;

  await db.executeSql(query);

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
      photos: '../../assets/images/welcome.png,../../assets/images/smiley.png',
    };
    await db.executeSql(
      `INSERT INTO ${tableName} (date, name, value, photos) VALUES (?, ?, ?, ?)`,
      [
        initialData.date,
        initialData.name,
        initialData.value,
        initialData.photos,
      ],
    );
  }
};

export const getDiaryItems = async (
  db: SQLiteDatabase,
): Promise<DiaryItem[]> => {
  try {
    const todoItems: DiaryItem[] = [];
    const results = await db.executeSql(
      `SELECT id, date, name, value, photos FROM ${tableName}`,
    );
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        todoItems.push(result.rows.item(index));
      }
    });
    return todoItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get todoItems!');
  }
};

export const findDiaryItemsByDate = async (
  db: SQLiteDatabase,
  date: string,
): Promise<DiaryItem[]> => {
  try {
    const todoItems: DiaryItem[] = [];
    const results = await db.executeSql(
      `SELECT id, date, name, value, photos FROM ${tableName} WHERE date = ?`,
      [date],
    );
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        todoItems.push(result.rows.item(index));
      }
    });
    return todoItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to find diary items by date!');
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
      `SELECT id, date, name, value, photos FROM ${tableName} WHERE id = ?`,
      [id],
    );
    if (results[0].rows.length > 0) {
      const row = results[0].rows.item(0);
      return {
        id: row.id,
        date: row.date,
        name: row.name,
        value: row.value,
        photos: row.photos,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    throw Error('Failed to get diary item by id!');
  }
};

export const insertTodoItem = async (db: SQLiteDatabase, newEvent: any) => {
  const insertQuery = `INSERT INTO ${tableName}(date, name, value, photos) VALUES (?, ?, ?, ?)`;
  const {date, name, value, photos} = newEvent;
  await db.executeSql(insertQuery, [date, name, value, photos]);
};

export const updateTodoItem = async (db: SQLiteDatabase, newEvent: any) => {
  const updateQuery = `UPDATE ${tableName} SET name = ?, value = ?, photos = ? WHERE id = ?`;
  const {id, name, value, photos} = newEvent;
  await db.executeSql(updateQuery, [name, value, photos, id]);
};

export const saveTodoItems = async (
  db: SQLiteDatabase,
  todoItems: DiaryItem[],
) => {
  const insertQuery =
    `INSERT OR REPLACE INTO ${tableName}(date, name, value, photos) VALUES` +
    todoItems
      .map(i => `('${i.date}', '${i.name}', '${i.value}', '${i.photos}')`)
      .join(',');

  return db.executeSql(insertQuery);
};

export const deleteTodoItem = async (db: SQLiteDatabase, id: number) => {
  const deleteQuery = `DELETE FROM ${tableName} WHERE id = ${id}`;
  await db.executeSql(deleteQuery);
};

export const deleteTable = async (db: SQLiteDatabase) => {
  const query = `DROP TABLE IF EXISTS ${tableName}`;

  await db.executeSql(query);
};
