import { MongoClient, ObjectId } from 'mongodb';
import { BookModel } from "./types.ts";
import { fromModelToBook } from "./utils.ts";
const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  console.error("Mongo URL not found")
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();

const db = client.db("Practica3");
const booksCollection = db.collection<BookModel>("books");

const handler = async (req: Request): Promise<Response> =>{
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if(method === "GET"){
    if(path === "/books"){
        const librosDB = await booksCollection.find().toArray();
        const libros = await Promise.all(librosDB.map((u)=> fromModelToBook(u)));
        return new Response(JSON.stringify(libros));
    }else if(path.startsWith("/books/")){
      const id = path.split("/books/")[1];
      const librosDB = await booksCollection.find({_id:new ObjectId(id)}).toArray();
        const libros = await librosDB.map((u)=> fromModelToBook(u));
        if(libros.length === 0){
          return new Response("error : Libro no encontrado.",{status:404})
        }
        return new Response(JSON.stringify(libros), {status: 200});
    }

  }else if(method === "POST"){
    if(path ===" /books"){
      const payload = await req.json();
      if(!payload.titulo || !payload.autor || !payload.year){
        return new Response("error: El título, el autor y el year son campos requeridos.", {status:400});
      }
      const { insertedId} = await booksCollection.insertOne({
        titulo:payload.titulo,
        autor:payload.autor,
        year: payload.year,
      });
      return new Response(JSON.stringify({
        message:"Libro creado existosamente",
        titulo:payload.titulo,
        autor:payload.autor,
        year: payload.year,
        id: insertedId,
      }),{status:201});}
    }else if (method === "PUT"){
      if(path.startsWith("/books/")){
      const id = path.split("/books/")[1];
      const payload = await req.json();
    
      if (!id) {
        return new Response("error : Id necesario", { status: 400 });
      }
    
      // Construir el objeto de actualización dinámicamente
      const validFields = ["titulo", "year", "autor"];
      const updateFields = Object.fromEntries(
        Object.entries(payload).filter(([key, value]) => validFields.includes(key) && value !== undefined)
      );
    
      if (Object.keys(updateFields).length === 0) {
        return new Response("Se necesitan parámetros", { status: 404 });
      }
      const { modifiedCount } = await booksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );
    
      if (modifiedCount === 0) {
        return new Response("Libro no encontrado", { status: 404 });
      }
    
      return new Response(
        JSON.stringify({
          message: "Libro actualizado existosamente",
          libro: { id, ...updateFields },
        }), 
        { status: 200 }
      );
    }}else if(method === "DELETE"){
    if(path.startsWith("/books/")){
      const id = path.split("/books/")[1];
      const { deletedCount } = await booksCollection.deleteOne({_id: new ObjectId(id)});
      if(deletedCount === 0){
        return new Response("Libro no encontrado",{status:404});
      }
      return new Response(JSON.stringify({
        message: "Libro eliminado exitosamente."
      }),{status:200})
    }

  }

  return new Response("Endpoint not found", {status: 404});
}

Deno.serve({port:3000}, handler);
