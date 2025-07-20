#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 Setup do Framework de Testes LLM\n');

  const envPath = path.join(__dirname, '../.env');

  // Verifica se .env já existe
  if (fs.existsSync(envPath)) {
    console.log('📁 Arquivo .env já existe.');
    const overwrite = await question('Deseja sobrescrever? (s/N): ');
    
    if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'sim') {
      console.log('✅ Mantendo configuração existente.');
      rl.close();
      return;
    }
  }

  console.log('\n🔑 Configuração da API');
  console.log('Para usar o OpenAI GPT, você precisa de uma chave de API.');
  console.log('Você pode obtê-la em: https://platform.openai.com/api-keys\n');

  const apiUrl = await question('URL da API [https://api.openai.com/v1/chat/completions]: ') || 'https://api.openai.com/v1/chat/completions';
  const bearerToken = await question('Bearer Token (sk-...): ');

  if (!bearerToken) {
    console.log('❌ Bearer Token é obrigatório!');
    rl.close();
    return;
  }

  console.log('\n⚙️  Configurações opcionais (pressione Enter para usar padrão)');
  const timeout = await question('Timeout em ms [30000]: ') || '30000';
  const retryAttempts = await question('Tentativas de retry [3]: ') || '3';
  const logLevel = await question('Log level (info/debug/error) [info]: ') || 'info';
  const generateHtml = await question('Gerar relatório HTML? (s/N) [N]: ') || 'N';
  const parallelTests = await question('Testes em paralelo [1]: ') || '1';

  // Cria o conteúdo do arquivo .env
  const envContent = `# =============================================================================
# CONFIGURAÇÕES DA API
# =============================================================================
# OBRIGATÓRIAS: Configure estas variáveis para conectar com a API do LLM
API_URL=${apiUrl}
BEARER_TOKEN=${bearerToken}

# =============================================================================
# CONFIGURAÇÕES DE EXECUÇÃO
# =============================================================================
TIMEOUT=${timeout}
RETRY_ATTEMPTS=${retryAttempts}
RETRY_DELAY=1000
PARALLEL_TESTS=${parallelTests}
REQUEST_DELAY=500

# =============================================================================
# CONFIGURAÇÕES DE LOGGING
# =============================================================================
LOG_LEVEL=${logLevel}
LOG_TOKENS=true
VERBOSE_MODE=false
SAVE_LOGS=true

# =============================================================================
# CONFIGURAÇÕES DE RELATÓRIOS
# =============================================================================
GENERATE_HTML_REPORT=${generateHtml.toLowerCase() === 's' ? 'true' : 'false'}
SAVE_JSON_REPORT=true
REPORTS_DIR=reports`;

  // Salva a configuração
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Configuração salva com sucesso!');
  console.log(`📁 Arquivo criado: ${envPath}`);
  
  console.log('\n🔒 IMPORTANTE - Segurança:');
  console.log('- O arquivo .env foi adicionado ao .gitignore');
  console.log('- Sua chave de API NÃO será commitada no repositório Git');
  console.log('- Em produção, use variáveis de ambiente do sistema');

  console.log('\n🎯 Próximos passos:');
  console.log('1. Execute: npm run test');
  console.log('2. Crie seus próprios testes em: tests/');
  console.log('3. Execute: npm run validate para verificar sintaxe dos testes');
  console.log('4. Consulte docs/ para documentação completa');

  rl.close();
}

setup().catch(console.error);
