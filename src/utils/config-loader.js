const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ConfigLoader {
  static loadConfig() {
    console.log('🔗 Carregando configurações do arquivo .env');
    
    const config = this.loadEnvConfig();
    this.validateConfig(config);
    
    return config;
  }
  
  
  static loadEnvConfig() {
    // Configurações padrão
    const defaultConfig = {
      API_URL: 'https://api.openai.com/v1/chat/completions',
      BEARER_TOKEN: '',
      TIMEOUT: '30000',
      RETRY_ATTEMPTS: '3',
      RETRY_DELAY: '1000',
      PARALLEL_TESTS: '1',
      REQUEST_DELAY: '500',
      LOG_LEVEL: 'info',
      LOG_TOKENS: 'true',
      VERBOSE_MODE: 'false',
      SAVE_LOGS: 'false',
      GENERATE_HTML_REPORT: 'false',
      SAVE_JSON_REPORT: 'true',
      REPORTS_DIR: 'reports'
    };
    
    // Carrega todas as configurações do .env com fallback para padrões
    const config = {
      API_URL: process.env.API_URL || defaultConfig.API_URL,
      BEARER_TOKEN: process.env.BEARER_TOKEN || defaultConfig.BEARER_TOKEN,
      TIMEOUT: process.env.TIMEOUT || defaultConfig.TIMEOUT,
      RETRY_ATTEMPTS: process.env.RETRY_ATTEMPTS || defaultConfig.RETRY_ATTEMPTS,
      RETRY_DELAY: process.env.RETRY_DELAY || defaultConfig.RETRY_DELAY,
      PARALLEL_TESTS: process.env.PARALLEL_TESTS || defaultConfig.PARALLEL_TESTS,
      REQUEST_DELAY: process.env.REQUEST_DELAY || defaultConfig.REQUEST_DELAY,
      LOG_LEVEL: process.env.LOG_LEVEL || defaultConfig.LOG_LEVEL,
      LOG_TOKENS: process.env.LOG_TOKENS || defaultConfig.LOG_TOKENS,
      VERBOSE_MODE: process.env.VERBOSE_MODE || defaultConfig.VERBOSE_MODE,
      SAVE_LOGS: process.env.SAVE_LOGS || defaultConfig.SAVE_LOGS,
      GENERATE_HTML_REPORT: process.env.GENERATE_HTML_REPORT || defaultConfig.GENERATE_HTML_REPORT,
      SAVE_JSON_REPORT: process.env.SAVE_JSON_REPORT || defaultConfig.SAVE_JSON_REPORT,
      REPORTS_DIR: process.env.REPORTS_DIR || defaultConfig.REPORTS_DIR
    };
    
    return config;
  }
  
  static validateConfig(config) {
    const envPath = path.join(__dirname, '../../.env');
    
    if (!config.API_URL) {
      throw new Error(`
❌ API_URL não configurada!

Crie o arquivo .env com:
API_URL=https://api.openai.com/v1/chat/completions
BEARER_TOKEN=sk-seu-token-aqui

Ou use o comando: npm run setup`);
    }
    
    if (!config.BEARER_TOKEN) {
      throw new Error(`
❌ BEARER_TOKEN não configurado!

Crie o arquivo .env com:
API_URL=https://api.openai.com/v1/chat/completions
BEARER_TOKEN=sk-seu-token-aqui

Ou use o comando: npm run setup`);
    }
    
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  Arquivo .env não encontrado, usando configurações padrão');
    }
    
    console.log('✅ Configurações validadas com sucesso');
  }
  
  static loadRequestTemplate() {
    const templatePath = path.join(__dirname, '../../config/body.json');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template de requisição não encontrado: ${templatePath}`);
    }
    
    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Erro ao parsear body.json: ${error.message}`);
    }
  }
  
  static loadPrompt() {
    const promptPath = path.join(__dirname, '../../config/prompt.md');
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Arquivo de prompt não encontrado: ${promptPath}`);
    }
    
    let content = fs.readFileSync(promptPath, 'utf8');
    
    // Remove quebras de linha excessivas para economizar tokens
    content = content.replace(/\n\s*\n/g, '\n').trim();
    
    return content;
  }
}

module.exports = { ConfigLoader };