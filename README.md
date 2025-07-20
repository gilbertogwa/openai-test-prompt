# 🧪 Framework de Testes Automatizados para APIs LLM

> Um framework simples e poderoso para testar APIs de modelos de linguagem (LLM) como OpenAI GPT, Claude, Gemini e outros.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Automated-brightgreen.svg)](tests/)

## 🎯 **Propósito**

Este framework foi criado para **democratizar os testes de APIs LLM**, permitindo que qualquer pessoa - mesmo sem conhecimento técnico em programação - possa:

- ✅ **Testar prompts** de forma automatizada e repetível
- ✅ **Validar respostas** de modelos de IA com precisão
- ✅ **Gerar relatórios** detalhados em HTML e JSON
- ✅ **Executar testes em paralelo** para maior eficiência
- ✅ **Monitorar qualidade** de modelos LLM ao longo do tempo

## 🚀 **Início Rápido**

### 1. Pré-requisitos
```bash
# Node.js 18+ necessário
node --version  # deve ser >= 18.0.0
npm --version   # qualquer versão recente
```

### 2. Instalação
```bash
# Clone o repositório
git clone [URL_DO_SEU_REPOSITORIO]
cd spider-openai

# Instale as dependências
npm install
```

### 3. Configuração
```bash
# Execute o setup interativo
npm run setup
```

O setup irá solicitar:
- 🔑 **API Key** (ex: OpenAI, Claude, etc.)
- 🌐 **URL da API** (padrão: OpenAI)
- ⚙️ **Configurações** de timeout e retry

### 4. Primeiro Teste

Crie um arquivo `tests/meu-teste.json`:
```json
{
  "prompt_sistema": "Você é um assistente que extrai informações.",
  "tests": [
    {
      "name": "Extração de UF",
      "entrada": "Pessoas de São Paulo e Rio de Janeiro",
      "saida": {
        "ufs": ["SP", "RJ"]
      }
    }
  ]
}
```

### 5. Executar Testes
```bash
# Executa todos os testes
npm run test

# OU use o script automatizado (Windows)
testar.cmd  # Executa testes + abre relatórios
```

## 📁 **Estrutura do Projeto**

```
spider-openai/
├── 📄 README.md              # Este arquivo
├── 📦 package.json           # Dependências e scripts
├── ⚙️  .env                   # Configurações (criado pelo setup)
├── 🚫 .gitignore             # Arquivos ignorados pelo Git
├── 🎬 testar.cmd             # Script automatizado (Windows)
│
├── 📁 src/                   # Código fonte
│   ├── 🧠 llm-client.js      # Cliente para APIs LLM
│   ├── 🧪 test-runner.js     # Executor de testes
│   └── 📊 report-generator.js # Gerador de relatórios
│
├── 📁 tests/                 # Seus testes ficam aqui
│   └── 📄 exemplo.json       # Exemplo de teste
│
├── 📁 reports/               # Relatórios gerados
│   ├── 📊 test-report.html   # Relatório visual
│   └── 📄 test-results.json  # Dados brutos
│
├── 📁 scripts/               # Scripts auxiliares
│   └── ⚙️  setup.js          # Configuração interativa
│
└── 📁 docs/                  # Documentação completa
    └── 📚 index.md           # Índice da documentação
```

## 🎨 **Exemplos de Uso**

### Teste de Classificação
```json
{
  "prompt_sistema": "Classifique o sentimento como: positivo, negativo ou neutro.",
  "tests": [
    {
      "name": "Sentimento Positivo",
      "entrada": "Adorei o produto, muito bom!",
      "saida": "positivo"
    }
  ]
}
```

### Teste de Extração de Dados
```json
{
  "prompt_sistema": "Extraia informações estruturadas dos textos.",
  "tests": [
    {
      "name": "Extração de Contato",
      "entrada": "João Silva - joao@email.com - (11) 99999-9999",
      "saida": {
        "nome": "João Silva",
        "email": "joao@email.com",
        "telefone": "(11) 99999-9999"
      }
    }
  ]
}
```

## ⚙️ **Configurações Disponíveis**

No arquivo `.env` (criado pelo setup):

```bash
# API Configuration
API_URL=https://api.openai.com/v1/chat/completions
BEARER_TOKEN=sk-your-api-key-here

# Performance Settings
TIMEOUT=30000          # Timeout em ms
RETRY_ATTEMPTS=3       # Tentativas de retry
RETRY_DELAY=1000       # Delay entre tentativas

# Logging
LOG_LEVEL=info         # info, debug, error
LOG_TOKENS=true        # Log uso de tokens
```

## 📊 **Scripts Disponíveis**

```bash
# Configuração
npm run setup          # Setup interativo inicial

# Testes
npm run test           # Executa todos os testes
npm run test:watch     # Modo watch (re-executa ao alterar)
npm run validate       # Valida sintaxe dos testes

# Relatórios
npm run test:html      # Abre relatório HTML
npm run test:json      # Mostra relatório JSON

# Desenvolvimento
npm run dev            # Modo desenvolvimento
npm run lint           # Verifica código
```

## 🔒 **Segurança**

- 🛡️ **API Keys seguras**: Nunca commitadas no Git
- 🔐 **Variáveis de ambiente**: Configuração segura
- 📝 **Logs limpos**: Tokens e chaves não aparecem nos logs
- 🚫 **Arquivos ignorados**: .env automaticamente ignorado

## 📚 **Documentação Completa**

- 📖 [**Documentação Completa**](docs/index.md) - Guias detalhados
- 🚀 [**Guia de Início Rápido**](docs/03-guia-rapido.md)
- 📝 [**Exemplos Práticos**](docs/05-exemplos-praticos.md)
- 🛠️ [**Solução de Problemas**](docs/18-troubleshooting.md)

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

Veja o [**Guia de Contribuição**](docs/17-contribuindo.md) para mais detalhes.

## ❓ **Suporte**

- 📖 Consulte a [**FAQ**](docs/19-faq.md)
- 🔍 Veja o [**Troubleshooting**](docs/18-troubleshooting.md)
- 💬 Abra uma [**Issue**](../../issues) no GitHub

## 📄 **Licença**

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🎉 **Começar Agora!**

```bash
# Clone, instale e configure
git clone [URL]
cd spider-openai
npm install
npm run setup

# Execute seu primeiro teste
npm run test

# Veja os resultados
npm run test:html
```

---

**✨ Desenvolvido para tornar os testes de IA simples, rápidos e confiáveis!**
