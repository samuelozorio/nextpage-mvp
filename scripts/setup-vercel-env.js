const { execSync } = require("child_process");
require("dotenv").config();

console.log("🔧 Configurando variáveis de ambiente na Vercel...\n");

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

try {
  console.log("1️⃣ Verificando variáveis de ambiente...\n");

  requiredEnvVars.forEach((envVar) => {
    const value = process.env[envVar];
    if (!value) {
      console.log(`❌ ${envVar} não encontrada no .env`);
    } else {
      console.log(`✅ ${envVar} encontrada`);
    }
  });

  console.log("\n2️⃣ Configurando variáveis na Vercel...\n");

  // Configurar cada variável de ambiente
  requiredEnvVars.forEach((envVar) => {
    const value = process.env[envVar];
    if (value) {
      try {
        console.log(`Configurando ${envVar}...`);
        execSync(`vercel env add ${envVar} production`, {
          stdio: "pipe",
          input: value + "\n",
        });
        console.log(`✅ ${envVar} configurada com sucesso`);
      } catch (error) {
        console.log(`⚠️ ${envVar} pode já estar configurada ou houve erro`);
      }
    }
  });

  console.log("\n3️⃣ Fazendo deploy...\n");
  execSync("vercel --prod", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Erro durante configuração:", error.message);
  console.log("\n💡 Soluções manuais:");
  console.log("1. Acesse o dashboard da Vercel");
  console.log("2. Vá em Settings > Environment Variables");
  console.log("3. Adicione DATABASE_URL com a URL do Supabase");
  console.log("4. Configure as outras variáveis necessárias");
  console.log("5. Faça o deploy novamente");
}
