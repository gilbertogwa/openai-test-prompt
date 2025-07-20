const fs = require('fs');
const path = require('path');
const { ConfigLoader } = require('./utils/config-loader');

class LLMTestRunner {
  constructor() {
    this.config = ConfigLoader.loadConfig();
    this.promptContent = this.loadPrompt();
    this.requestTemplate = this.loadRequestTemplate();
  }

  // Carrega e processa o prompt padrão
  loadPrompt() {
    const promptPath = path.join(__dirname, '../config/prompt.md');
    let content = fs.readFileSync(promptPath, 'utf8');
    
    // Remove quebras de linha desnecessárias para reduzir tokens
    content = content.replace(/\n\s*\n/g, '\n').trim();
    
    return content;
  }

  // Carrega template da requisição
  loadRequestTemplate() {
    const templatePath = path.join(__dirname, '../config/body.json');
    return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  }

  // Substitui placeholders no template
  processTemplate(template, input) {
    // Clona o template para evitar mutação
    const processedTemplate = JSON.parse(JSON.stringify(template));
    
    // Função para substituir recursivamente nos objetos
    const replaceInObject = (obj) => {
      if (typeof obj === 'string') {
        return obj
          .replace(/\{\{prompt\}\}/g, this.promptContent)
          .replace(/\{\{input\}\}/g, input);
      }
      if (Array.isArray(obj)) {
        return obj.map(replaceInObject);
      }
      if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = replaceInObject(value);
        }
        return result;
      }
      return obj;
    };
    
    return replaceInObject(processedTemplate);
  }

  // Executa requisição para a API
  async makeApiRequest(requestBody, retryCount = 0) {
    try {
      const response = await fetch(this.config.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(parseInt(this.config.TIMEOUT))
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
      
    } catch (error) {
      // Sistema de retry baseado na configuração
      if (retryCount < parseInt(this.config.RETRY_ATTEMPTS)) {
        if (this.config.LOG_LEVEL === 'debug') {
          console.log(`⚠️  Tentativa ${retryCount + 1} falhou, tentando novamente em ${this.config.RETRY_DELAY}ms...`);
        }
        
        await new Promise(resolve => setTimeout(resolve, parseInt(this.config.RETRY_DELAY)));
        return this.makeApiRequest(requestBody, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Normaliza JSON para comparação
  normalizeJson(obj) {
    if (typeof obj === 'string') {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        return obj.trim();
      }
    }
    
    return JSON.parse(JSON.stringify(obj, Object.keys(obj).sort()));
  }

  // Compara resultados esperados vs obtidos
  compareResults(expected, actual) {
    const normalizedExpected = this.normalizeJson(expected);
    const normalizedActual = this.normalizeJson(actual);
    
    return {
      isEqual: JSON.stringify(normalizedExpected) === JSON.stringify(normalizedActual),
      expected: normalizedExpected,
      actual: normalizedActual
    };
  }

  // Executa um único teste
  async runSingleTest(testCase, testIndex) {
    console.log(`\n🧪 Executando Teste ${testIndex + 1}: ${testCase.name || testCase.id || `Teste ${testIndex + 1}`}`);
    console.log(`📝 Entrada: "${testCase.entrada}"`);

    try {
      // Processa template da requisição
      const requestBody = this.processTemplate(this.requestTemplate, testCase.entrada);
      
      // Faz a requisição
      const startTime = Date.now();
      const apiResponse = await this.makeApiRequest(requestBody);
      const endTime = Date.now();
      
      // Extrai o conteúdo da resposta
      const content = apiResponse.choices[0].message.content;
      
      // Log de tokens se disponível e configurado
      if (apiResponse.usage && this.config.LOG_TOKENS === 'true') {
        console.log(`🪙 Tokens: ${apiResponse.usage.total_tokens} (prompt: ${apiResponse.usage.prompt_tokens}, completion: ${apiResponse.usage.completion_tokens})`);
      }
      
      if (this.config.LOG_LEVEL === 'debug' || this.config.VERBOSE_MODE === 'true') {
        console.log(`⏱️  Tempo: ${endTime - startTime}ms`);
        console.log(`📤 Request:`, JSON.stringify(requestBody, null, 2));
        console.log(`📥 Response:`, JSON.stringify(apiResponse, null, 2));
      } else if (this.config.LOG_LEVEL === 'info') {
        console.log(`⏱️  Tempo: ${endTime - startTime}ms`);
      }
      
      // Tenta parsear o conteúdo como JSON
      let actualResult;
      try {
        actualResult = JSON.parse(content);
      } catch (e) {
        actualResult = content;
      }
      
      // Compara resultados
      const comparison = this.compareResults(testCase.saida, actualResult);
      
      if (comparison.isEqual) {
        console.log(`✅ Teste PASSOU`);
        return {
          status: 'passed',
          testCase,
          response: apiResponse,
          actualResult,
          executionTime: endTime - startTime
        };
      } else {
        console.log(`❌ Teste FALHOU`);
        console.log(`📄 Esperado:`, JSON.stringify(comparison.expected, null, 2));
        console.log(`📄 Obtido:`, JSON.stringify(comparison.actual, null, 2));
        return {
          status: 'failed',
          testCase,
          response: apiResponse,
          actualResult,
          expectedResult: testCase.saida,
          executionTime: endTime - startTime,
          error: 'Resultado não confere com o esperado'
        };
      }
      
    } catch (error) {
      console.log(`💥 Teste com ERRO: ${error.message}`);
      return {
        status: 'error',
        testCase,
        error: error.message,
        executionTime: 0
      };
    }
  }

  // Carrega arquivo de teste
  loadTestFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const testData = JSON.parse(content);
      
      // Suporte para formato legacy (array direto) e novo formato (com metadata)
      if (Array.isArray(testData)) {
        return {
          metadata: { name: path.basename(filePath) },
          tests: testData
        };
      }
      
      return testData;
    } catch (error) {
      throw new Error(`Erro ao carregar arquivo de teste ${filePath}: ${error.message}`);
    }
  }

  // Executa todos os testes de um arquivo
  async runTestFile(filePath) {
    if (this.config.LOG_LEVEL === 'debug' || this.config.VERBOSE_MODE === 'true') {
      console.log(`\n🎯 Executando arquivo: ${path.basename(filePath)}`);
    }
    
    const testData = this.loadTestFile(filePath);
    const results = [];
    
    if (testData.metadata && this.config.LOG_LEVEL !== 'error') {
      console.log(`📋 Nome: ${testData.metadata.name}`);
      if (testData.metadata.description) {
        console.log(`📝 Descrição: ${testData.metadata.description}`);
      }
    }
    
    // Execução com controle de paralelismo
    const parallelTests = parseInt(this.config.PARALLEL_TESTS) || 1;
    
    if (parallelTests > 1) {
      // Execução paralela
      const chunks = [];
      for (let i = 0; i < testData.tests.length; i += parallelTests) {
        chunks.push(testData.tests.slice(i, i + parallelTests));
      }
      
      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map((test, index) => this.runSingleTest(test, index))
        );
        results.push(...chunkResults);
        
        // Pausa entre lotes se configurada
        if (this.config.REQUEST_DELAY && chunk.length > 1) {
          await new Promise(resolve => setTimeout(resolve, parseInt(this.config.REQUEST_DELAY)));
        }
      }
    } else {
      // Execução sequencial
      for (let i = 0; i < testData.tests.length; i++) {
        const result = await this.runSingleTest(testData.tests[i], i);
        results.push(result);
        
        // Pausa entre testes se configurada
        if (i < testData.tests.length - 1 && this.config.REQUEST_DELAY) {
          await new Promise(resolve => setTimeout(resolve, parseInt(this.config.REQUEST_DELAY)));
        }
      }
    }
    
    return {
      file: filePath,
      metadata: testData.metadata,
      results
    };
  }

  // Gera relatório resumido
  generateSummary(fileResults) {
    console.log(`\n📊 ========== RESUMO DOS TESTES ==========`);
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let errorTests = 0;
    let totalTokens = 0;
    let totalTime = 0;
    
    fileResults.forEach(fileResult => {
      console.log(`\n📁 Arquivo: ${path.basename(fileResult.file)}`);
      
      const filePassed = fileResult.results.filter(r => r.status === 'passed').length;
      const fileFailed = fileResult.results.filter(r => r.status === 'failed').length;
      const fileErrors = fileResult.results.filter(r => r.status === 'error').length;
      
      console.log(`   ✅ Passou: ${filePassed}`);
      console.log(`   ❌ Falhou: ${fileFailed}`);
      console.log(`   💥 Erro: ${fileErrors}`);
      
      totalTests += fileResult.results.length;
      passedTests += filePassed;
      failedTests += fileFailed;
      errorTests += fileErrors;
      
      fileResult.results.forEach(result => {
        if (result.response && result.response.usage) {
          totalTokens += result.response.usage.total_tokens;
        }
        totalTime += result.executionTime;
      });
    });
    
    console.log(`\n🎯 ========== TOTAL GERAL ==========`);
    console.log(`📊 Testes executados: ${totalTests}`);
    console.log(`✅ Sucessos: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`❌ Falhas: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
    console.log(`💥 Erros: ${errorTests} (${Math.round(errorTests/totalTests*100)}%)`);
    console.log(`🪙 Total de tokens: ${totalTokens.toLocaleString()}`);
    console.log(`⏱️  Tempo total: ${(totalTime/1000).toFixed(1)}s`);
    
    return {
      totalTests,
      passedTests,
      failedTests,
      errorTests,
      totalTokens,
      totalTime,
      successRate: Math.round(passedTests/totalTests*100)
    };
  }
}


