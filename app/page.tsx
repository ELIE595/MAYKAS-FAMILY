import { PrismaClient } from '@prisma/client'; 
 
const prisma = new PrismaClient(); 
 
export default async function Home() { 
  return ( 
    <div> 
      <h1>Bienvenue sur MAYKAS-FAMILY</h1> 
      <p>Connexion a Supabase reussie</p> 
    </div> 
  ); 
} 
