import { connectDB, healthCheck, disconnectDB } from '../src/lib/db';

async function testDatabaseConnection() {
  console.log('🧪 Testando conexão com o banco de dados...\n');

  try {
    // Teste 1: Health Check
    console.log('1️⃣ Executando health check...');
    const isHealthy = await healthCheck();
    console.log(isHealthy ? '✅ Health check passou' : '❌ Health check falhou');
    console.log('');

    // Teste 2: Conexão explícita
    console.log('2️⃣ Testando conexão explícita...');
    const db = await connectDB();
    console.log('✅ Conexão estabelecida com sucesso');
    console.log('');

    // Teste 3: Query simples
    console.log('3️⃣ Executando query de teste...');
    const result = await db.$queryRaw`SELECT NOW() as current_time, version() as postgres_version`;
    console.log('✅ Query executada com sucesso:', result);
    console.log('');

    // Teste 4: Query de organizações
    console.log('4️⃣ Testando query de organizações...');
    const organizations = await db.organization.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      take: 5
    });
    console.log(`✅ Encontradas ${organizations.length} organizações ativas`);
    organizations.forEach(org => {
      console.log(`   - ${org.name} (${org.slug})`);
    });
    console.log('');

    // Teste 5: Desconexão
    console.log('5️⃣ Testando desconexão...');
    await disconnectDB();
    console.log('✅ Desconexão realizada com sucesso');
    console.log('');

    console.log('🎉 Todos os testes passaram! A conexão está funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error('');
    console.error('🔍 Possíveis causas:');
    console.error('   - DATABASE_URL não configurada corretamente');
    console.error('   - Supabase não está acessível');
    console.error('   - Problemas de rede/firewall');
    console.error('   - Credenciais incorretas');
    console.error('');
    console.error('💡 Soluções:');
    console.error('   - Verificar variáveis de ambiente');
    console.error('   - Verificar conectividade com Supabase');
    console.error('   - Verificar configurações de firewall');
    console.error('   - Verificar credenciais do banco');
  }
}

testDatabaseConnection();
