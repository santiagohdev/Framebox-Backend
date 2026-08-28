/* Crea la cuenta de demostración y le carga algunas películas.
 *
 * Un portfolio se mira en dos minutos. Si para ver la app hay que registrarse,
 * esperar un mail de verificación y recién ahí entrar, la mayoría no llega.
 * Con una cuenta ya cargada, se entra y se ve funcionando.
 *
 * Se ejecuta a mano, no en cada arranque:
 *     MONGO_URI="..." npm run seed:demo
 *
 * Es idempotente: si la cuenta existe, le repone la contraseña y las
 * películas en vez de duplicar. Sirve también para devolver la demo a su
 * estado original cuando alguien la deja desordenada.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/User.js";
import Movie from "../src/models/Movie.js";
import Genre from "../src/models/Genre.js";

const CUENTA = {
  name: "Usuario de prueba",
  email: "utnframebox@gmail.com",
  password: "usuarioframebox",
};

const GENEROS = ["Drama", "Ciencia ficción", "Animación", "Thriller", "Comedia"];

const PELICULAS = [
  { title: "El secreto de sus ojos", year: 2009, duration: 129, genero: "Drama",
    status: "Vista", rating: 5, favorite: true,
    description: "Un oficial judicial retirado escribe una novela sobre un caso que nunca pudo cerrar." },
  { title: "Relatos salvajes", year: 2014, duration: 122, genero: "Comedia",
    status: "Vista", rating: 4, favorite: true,
    description: "Seis historias sobre la delgada línea que separa la civilización de la barbarie." },
  { title: "Blade Runner 2049", year: 2017, duration: 164, genero: "Ciencia ficción",
    status: "Vista", rating: 5, favorite: false,
    description: "Un replicante descubre un secreto capaz de romper lo que queda de la sociedad." },
  { title: "Your Name", year: 2016, duration: 106, genero: "Animación",
    status: "Vista", rating: 4, favorite: false,
    description: "Dos adolescentes que no se conocen empiezan a intercambiar cuerpos al dormir." },
  { title: "Parásitos", year: 2019, duration: 132, genero: "Thriller",
    status: "Viendo", rating: 4, favorite: false,
    description: "Una familia sin trabajo se infiltra, uno por uno, en la casa de una familia rica." },
  { title: "Dune: Parte Dos", year: 2024, duration: 166, genero: "Ciencia ficción",
    status: "Pendiente", favorite: false,
    description: "Paul Atreides se une a los Fremen para vengar a su familia." },
  { title: "El viaje de Chihiro", year: 2001, duration: 125, genero: "Animación",
    status: "Pendiente", favorite: true,
    description: "Una nena queda atrapada en un mundo de espíritus y tiene que trabajar para volver." },
  { title: "Whiplash", year: 2014, duration: 106, genero: "Drama",
    status: "Pendiente", favorite: false,
    description: "Un baterista y un profesor que cree que la grandeza sólo se saca a la fuerza." },
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Falta MONGO_URI. Ponelo en el .env o pasalo al ejecutar.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Conectado a la base.");

  const hash = await bcrypt.hash(CUENTA.password, 10);
  const usuario = await User.findOneAndUpdate(
    { email: CUENTA.email },
    { name: CUENTA.name, email: CUENTA.email, password: hash,
      verified: true, verificationToken: undefined },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Cuenta lista: ${usuario.email}`);

  const porNombre = {};
  for (const name of GENEROS) {
    const g = await Genre.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    porNombre[name] = g._id;
  }
  console.log(`Géneros: ${GENEROS.length}`);

  await Movie.deleteMany({ user: usuario._id });
  await Movie.insertMany(
    PELICULAS.map(({ genero, ...p }) => ({ ...p, genre: porNombre[genero], user: usuario._id }))
  );
  console.log(`Películas: ${PELICULAS.length}`);

  await mongoose.disconnect();
  console.log(`\nListo. Entrá con ${CUENTA.email} / ${CUENTA.password}`);
}

main().catch(async (e) => {
  console.error("Falló:", e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
