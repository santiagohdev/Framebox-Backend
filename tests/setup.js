/* Levanta un MongoDB en memoria por corrida. No hace falta tener Mongo
   instalado ni tocar la base real: cada test arranca con datos limpios. */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let servidor;

export async function levantarBase() {
  servidor = await MongoMemoryServer.create();
  await mongoose.connect(servidor.getUri());
}

export async function limpiarBase() {
  const { collections } = mongoose.connection;
  for (const nombre of Object.keys(collections)) {
    await collections[nombre].deleteMany({});
  }
}

export async function bajarBase() {
  await mongoose.disconnect();
  await servidor?.stop();
}
