# 📊 Guia de Auditoria do Sistema - Superusuário

## 🔐 Acessar o Painel de Auditoria

### Credenciais do Superusuário (Padrão):
- **Usuário**: `admin`
- **Senha**: `admin123`

### Como fazer Login:
1. Acesse `http://localhost:5173/superuser` ou `http://localhost:5173/login`
2. Insira as credenciais do superusuário
3. Clique em **"🔐 Acessar Painel"**
4. Será redirecionado para o painel de **Auditoria**

---

## 📋 O que você pode visualizar na Auditoria?

O painel de auditoria mostra **todas as alterações** realizadas no sistema pelos usuários normais:

### Para cada alteração, você verá:

#### 👤 **Quem alterou**
- Nome do usuário que fez a alteração

#### ⏰ **Quando alterou**
- Data e hora exata da alteração (formato: DD/MM/YYYY HH:MM:SS)

#### 📝 **Valor anterior**
- Valores anteriores dos campos alterados (em formato JSON)

#### 📊 **Tipo de alteração**
- ✅ **➕ Criado** - Novo registro foi adicionado
- ✏️ **✏️ Alterado** - Registro foi modificado
- 🗑️ **🗑️ Deletado** - Registro foi removido

---

## 🔍 Filtros Disponíveis

Na página de auditoria, você pode filtrar alterações por:

- **Todas as Alterações** - Mostra tudo
- **Produtos** - Apenas alterações em produtos
- **Matérias-Primas** - Apenas alterações em matérias-primas
- **Relações** - Apenas alterações em relações produto-matéria-prima

---

## 📦 Exemplo de Auditoria

### Alteração: Produto foi modificado

```
Produto: Camiseta Azul
Tipo: Alterado (✏️)
Quem: joao_silva
Quando: 10/02/2026 14:35:22

Valores Alterados:
{
  "name": "Camiseta Azul",
  "price": "89.90"
}
```

---

## 🛠️ Modificar Credenciais do Superusuário

Se desejar alterar a senha ou criar outro superusuário, acesse o shell Django:

```bash
cd Django
python manage.py shell
```

```python
# Criar novo superusuário
from django.contrib.auth.models import User
User.objects.create_superuser('novo_user', 'email@test.com', 'senha_segura')

# Alterar senha
user = User.objects.get(username='admin')
user.set_password('nova_senha')
user.save()

# Sair
exit()
```

---

## 🚀 Como usar com Usuários Normais

### 1. Criar um Usuário Normal
```python
python manage.py shell
from django.contrib.auth.models import User
User.objects.create_user('usuario1', 'user1@test.com', 'senha123')
exit()
```

### 2. Usuário Normal Login
- Acesse `http://localhost:5173/`
- Insira credenciais do usuário normal
- Pode acessar: Produtos, Matérias-Primas, Produção, etc.

### 3. Superusuário Visualiza
- Login como superusuário
- Vai para auditoria
- Vê **quem**, **quando** e **o quê** foi alterado

---

## 📊 Tabela de Histórico Rastreado

| Modelo | Campos Rastreados | Exemplos |
|--------|------------------|----------|
| **Produto** | name, price | Alterou preço de R$ 50 para R$ 80 |
| **Matéria-Prima** | name, stock | Alterou estoque de 100 para 150 unidades |
| **Relação Produto-MP** | quantity | Alterou quantidade de 2 para 5 unidades |

---

## 🔒 Segurança

- ⚠️ **Apenas superusuários** podem acessar o painel de auditoria
- ⚠️ O histórico é **imutável** - não pode ser deletado
- ⚠️ Todas as alterações ficam **registradas com timestamp**
- ⚠️ Usuário responsável é **sempre registrado**

---

## 💡 Dicas Úteis

1. **Verificar alterações recentes**: Olhe o topo da lista de auditoria
2. **Rastrear usuário específico**: Use os filtros para encontrar padrões
3. **Auditar produto específico**: Procure pelo nome na lista
4. **Exportar relatório**: Use as ferramentas do navegador (Print ou Save As)

---

## ❓ Dúvidas?

Se houver dúvidas sobre alterações específicas:
1. Vá para o painel de auditoria
2. Procure o usuário na lista
3. Veja o histórico completo de suas ações

---

**Desenvolvido com ❤️ para segurança e rastreabilidade do sistema**
