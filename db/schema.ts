import {sqliteTable,text,primaryKey} from 'drizzle-orm/sqlite-core';
export const listings=sqliteTable('listings',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),created:text('created').notNull()});
export const favorites=sqliteTable('favorites',{user:text('user').notNull(),property:text('property').notNull()},t=>[primaryKey({columns:[t.user,t.property]})]);
export const uploads=sqliteTable('uploads',{id:text('id').primaryKey(),owner:text('owner').notNull()});
