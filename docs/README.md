### 💡 **Exemplos Práticos de Configuração:**

#### 🏃‍♂️ **Modo Rápido (muitos testes):**
```bash
# .env
PARALLEL_TESTS=10
LOG_LEVEL=error
LOG_TOKENS=false
GENERATE_HTML_REPORT=false
```

#### 🔍 **Modo Debug (investigar problemas):**
```bash
# .env  
PARALLEL_TESTS=1
LOG_LEVEL=debug
VERBOSE_MODE=true
RETRY_ATTEMPTS=1
```

#### 📊 **Modo Produção (relatórios completos):**
```bash
# .env
PARALLEL_TESTS=3
GENERATE_HTML_REPORT=true
SAVE_JSON_REPORT=true
LOG_TOKENS=true
```

### Timeout e Retry por Teste
Você também pode configurar no arquivo de teste individual:

```json
{
  "config": {
    "timeout": 30000,     // 30 segundos
    "retries": 3,         // 3 tentativas
    "skipOnError": false  // Parar se houver erro
  },
  "tests": [...]
}
```# 🤖 Framework de Testes Automatizados para LLM

Um sistema simples e poderoso para testar APIs de modelos de linguagem, projetado para ser usado por **qualquer pessoa**, mesmo sem conhecimento técnico em programação.

## 🎯 Objetivo

Este framework permite que você:
- ✅ Teste automaticamente respostas de APIs de LLM
- ✅ Compare resultados esperados vs obtidos
- ✅ Monitore consumo de tokens
- ✅ Gere relatórios detalhados
- ✅ Crie novos testes apenas editando arquivos JSON

## 🚀 Início Rápido

### 1. Instalação

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/llm-automated-tests
cd llm-automated-tests

# Instale as dependências
npm install

# Configure o Playwright
npm run setup
```

### 2. Configuração

#### 2.1 Configure sua API
Edite o arquivo `config/api.conf` (configurações da API):

```ini
API_URL=https://api.openai.com/v1/chat/completions
BEARER_TOKEN=sk-seu-token-aqui
```

#### 2.2 Configure a Execução dos Testes (Opcional)
Copie e edite o arquivo `.env` (configurações de execução):

```bash
cp .env.example .env
```

Edite `.env` conforme necessário:
```bash
# Configurações de performance
PARALLEL_TESTS=3
TIMEOUT=30000
RETRY_ATTEMPTS=3

# Configurações de relatórios
GENERATE_HTML_REPORT=true
LOG_TOKENS=true
```

#### 2.3 Personalize o Prompt (Opcional)
Edite `config/prompt.md` com as instruções específicas para seu modelo.

### 3. Execute um Teste de Exemplo

```bash
npm run test
```

## 📁 Estrutura do Projeto

```
projeto/
├── config/
│   ├── body.json        # ← Template da requisição  
│   └── prompt.md        # ← Instrução para o modelo
├── .env                 # ← Configure EXECUÇÃO aqui (opcional)
├── .env.example         # ← Template das configurações de execução
├── tests/
│   ├── exemplo-basico.json    # ← Seus testes ficam aqui
│   └── exemplo-avancado.json
├── reports/             # ← Relatórios são salvos aqui
└── README.md           # ← Este arquivo
```

### 🔧 **Configurações Separadas:**

| Arquivo | Responsabilidade | Obrigatório |
|---------|------------------|-------------|
| `.env` | ⚙️ **Execução**: Timeout, Paralelos, Relatórios | ❌ Não |

## 📝 Como Criar Seus Próprios Testes

### Passo 1: Copie um Exemplo
```bash
cp tests/exemplo-basico.json tests/meus-testes.json
```

### Passo 2: Edite o Arquivo
Abra `tests/meus-testes.json` em qualquer editor de texto:

```json
{
  "metadata": {
    "name": "Meus Testes Personalizados",
    "description": "Descrição do que estes testes validam"
  },
  "tests": [
    {
      "id": "meu-teste-001",
      "name": "Nome descritivo do teste",
      "entrada": "Texto que será enviado para o modelo",
      "saida": {
        "formato": "esperado",
        "da": "resposta"
      }
    }
  ]
}
```

### Passo 3: Execute Seus Testes
```bash
npm run test
```

## 🎯 Exemplos Práticos

### Exemplo 1: Teste Simples
```json
{
  "tests": [
    {
      "name": "Teste de saudação",
      "entrada": "Diga olá em português",
      "saida": {
        "mensagem": "Olá!"
      }
    }
  ]
}
```

### Exemplo 2: Teste com Múltiplos Campos
```json
{
  "tests": [
    {
      "name": "Análise de sentimento",
      "entrada": "Estou muito feliz hoje!",
      "saida": {
        "sentimento": "positivo",
        "confianca": 0.95,
        "palavras_chave": ["feliz", "hoje"]
      }
    }
  ]
}
```

### Exemplo 3: Teste de Lista
```json
{
  "tests": [
    {
      "name": "Extração de cidades",
      "entrada": "Visitei São Paulo e Rio de Janeiro",
      "saida": {
        "cidades": [
          {"nome": "São Paulo", "uf": "SP"},
          {"nome": "Rio de Janeiro", "uf": "RJ"}
        ]
      }
    }
  ]
}
```

## 🛠️ Comandos Disponíveis

### Executar Testes
```bash
# Todos os testes (usa configurações do .env)
npm run test

# Arquivo específico
npm run test:file tests/meu-arquivo.json

# Com tags específicas
npm run test:tags basico,importante

# Sobrescrever configurações temporariamente
PARALLEL_TESTS=1 LOG_LEVEL=debug npm run test
GENERATE_HTML_REPORT=true npm run test
```

### Validar Arquivos
```bash
# Validar sintaxe de um arquivo
npm run validate tests/meu-teste.json

