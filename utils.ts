import { BookModel, Book } from "./types.ts";
export const fromModelToBook = (model:BookModel):Book=>{
    return{
        id: model._id!.toString(),
        titulo: model.titulo,
        autor: model.autor,
        year: model.year,
    }   }