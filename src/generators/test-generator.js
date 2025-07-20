const fs = require('fs');
const path = require('path');
const readline = require('readline');

class TestGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  
  async generateInteractive() {
    console.log('🎯 Gerador de Arquivos de Teste\n');
    
    try {
      const metadata = await this.collectMetadata();
      const tests = await this.collectTests();
      
      const testData = {
        metadata,
        config: {
          timeout: 30000,
          retries: 2,
          skipOnError: false
        },
        tests
      };
      
      const fileName = await this.askQuestion('Nome do arquivo (sem .json): ');
      const outputPath = path.join(__dirname, '../../tests', `${fileName}.json`);
      
      // Cria diretório se não existir
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      
      // Salva arquivo
      fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
      
      console.log(`\n✅ Arquivo criado: ${outputPath}`);
      console.log(`\n🚀 Execute com: npm run test -- --file=${fileName}.json`);
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      this.rl.close();
    }
  }
  
  async collectMetadata() {
    console.log('📋 Informações do Arquivo:');
    
    const name = await this.askQuestion('Nome do conjunto de testes: ');
    const description = await this.askQuestion('Descrição (opcional): ');
    const author = await this.askQuestion('Autor (opcional): ');
    
    return {
      name,
      description: description || undefined,
      version: '1.0.0',
      author: author || undefined
    };
  }
  
  async collectTests() {
    const tests = [];
    let testCounter = 1;
    
    console.log('\n🧪 Criação de Testes:');
    console.log('(Digite "fim" em qualquer campo para terminar)\n');
    
    while (true) {
      console.log(`--- Teste ${testCounter} ---`);
      
      const testName = await this.askQuestion('Nome do teste: ');
      if (testName.toLowerCase() === 'fim') break;
      
      const entrada = await this.askQuestion('Texto de entrada: ');
      if (entrada.toLowerCase() === 'fim') break;
      
      const saidaStr = await this.askQuestion('Saída esperada (JSON): ');
      if (saidaStr.toLowerCase() === 'fim') break;
      
      let saida;
      try {
        saida = JSON.parse(saidaStr);
      } catch (error) {
        console.log('⚠️  JSON inválido, usando como string simples');
        saida = { result: saidaStr };
      }
      
      const tags = await this.askQuestion('Tags (separadas por vírgula, opcional): ');
      
      const test = {
        id: `test-${String(testCounter).padStart(3, '0')}`,
        name: testName,
        entrada,
        saida,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      };
      
      tests.push(test);
      testCounter++;
      
      const continuar = await this.askQuestion('Adicionar outro teste? (s/n): ');
      if (continuar.toLowerCase() !== 's') break;
      
      console.log();
    }
    
    return tests;
  }
  
  generateTemplate(options = {}) {
    const template = {
      metadata: {
        name: options.name || 'Novo Conjunto de Testes',
        description: options.description || 'Descrição dos testes',
        version: '1.0.0',
        author: options.author || 'Autor'
      },
      config: {
        timeout: 30000,
        retries: 2,
        skipOnError: false
      },
      tests: [
        {
          id: 'test-001',
          name: 'Exemplo de teste',
          entrada: 'Texto de entrada para o modelo',
          saida: {
            resultado: 'Resposta esperada'
          },
          tags: ['exemplo', 'basico']
        }
      ]
    };
    
    return template;
  }
  
  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Função para executar gerador de linha de comando
async function runGenerator() {
  const args = process.argv.slice(2);
  const generator = new TestGenerator();
  
  // Verifica argumentos
  const nameArg = args.find(arg => arg.startsWith('--name='));
  const outputArg = args.find(arg => arg.startsWith('--output='));
  const interactiveArg = args.includes('--interactive');
  
  if (interactiveArg) {
    await generator.generateInteractive();
    return;
  }
  
  // Modo não-interativo
  const name = nameArg ? nameArg.split('=')[1] : 'Novo Teste';
  const outputPath = outputArg ? outputArg.split('=')[1] : 'tests/novo-teste.json';
  
  const template = generator.generateTemplate({ name });
  
  // Cria diretório se não existir
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  // Salva arquivo
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
  
  console.log(`✅ Template criado: ${outputPath}`);
  console.log(`📝 Edite o arquivo e execute: npm run test`);
  
  generator.rl.close();
}

if (require.main === module) {
  runGenerator().catch(console.error);
}

module.exports = { TestGenerator };