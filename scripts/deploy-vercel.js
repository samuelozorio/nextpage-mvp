const { execSync } = require('child_process');

console.log('🚀 Iniciando deploy forçado para Vercel...\n');

try {
  // Verificar se o Vercel CLI está instalado
  console.log('1️⃣ Verificando Vercel CLI...');
  execSync('vercel --version', { stdio: 'inherit' });
  console.log('✅ Vercel CLI encontrado\n');

  // Fazer deploy forçado
  console.log('2️⃣ Executando deploy forçado...');
  execSync('vercel --prod --force', { stdio: 'inherit' });
  
  console.log('\n🎉 Deploy concluído com sucesso!');
  
} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  console.log('\n💡 Alternativas:');
  console.log('1. Instalar Vercel CLI: npm i -g vercel');
  console.log('2. Fazer login: vercel login');
  console.log('3. Configurar projeto: vercel');
  console.log('4. Deploy manual: vercel --prod');
}