// Função para execução standalone (fora do Playwright)
async function runStandalone() {
  const runner = new LLMTestRunner();
  const testsDir = path.join(__dirname, '../tests');
  
  const testFiles = fs.readdirSync(testsDir)
    .filter(file => file.endsWith('.json') && !file.startsWith('_'))
    .map(file => path.join(testsDir, file));

  const allResults = [];
  
  for (const testFile of testFiles) {
    try {
      const result = await runner.runTestFile(testFile);
      allResults.push(result);
    } catch (error) {
      console.error(`Erro ao executar ${testFile}:`, error.message);
    }
  }
  
  const summary = runner.generateSummary(allResults);
  
  // Cria diretório de relatórios
  const reportsDir = runner.config.REPORTS_DIR || 'reports';
  fs.mkdirSync(reportsDir, { recursive: true });
  
  // Salva relatório JSON se configurado
  if (runner.config.SAVE_JSON_REPORT === 'true') {
    const reportPath = path.join(reportsDir, 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary,
      results: allResults,
      timestamp: new Date().toISOString(),
      config: runner.config
    }, null, 2));
    
    console.log(`\n💾 Relatório JSON salvo em: ${reportPath}`);
  }
  
  // Gera relatório HTML se configurado
  if (runner.config.GENERATE_HTML_REPORT === 'true') {
    const htmlReportPath = path.join(reportsDir, 'test-report.html');
    const htmlContent = generateHtmlReport(summary, allResults);
    fs.writeFileSync(htmlReportPath, htmlContent);
    
    console.log(`📊 Relatório HTML salvo em: ${htmlReportPath}`);
  }
  
  // Exit code baseado no resultado
  process.exit(summary.failedTests + summary.errorTests > 0 ? 1 : 0);
}

