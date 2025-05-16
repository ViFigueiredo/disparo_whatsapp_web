# Build stage
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Instalar dependências
RUN yarn install

# Copiar o resto dos arquivos do projeto
COPY . .

# Construir a aplicação
RUN yarn build

# Instalar serve para servir os arquivos estáticos
RUN yarn global add serve

# Expor a porta 3000
EXPOSE 3000

# Comando para servir os arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"] 