# Validar todos os arquivos
npm run validate
```

### Gerar Novos Testes
```bash
# Criar template de teste
npm run create:test --name="Meus Novos Testes"
```

## 📊 Entendendo os Resultados

### Saída no Console
```
🧪 Executando Teste 1: Teste de saudação
📝 Entrada: "Diga olá em português"
🪙 Tokens: 150 (prompt: 100, completion: 50)
⏱️  Tempo: 1.2s
✅ Teste PASSOU

📊 RESUMO DOS TESTES
✅ Sucessos: 3 (75%)
❌ Falhas: 1 (25%)  
🪙 Total de tokens: 450
⏱️  Tempo total: 4.5s
```

### Relatório JSON
Um arquivo detalhado é salvo em `reports/test-results.json` com:
- Resultados completos de cada teste
- Estatísticas de tokens
- Tempo de execução
- Respostas completas da API

## ⚙️ Configurações

```bash
# Apenas configurações relacionadas à API
API_URL=https://api.openai.com/v1/chat/completions
BEARER_TOKEN=sk-seu-token-aqui

# Performance & Timeout
PARALLEL_TESTS=5          # Quantos testes executar simultâneos
TIMEOUT=30000             # Timeout por requisição (ms)
RETRY_ATTEMPTS=3          # Tentativas em caso de falha
REQUEST_DELAY=500         # Pausa entre requisições (ms)

# Logging & Debug
LOG_LEVEL=info            # debug, info, warn, error
LOG_TOKENS=true           # Mostrar consumo de tokens
VERBOSE_MODE=false        # Logs detalhados

# Relatórios
GENERATE_HTML_REPORT=true # Relatório visual
SAVE_JSON_REPORT=true     # Dados em JSON
REPORTS_DIR=reports       # Pasta dos relatórios
```

### Tags para Organização
Use tags para organizar seus testes:

```json
{
  "tests": [
    {
      "name": "Teste importante",
      "entrada": "...",
      "saida": {...},
      "tags": ["critico", "regressao", "api-v2"]
    }
  ]
}
```

Execute apenas testes com tags específicas:
```bash
npm run test:tags critico,regressao
```

## 🔧 Troubleshooting

### Erro: ".env não encontrado"
1. Crie o arquivo `.env`
2. Adicione pelo menos:
   ```ini
   API_URL=https://api.openai.com/v1/chat/completions
   BEARER_TOKEN=sk-seu-token
   ```

### Erro: "API Token inválido"
1. Verifique se o token em `.env` está correto
2. Confirme se o token não expirou
3. Teste o token em uma ferramenta como Postman

### Configurações não estão funcionando
1. Arquivo `.env` está na raiz do projeto?
2. Variáveis estão no formato: `NOME=valor` (sem espaços)?
3. Reinicie o teste após alterar configurações

### Performance ruim ou timeouts
```bash
# No arquivo .env:
PARALLEL_TESTS=1       # Reduzir paralelismo
TIMEOUT=60000         # Aumentar timeout
REQUEST_DELAY=1000    # Aumentar pausa entre requests
```

### Erro: "JSON inválido no arquivo de teste"
1. Use um validador JSON online para verificar a sintaxe
2. Certifique-se de que todas as vírgulas e chaves estão corretas
3. Execute: `npm run validate tests/seu-arquivo.json`

### Teste sempre falha
1. Verifique se o formato da `saida` corresponde exatamente ao retorno da API
2. Use o modo debug: 
   ```bash
   # No .env:
   LOG_LEVEL=debug
   VERBOSE_MODE=true
   ```
3. Compare o JSON esperado vs obtido no relatório

## 🎓 Dicas para Usuários Não-Técnicos

### 1. Comece Simples
- Copie um exemplo existente
- Mude apenas a `entrada` e `saida`
- Teste com um arquivo por vez

### 2. Use um Editor de Texto Amigável
- **Windows**: Notepad++, VSCode
- **Mac**: TextEdit (modo texto simples), VSCode  
- **Online**: JSON Editor Online

### 3. Valide Sempre
Antes de executar, valide seu arquivo:
```bash
npm run validate tests/meu-arquivo.json
```

### 4. Teste Incrementalmente
- Comece com 1-2 testes
- Vá adicionando gradualmente
- Sempre execute após mudanças

### 5. Use Nomes Descritivos
```json
{
  "name": "Teste extração de email de texto longo",
  "entrada": "Meu email é joao@empresa.com...",
  "saida": {"email": "joao@empresa.com"}
}
```

## 📈 Monitoramento de Custos

O framework monitora automaticamente:
- **Tokens de prompt**: Custo da instrução
- **Tokens de completion**: Custo da resposta  
- **Total de tokens**: Custo total

### Estimativa de Custos (OpenAI GPT-4o-mini)
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

Exemplo: 1000 tokens = ~$0.0015

## 🔒 Segurança

### Proteção de Credenciais
- ❌ Nunca commite tokens no Git
- ✅ Use o arquivo `.env`
- ✅ Configure `.gitignore` adequadamente

### Dados Sensíveis
- ❌ Não inclua dados pessoais nos testes
- ✅ Use dados fictícios ou anonimizados
- ✅ Revise logs antes de compartilhar

## 🤝 Suporte

### Problemas Comuns
Consulte a seção **Troubleshooting** acima.

### Precisa de Ajuda?
1. Verifique os exemplos em `tests/`
2. Execute `npm run validate` para verificar erros
3. Consulte os logs em `reports/`

### Contribuição
1. Fork do projeto
2. Crie sua branch: `git checkout -b minha-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin minha-feature`
5. Abra um Pull Request

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes.

---

**🎉 Pronto! Agora você pode criar testes automatizados para qualquer API de LLM de forma simples e eficiente!**