const fs = require('fs');
const path = require('path');

class TestValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // Valida um arquivo de teste
  validateTestFile(filePath) {
    this.errors = [];
    this.warnings = [];
    
    console.log(`🔍 Validando: ${path.basename(filePath)}`);
    
    try {
      // Verifica se arquivo existe
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Arquivo não encontrado: ${filePath}`);
        return this.getResults();
      }
      
      // Carrega e parseia JSON
      const content = fs.readFileSync(filePath, 'utf8');
      let testData;
      
      try {
        testData = JSON.parse(content);
      } catch (parseError) {
        this.errors.push(`JSON inválido: ${parseError.message}`);
        return this.getResults();
      }
      
      // Valida estrutura
      this.validateStructure(testData);
      
      // Valida metadados (se presentes)
      if (testData.metadata) {
        this.validateMetadata(testData.metadata);
      }
      
      // Valida configurações (se presentes)
      if (testData.config) {
        this.validateConfig(testData.config);
      }
      
      // Valida array de testes
      this.validateTests(testData.tests || testData);
      
    } catch (error) {
      this.errors.push(`Erro inesperado: ${error.message}`);
    }
    
    return this.getResults();
  }
  
  validateStructure(data) {
    // Formato novo (com metadata) ou legacy (array direto)
    if (Array.isArray(data)) {
      // Formato legacy - ok
      return;
    }
    
    if (!data.tests) {
      this.errors.push('Propriedade "tests" é obrigatória no formato novo');
      return;
    }
    
    if (!Array.isArray(data.tests)) {
      this.errors.push('"tests" deve ser um array');
    }
  }
  
  validateMetadata(metadata) {
    if (!metadata.name) {
      this.warnings.push('Metadata: "name" não informado');
    }
    
    if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      this.warnings.push('Metadata: "version" deve seguir o padrão semântico (ex: 1.0.0)');
    }
  }
  
  validateConfig(config) {
    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
      this.errors.push('Config: "timeout" deve ser um número positivo');
    }
    
    if (config.retries && (typeof config.retries !== 'number' || config.retries < 0)) {
      this.errors.push('Config: "retries" deve ser um número não-negativo');
    }
    
    if (config.skipOnError && typeof config.skipOnError !== 'boolean') {
      this.errors.push('Config: "skipOnError" deve ser boolean');
    }
  }
  
  validateTests(tests) {
    if (!Array.isArray(tests)) {
      this.errors.push('Tests deve ser um array');
      return;
    }
    
    if (tests.length === 0) {
      this.warnings.push('Nenhum teste encontrado');
      return;
    }
    
    tests.forEach((test, index) => {
      this.validateSingleTest(test, index);
    });
    
    // Verifica IDs duplicados
    const ids = tests.filter(t => t.id).map(t => t.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      this.errors.push(`IDs duplicados encontrados: ${duplicateIds.join(', ')}`);
    }
  }
  
  validateSingleTest(test, index) {
    const testLabel = test.id || test.name || `Teste ${index + 1}`;
    
    // Valida campos obrigatórios
    if (!test.entrada) {
      this.errors.push(`${testLabel}: Campo "entrada" é obrigatório`);
    }
    
    if (!test.saida) {
      this.errors.push(`${testLabel}: Campo "saida" é obrigatório`);
    }
    
    // Valida tipos
    if (test.entrada && typeof test.entrada !== 'string') {
      this.errors.push(`${testLabel}: "entrada" deve ser uma string`);
    }
    
    if (test.saida && typeof test.saida !== 'object') {
      this.errors.push(`${testLabel}: "saida" deve ser um objeto`);
    }
    
    // Valida campos opcionais
    if (test.tags && !Array.isArray(test.tags)) {
      this.warnings.push(`${testLabel}: "tags" deve ser um array`);
    }
    
    if (test.name && typeof test.name !== 'string') {
      this.warnings.push(`${testLabel}: "name" deve ser uma string`);
    }
    
    // Valida saída JSON
    if (test.saida) {
      try {
        JSON.stringify(test.saida);
      } catch (error) {
        this.errors.push(`${testLabel}: "saida" contém JSON inválido`);
      }
    }
  }
  
  getResults() {
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;
    
    if (hasErrors) {
      console.log('❌ ERROS ENCONTRADOS:');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (hasWarnings) {
      console.log('⚠️  AVISOS:');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (!hasErrors && !hasWarnings) {
      console.log('✅ Arquivo válido!');
    }
    
    return {
      valid: !hasErrors,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// Função para executar validação de linha de comando
function runValidator() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Uso: node validator.js <arquivo-de-teste.json>');
    console.log('ou:  npm run validate <arquivo-de-teste.json>');
    process.exit(1);
  }
  
  const filePath = args[0];
  const validator = new TestValidator();
  const result = validator.validateTestFile(filePath);
  
  process.exit(result.valid ? 0 : 1);
}

if (require.main === module) {
  runValidator();
}

module.exports = { TestValidator };