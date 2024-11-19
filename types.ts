import {OptionalId} from 'mongodb';

export type BookModel = OptionalId<{
    titulo: string,
    autor: string,
    year: number,
}>
export type Book = {
    id: string,
    titulo: string,
    autor: string,
    year: number,
}