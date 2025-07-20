# Especificação: Sistema de Testes Automatizados para LLM

## Objetivo
Criar um framework de testes automatizados usando Playwright que permita a usuários não-técnicos criarem e executarem testes de API para modelos de linguagem de forma simples e intuitiva.

## Arquitetura do Sistema

### Estrutura de Diretórios
```
projeto-testes-llm/
├── config/
│   ├── body.json          # Template do corpo da requisição
│   └── prompt.md          # Prompt padrão do sistema
├── tests/
│   ├── exemplos/
│   │   ├── teste-basico.json
│   │   └── teste-avancado.json
│   └── [arquivos-de-teste-do-usuario].json
├── src/
│   ├── test-runner.js     # Engine principal de execução
│   ├── utils/
│   │   ├── config-loader.js
│   │   ├── template-processor.js
│   │   └── result-comparator.js
│   └── reporters/
│       ├── console-reporter.js
│       └── json-reporter.js
├── reports/               # Relatórios de execução
├── package.json
├── .env
├── playwright.config.js
└── README.md
```

## Especificações Técnicas

### 1. Arquivo de Configuração (`.env`)
```ini
# Configurações da API
API_URL=https://api.openai.com/v1/chat/completions
BEARER_TOKEN=your_bearer_token_here
TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_DELAY=1000

# Configurações de logging
LOG_LEVEL=info
LOG_TOKENS=true
```

### 2. Template do Corpo da Requisição (`config/body.json`)
```json
{
  "model": "gpt-4o-mini",
  "max_tokens": 150,
  "temperature": 0.7,
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "{{prompt}}"
        }
      ]
    },
    {
      "role": "user", 
      "content": "{{input}}"
    }
  ]
}
```

### 3. Prompt Padrão (`config/prompt.md`)
```markdown
Você é um assistente especializado em processamento de dados.
Analise a entrada fornecida e retorne uma resposta estruturada em formato JSON.
Seja preciso e conciso em suas respostas.
```

### 4. Estrutura do Arquivo de Teste
```json
{
  "metadata": {
    "name": "Testes de Extração de UFs",
    "description": "Testes para validar extração de estados brasileiros",
    "version": "1.0.0",
    "author": "Nome do Criador"
  },
  "config": {
    "timeout": 30000,
    "retries": 2,
    "skipOnError": false
  },
  "tests": [
    {
      "id": "test-001",
      "name": "Extração UF única",
      "entrada": "Preciso saber qual é o estado da cidade de São Paulo",
      "saida": {
        "uf": "SP",
        "cidade": "São Paulo"
      },
      "tags": ["uf", "geografia", "basico"]
    },
    {
      "id": "test-002", 
      "name": "Múltiplas UFs",
      "entrada": "Quais estados contêm as cidades Rio de Janeiro, Belo Horizonte e Salvador?",
      "saida": {
        "cidades": [
          {"nome": "Rio de Janeiro", "uf": "RJ"},
          {"nome": "Belo Horizonte", "uf": "MG"},
          {"nome": "Salvador", "uf": "BA"}
        ]
      },
      "tags": ["uf", "multiplas-cidades"]
    }
  ]
}
```

### 5. Estrutura da Resposta da API
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\n  \"uf\": \"SP\",\n  \"cidade\": \"São Paulo\"\n}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1301,
    "completion_tokens": 9,
    "total_tokens": 1310
  }
}
```

## Funcionalidades Principais

### 1. Processamento de Templates
- **Substituição de Parâmetros**: Sistema robusto para substituir `{{prompt}}` e `{{input}}`
- **Sanitização**: Remoção automática de quebras de linha desnecessárias
- **Caching**: Prompt carregado uma vez e reutilizado
- **Validação**: Verificação se todos os templates foram substituídos

### 2. Execução de Testes
- **Execução Paralela**: Múltiplos testes simultâneos (configurável)
- **Retry Logic**: Tentativas automáticas em caso de falha
- **Timeout Handling**: Timeouts configuráveis por teste
- **Error Recovery**: Continuação da execução mesmo com falhas

### 3. Comparação de Resultados
```javascript
// Algoritmo de comparação melhorado
function compareResults(expected, actual) {
  // 1. Normalização de JSON (remove espaços, quebras de linha)
  // 2. Comparação profunda de objetos
  // 3. Tolerância a diferenças de formatação
  // 4. Relatório detalhado de diferenças
}
```

### 4. Sistema de Relatórios
- **Console Report**: Saída colorida em tempo real
- **JSON Report**: Relatório estruturado para integração
- **HTML Report**: Relatório visual para não-programadores
- **Token Usage**: Tracking detalhado de consumo de tokens

## Interface para Usuários Não-Técnicos

### 1. Comandos Simplificados
```bash
# Executar todos os testes
npm run test

