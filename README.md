# Galo do Tempo - bot para previsão do tempo no Telegram
> Bot rodando em nodeJS capaz de prover as condições atuais e também previsão para sete dias em uma cidade.
Usei a api do <a href="https://github.com/yagop/node-telegram-bot-api#nodejs-telegram-bot-api">node-telegram-bot</a> para consumir dados de <a href="https://openweathermap.org/api">openweathermap.com</a>. 

<hr/>

<img src="https://tomipasin.com/galo/galo1.png" style="width: 680px"/>

<hr/>

## Como usar?

Muito simples: no telegram busque por @galodotempoptbot e siga as instruções.


## Como testar?

É necessaŕio criar os tokens para utlizar no Bot e os inserir em um arquivo .env:

<img src="https://tomipasin.com/galo/1.png"/>

O primeiro é criado no próprio Telegram por meio do @botfather.
Os outros dois são criados no <a href="https://openweathermap.org/api">openweathermap.com</a>.

Vamos usar duas dependências, que serão instalados por npm:
<img src="https://tomipasin.com/galo/2.png"/>

Basta executar:

```sh
npm install
```
Para inicializar o bot vamos rodar este código que também vai determinar a URL para consulta das condições atuais:

<img src="https://tomipasin.com/galo/3.png"/>

Criei um template para as mensagens de retorno: 

<img src="https://tomipasin.com/galo/4.png"/>

Data e hora são informadas no padrão UNIX então temos um código para coverter a hora que será exibida em "Última atualização":

<img src="https://tomipasin.com/galo/5.png"/>

Quando o Bot recebe o comando /start na inicialização ele retorna instruções ao usuário:

<img src="https://tomipasin.com/galo/6.png"/>

Ao receber o comando /clima seguido de um nome de cidade o processo é iniciado para (1) formatar o nome da cidade para pesquisa, (2) verificar se foi informado um nome de cidade e se não foi mostrar uma mensagem de instrução e (3) chamar a função que fará a busca.

<img src="https://tomipasin.com/galo/7.png"/>





## Meta

Tomi Pasin – [@tomipasin](https://twitter.com/tomipasin) – tomipasin@gmail.com

## Imagens:
<img src="https://tomipasin.com/galo/galo2.png" />
<hr/>
<img src="https://tomipasin.com/galo/galo3.png" />
