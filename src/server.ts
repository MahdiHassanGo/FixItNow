import app from "./app";
import { prisma } from "./lib/prisma";
const PORT = process.env.PORT||5000;
async function main(){
    try{
       await prisma.$connect();
        app.listen(PORT,()=>{
            console.log(`server is running on port ${PORT}`);
        })
    }catch(error){
      console.error("Error starting server:",error)
      process.exit(1);
    }
}

main();