# Executar testes específicos
npm run test -- --file=teste-basico.json

# Executar com tags específicas
npm run test -- --tags=uf,basico

# Gerar relatório HTML
npm run test:report
```

### 2. Validador de Arquivos de Teste
```bash
# Validar sintaxe antes da execução
npm run validate tests/meu-teste.json
```

### 3. Gerador de Templates
```bash
# Criar novo arquivo de teste
npm run create:test --name="Meus Testes" --output=tests/meus-testes.json
```

## Configurações Avançadas

### 1. Playwright Configuration (`playwright.config.js`)
```javascript
module.exports = {
  timeout: 30000,
  retries: 2,
  reporter: [
    ['html'],
    ['json', { outputFile: 'reports/test-results.json' }]
  ],
  use: {
    baseURL: process.env.API_URL,
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
};
```

### 2. Configurações de Ambiente
```bash
# .env file
API_URL=https://api.openai.com/v1/chat/completions
BEARER_TOKEN=sk-your-token-here
LOG_LEVEL=debug
PARALLEL_TESTS=3
```

## Recursos de Usabilidade

### 1. Validação de Entrada
- Verificação automática da sintaxe JSON
- Validação de campos obrigatórios
- Sugestões de correção para erros comuns

### 2. Modo Interativo
```bash
# Modo assistido para criação de testes
npm run interactive
```

### 3. Documentação Auto-Gerada
- Exemplos automáticos baseados nos testes existentes
- Documentação de campos e formatos
- Guias passo-a-passo

## Exemplo de Execução

### 1. Setup Inicial
```bash
git clone projeto-testes-llm
cd projeto-testes-llm
npm install
cp config/api.conf.example config/api.conf
# Editar api.conf com suas credenciais
```

### 2. Criação de Teste
```bash
# Copiar exemplo
cp tests/exemplos/teste-basico.json tests/meu-teste.json
# Editar meu-teste.json conforme necessário
```

### 3. Execução
```bash
npm run test -- --file=meu-teste.json
```

### 4. Relatório de Resultados
```
✅ Test: Extração UF única
   Entrada: "Preciso saber qual é o estado da cidade de São Paulo"
   Esperado: {"uf": "SP", "cidade": "São Paulo"}
   Obtido: {"uf": "SP", "cidade": "São Paulo"}
   Tokens: 1310 (prompt: 1301, completion: 9)
   Tempo: 1.2s

❌ Test: Múltiplas UFs  
   Entrada: "Quais estados contêm as cidades Rio de Janeiro..."
   Erro: Campo 'cidades[1].uf' esperava 'MG' mas obteve 'RJ'
   Tokens: 1425 (prompt: 1301, completion: 124)
   Tempo: 2.1s

📊 Resumo: 1/2 testes passaram (50%)
💰 Total de tokens: 2735
⏱️  Tempo total: 3.3s
```

## Considerações de Implementação

### 1. Tratamento de Erros
- Logs detalhados para debugging
- Mensagens de erro amigáveis
- Recuperação automática quando possível

### 2. Performance
- Cache de prompts para reutilização
- Execução paralela configurável
- Otimização de requisições de rede

### 3. Segurança
- Sanitização de inputs
- Validação de tokens de API
- Logs sem exposição de credenciais

### 4. Extensibilidade
- Plugin system para novos tipos de comparação
- Suporte a múltiplos provedores de LLM
- Templates customizáveis por projeto