# 🔒 Guia de Segurança

## Proteção de Credenciais

### ⚠️ NUNCA comite credenciais no Git

Este projeto usa arquivos de configuração que podem conter informações sensíveis. Siga estas práticas:

## 🛡️ Configuração Segura

### 1. Arquivos Protegidos pelo .gitignore
- `config/api.conf` - Contém suas chaves de API
- `.env` - Variáveis de ambiente
- `reports/` - Pode conter dados sensíveis dos testes

### 2. Configuração Inicial
```bash
# Use o script de setup para configuração segura
npm run setup
```

### 3. Uso de Variáveis de Ambiente (Recomendado)
```bash
# Defina variáveis de ambiente ao invés de arquivos
export BEARER_TOKEN="sk-seu-token-openai-aqui"
export API_URL="https://api.openai.com/v1/chat/completions"

# Execute os testes
npm run test
```

### 4. Arquivo .env (Alternativa)
```bash
# Crie um arquivo .env (já está no .gitignore)
echo "BEARER_TOKEN=sk-seu-token-aqui" > .env
echo "LOG_LEVEL=info" >> .env
```

## 🚫 O que NÃO fazer

❌ **NUNCA** faça isso:
```bash
git add config/api.conf
git commit -m "Adicionando configuração" # ← Vai expor sua API key!
```

❌ **NUNCA** commite arquivos contendo:
- Tokens de API (`sk-...`)
- Senhas
- URLs de APIs privadas
- Qualquer credencial

## ✅ Boas Práticas

### Em Desenvolvimento
1. Use o arquivo `config/api.conf` localmente (já está no .gitignore)
2. Ou use variáveis de ambiente
3. Nunca commite credenciais reais

### Em Produção/CI
1. **SEMPRE** use variáveis de ambiente
2. Configure secrets no seu sistema de CI/CD
3. Use ferramentas de gerenciamento de secrets (Azure Key Vault, AWS Secrets Manager, etc.)

### Exemplo para CI/CD
```yaml
# GitHub Actions example
env:
  BEARER_TOKEN: ${{ secrets.OPENAI_API_KEY }}
  API_URL: ${{ secrets.API_URL }}

- name: Run Tests
  run: npm run test
```

## 🔍 Verificação de Segurança

### Antes de Commitar
```bash
# Verifique se não há credenciais nos arquivos
git diff --cached | grep -i "sk-\|bearer\|token\|password"

# Se retornar algo, NÃO commite!
```

### Verificação de .gitignore
```bash
# Verifique se os arquivos sensíveis estão sendo ignorados
git status --ignored
```

## 🆘 Se Você Commitou uma Credencial por Engano

1. **Ação Imediata**:
   - Rogue/regenere a API key imediatamente
   - Notifique sua equipe

2. **Limpeza do Repositório**:
   ```bash
   # Remove do histórico (CUIDADO: reescreve o histórico)
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch config/api.conf' --prune-empty --tag-name-filter cat -- --all
   
   # Force push (coordene com a equipe)
   git push origin --force --all
   ```

3. **Alternativa mais Segura**:
   - Considere criar um novo repositório
   - Migre apenas os arquivos necessários (sem histórico)

## 📞 Contato

Se você descobrir uma vulnerabilidade de segurança, reporte imediatamente para a equipe de desenvolvimento.

---

**Lembre-se: Segurança é responsabilidade de todos! 🛡️**
