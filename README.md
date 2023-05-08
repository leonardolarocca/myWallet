# 💳 MyWallet

![GitHub](https://img.shields.io/github/license/leonardolarocca/myWallet)

Este é um projeto que implementa uma API de carteira multi crédito, onde um usuário com sua carteira pode realizar compras, gerenciar os limites da sua carteira, adicionar, remover cartões e realizar pagamentos destes cartões.

O gerenciamento dos cartões é feito de maneira automática pela carteira, selecionando sempre o cartão com data de vencimento mais distante, caso a data de vencimento seja no mesmo dia a carteira escolherá o cartão com menor limite disponível.

## Documentação da api

[Enviroment](docs/myWallet-dev.postman_environment.json) e [Collection](/docs/myWallet.postman_collection.json) do postman.

## Este projeto requer

* Java Runtime Engine (JRE) versão 6.x ou superior.

## Instalação

`npm install && sls dynamodb install`

## Uso

Para iniciar o projeto localmente execute: `npm run start-local`

## Testes unitários

Para executar os testes unitários: `npm run test`

## Deploy

Para executar o deploy: `npm run deploy-<stage>`

## Desenvolvimento

* Serverless Framework
* Typescript
* Middy
* DynamoDb
* Eslint
* Vitest