// Função para gerar relatório HTML
function generateHtmlReport(summary, results) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Relatório de Testes LLM</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .error { color: #fd7e14; }
        .test { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .test-input { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .test-output { background: #e9ecef; padding: 10px; margin: 5px 0; border-radius: 3px; }
        pre { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>📊 Relatório de Testes LLM</h1>
    
    <div class="summary">
        <h2>Resumo Geral</h2>
        <p><strong>Total de testes:</strong> ${summary.totalTests}</p>
        <p><strong class="passed">✅ Sucessos:</strong> ${summary.passedTests} (${summary.successRate}%)</p>
        <p><strong class="failed">❌ Falhas:</strong> ${summary.failedTests}</p>
        <p><strong class="error">💥 Erros:</strong> ${summary.errorTests}</p>
        <p><strong>🪙 Total de tokens:</strong> ${summary.totalTokens?.toLocaleString()}</p>
        <p><strong>⏱️ Tempo total:</strong> ${(summary.totalTime/1000).toFixed(1)}s</p>
    </div>
    
    ${results.map(fileResult => `
        <h2>📁 ${path.basename(fileResult.file)}</h2>
        ${fileResult.results.map((result, index) => `
            <div class="test ${result.status}">
                <h3>${result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '💥'} 
                    ${result.testCase.name || `Teste ${index + 1}`}</h3>
                
                <div class="test-input">
                    <strong>📝 Entrada:</strong><br>
                    <pre>${result.testCase.entrada}</pre>
                </div>
                
                ${result.status === 'passed' ? `
                    <div class="test-output passed">
                        <strong>✅ Resultado:</strong><br>
                        <pre>${JSON.stringify(result.actualResult, null, 2)}</pre>
                    </div>
                ` : ''}
                
                ${result.status === 'failed' ? `
                    <div class="test-output failed">
                        <strong>❌ Esperado:</strong><br>
                        <pre>${JSON.stringify(result.expectedResult, null, 2)}</pre>
                        <strong>Obtido:</strong><br>
                        <pre>${JSON.stringify(result.actualResult, null, 2)}</pre>
                    </div>
                ` : ''}
                
                ${result.status === 'error' ? `
                    <div class="test-output error">
                        <strong>💥 Erro:</strong><br>
                        <pre>${result.error}</pre>
                    </div>
                ` : ''}
                
                <p><small>
                    ${result.response?.usage ? `🪙 Tokens: ${result.response.usage.total_tokens} | ` : ''}
                    ⏱️ Tempo: ${result.executionTime}ms
                </small></p>
            </div>
        `).join('')}
    `).join('')}
    
    <footer style="margin-top: 40px; text-align: center; color: #666;">
        <p>Relatório gerado em ${new Date().toLocaleString()}</p>
    </footer>
</body>
</html>`;
}

// Executa standalone se chamado diretamente
if (require.main === module) {
  runStandalone().catch(console.error);
}

module.exports = { LLMTestRunner };