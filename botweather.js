//fix para o node-telegram-bot.api
process.env.NTBA_FIX_319 = 1;

require('dotenv').config()

const http = require('http');
const hostname = '0.0.0.0';
const port = process.env.PORT;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Galo do Tempo cantando tranquilamente... :-)');
});
server.listen(port, hostname, () => {
  console.log(`*** Servidor rodando na porta: ${port} ***`);
});

//início do bot:
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
//const { Map } = require('leaflet');

//tokens salvos na .env
const token = process.env.BOT_TOKEN;
const appID = process.env.WEATHER_TOKEN;
const prevToken = process.env.PREV_TOKEN;


//inicialização do bot
const bot = new TelegramBot(token, {
  polling: true
});

/*
  bot.on('location', (msg) => {
  latitude = msg.location.latitude;
  longitude = msg.location.longitude;
});
*/

//endpoint para consulta das condições em open weather map
const climaEndPoint = (cidade) => (
  `http://api.openweathermap.org/data/2.5/weather?q=${cidade}&units=metric&&appid=${appID}&lang=pt`
);



//aqui o template para a mensagem de retorno com as chaves do meu json name, main, weather, wind e clouds
const template = (name, main, weather, wind, clouds, coord, sys, timezone, dt) => (

  `📍 Local: <b>${name}, ${sys.country}</b>

⛅️ Condição atual: <b>${weather.description}</b>

🌡 Temperatura: <b>${main.temp} °C</b>
🔅 Sensação Térmica: <b>${main.feels_like} °C</b>
❄️ Mínima: <b>${main.temp_min} °C</b>
🔥 Máxima: <b>${main.temp_max} °C</b>

🎈 Pressão: <b>${main.pressure} hPa</b>
💦 Humidade: <b>${main.humidity} %</b>
🌬 Vento: <b>${wind.speed * 3.6} Km/h</b>
☁️ Cobertura de Nuvens: <b>${clouds.all} %</b>

🌎 Coordenadas: 
↕️  Latitude: <b>${coord.lat}</b>
↔️  Longitude: <b>${coord.lon}</b>

🌎 Suas Coordenadas: 
↕️  Latitude: <b>${latitude}</b>
↔️  Longitude: <b>${longitude}</b>

🚦 Última atualização: ${convertDt(dt)}
🕖 Timezone: <b>GMT ${Number(timezone / 60 / 60)}</b> 

<b>Obrigado por consultar o Galo do Tempo 🐓</b>
Para nova consulta use <b>/clima</b> seguido do nome da cidade.
`
);

//conversão de hora UNIX
const convertDt = (dt) => {
  const time = dt
  const horaUnix = (time * 1000)
  const novaHora = new Date(horaUnix)
  const horaOk = novaHora.toLocaleTimeString()
  return horaOk
}

//quando o bot recebe o texto '/start' exibe uma mensagem inicial ao usuário:
bot.onText(/\/start/, (msg) => {
  var loc = msg.chat.location;
  //var longitude = msg.location.longitude;
  const chatId = msg.chat.id;
  const nome = msg.chat.first_name
  bot.sendMessage(
    chatId,
    `Oi, ${nome}! Eu sou o <b>Galo do Tempo</b> 🐓.
     
     ⛅️ Para consultar as condições do clima em uma cidade basta usar o comando: <b>/clima</b> seguido da <b>cidade</b> 
     ➡️ Exemplo: /clima Lisboa 
 
     🗓 Para consultar a previsão para 7 dias em uma cidade basta usar o comando: <b>/prev</b> seguido da <b>cidade</b> 
     ➡️ Exemplo: /prev Porto 
 
     🆘 Se precisar digite <b>/help</b> a qualquer momento. 
     
      Suas coordenadas são ${loc}
      
  `, {
    parse_mode: "HTML"
  }
  );
});

//quando o bot recebe texto que comece com '/clima' ele inicia uma função com msg e match
bot.onText(/\/clima/, (msg, match) => {
 // var latitude = msg.location.latitude;
 // var longitude = msg.location.longitude;
  const chatId = msg.chat.id;
  const nome = msg.chat.first_name
  //tira a expressão /tempo e insere __ no lugar dos espaços.
  let inputMsg = match.input;
  let cidadeBruto = inputMsg.slice(7)
  let removeAcento = RemoveAccents(cidadeBruto);

  //função para remover acentos:
  function RemoveAccents(strAccents) {
    var strAccents = strAccents.split('');
    var strAccentsOut = new Array();
    var strAccentsLen = strAccents.length;
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (var y = 0; y < strAccentsLen; y++) {
      if (accents.indexOf(strAccents[y]) != -1) {
        strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
      } else
        strAccentsOut[y] = strAccents[y];
    }
    strAccentsOut = strAccentsOut.join('');
    return strAccentsOut;
  }

  const regex2 = /(\s)/g
  let cidade = removeAcento.replace(regex2, '%20')
  

  //se não conseguir encontrar a cidade ele retorna um erro e para tudo.
  if (!cidade || cidade === undefined) {
    bot.sendMessage(
      chatId,
      `Não achei essa cidade, ${nome}. Por favor digita /clima seguido da cidade que deseja.`
    );
    return;
  }
  //caso contrário executa a função que busca as condições com o parâmetro de cidade.
  buscaCondicoes(chatId, cidade);
});

//aqui ele vai chamar um get no axios para buscar e receber a previsão em 
//json. Eu usarei name, main, weather, wind, clouds, coord, sys, timezone e 
//dt.
const buscaCondicoes = (chatId, cidade) => {
  const endpoint = climaEndPoint(cidade);
  axios.get(endpoint).then((resp) => {
    const {
      name,
      main,
      weather,
      wind,
      clouds,
      coord,
      sys,
      timezone,
      dt
    } = resp.data;
    const re = resp.data

    //se tiver sucesso na busca ele vai retornar uma mensagem no nosso chat 
    //com nosso template contendo as informações que buscamos no json;
    bot.sendMessage(
      chatId,
      template(name, main, weather[0], wind, clouds, coord, sys, timezone, dt),
      {
        parse_mode: "HTML"
      }
    );
    return re
    //se der erro ele vai dizer que não conseguiu encontrar a cidade.  
  }, error => {
    //console.log("error", error);
    bot.sendMessage(chatId, `Bah, não consegui encontrar essa cidade. Tenta mais uma vez usando o comando /clima seguido do nome da cidade que tu deseja.`,
      {
        parse_mode: "HTML"
      }
    );
  }
  );
}


//PREVISÃO

//quando o bot recebe texto que comece com '/prev' ele inicia uma função com msg e match
bot.onText(/\/prev/, (msg, match) => {
  const chatId = msg.chat.id;

  //tira a expressão /prev e insere %20 no lugar dos espaços.
  const cidadeBruto = match.input.slice(6)
  const regex2 = /(\s)/g
  const cidade = cidadeBruto.replace(regex2, '%20')

  //se não for informada ou se não conseguir encontrar a cidade ele retorna um erro e para tudo.
  if (!cidade || cidade === undefined) {
    bot.sendMessage(
      chatId,
      `Bah, não consegui encontrar essa cidade. Tenta mais uma vez usando o comando /prev seguido do nome da cidade que tu deseja.`
    );
    return;
  }
  //caso contrário executa a função que busca as condições com o parâmetro de cidade.
  buscaCoord(chatId, cidade);
});

//a previsão é feita com base em coordenadas e não no nome da cidade, então tenho que
//buscar a cidade e extrair as coordenadas para depois buscar a previsão:
const buscaCoord = (chatId, cidade) => {
  const endpoint = climaEndPoint(cidade);
  axios.get(endpoint).then((resp) => {
    const {
      name,
      coord
    } = resp.data;
    const lat = coord.lat;
    const lon = coord.lon;
    const cidadeFormatada = name

    //com os dados de cidade, latitude e longitude chamo a função que buscará a previsão.
    buscaPrev(chatId, lat, lon, cidadeFormatada)
  }, error => {
    console.log("error", error);
  });
}

//este é o endpoint onde insiro lat, lon e api key.
const prevEndPoint = (lat, lon) => (
  `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&lang=pt&appid=${prevToken}`
);

//aqui criei um template para a a previsão de 7 dias.
const templatePrev = (day0, diaPT0, day1, diaPT1, day2, diaPT2, day3, diaPT3, day4, diaPT4, day5, diaPT5, day6, diaPT6, cidadeFormatada) => (

  `📍 A previsão para os próximos dias em <b>${cidadeFormatada}</b> é:

🗓 Hoje, dia ${diaPT0}: <b>${day0.weather[0].description}</b>
❄️ Mínima: <b>${day0.temp.min} °C</b>
🔥 Máxima: <b>${day0.temp.max} °C</b>

🗓 Amanhã, dia ${diaPT1}:: <b>${day1.weather[0].description}</b>
❄️ Mínima: <b>${day1.temp.min} °C</b>
🔥 Máxima: <b>${day1.temp.max} °C</b>

🗓 Dia ${diaPT2}: <b>${day2.weather[0].description}</b>
❄️ Mínima: <b>${day2.temp.min} °C</b>
🔥 Máxima: <b>${day2.temp.max} °C</b>

🗓 Dia ${diaPT3}: <b>${day3.weather[0].description}</b>
❄️ Mínima: <b>${day3.temp.min} °C</b>
🔥 Máxima: <b>${day3.temp.max} °C</b>

🗓 Dia ${diaPT4}: <b>${day4.weather[0].description}</b>
❄️ Mínima: <b>${day4.temp.min} °C</b>
🔥 Máxima: <b>${day4.temp.max} °C</b>

🗓 Dia ${diaPT5}: <b>${day5.weather[0].description}</b>
❄️ Mínima: <b>${day5.temp.min} °C</b>
🔥 Máxima: <b>${day5.temp.max} °C</b>

🗓 Dia ${diaPT6}: <b>${day6.weather[0].description}</b>
❄️ Mínima: <b>${day6.temp.min} °C</b>
🔥 Máxima: <b>${day6.temp.max} °C</b>

Obrigado por usar o <b>Galo do Tempo</b> 🐓.
Para consultar as condições atuais use <b>/clima</b> e a cidade desejada.
Para consultar a previsão para 7 dias use <b>/clima</b> e a cidade desejada.
`
);



//aqui faço a consulta e recebo um json com a previsão.
const buscaPrev = (chatId, lat, lon, cidadeFormatada) => {
  console.log(cidadeFormatada)
  const endpointPrev = prevEndPoint(lat, lon);
  axios.get(endpointPrev).then((resp) => {

    //atribuo os dados do json à uma constante e trabalho os dados para cada dia.
    const { daily } = resp.data;

    //dia 1
    const day0 = daily[0]
    const diaUnix0 = day0.dt
    const diaUnixOk0 = (diaUnix0 * 1000)
    const dia0 = new Date(diaUnixOk0)
    const diaPT0 = dia0.getDate()

    //dia 2
    const day1 = daily[1]
    const diaUnix1 = day1.dt
    const diaUnixOk1 = (diaUnix1 * 1000)
    const dia1 = new Date(diaUnixOk1)
    const diaPT1 = dia1.getDate()

    //dia 3
    const day2 = daily[2]
    const diaUnix2 = day2.dt
    const diaUnixOk2 = (diaUnix2 * 1000)
    const dia2 = new Date(diaUnixOk2)
    const diaPT2 = dia2.getDate()

    //dia 4
    const day3 = daily[3]
    const diaUnix3 = day3.dt
    const diaUnixOk3 = (diaUnix3 * 1000)
    const dia3 = new Date(diaUnixOk3)
    const diaPT3 = dia3.getDate()

    //dia 5
    const day4 = daily[4]
    const diaUnix4 = day4.dt
    const diaUnixOk4 = (diaUnix4 * 1000)
    const dia4 = new Date(diaUnixOk4)
    const diaPT4 = dia4.getDate()

    //dia 6
    const day5 = daily[5]
    const diaUnix5 = day5.dt
    const diaUnixOk5 = (diaUnix5 * 1000)
    const dia5 = new Date(diaUnixOk5)
    const diaPT5 = dia5.getDate()

    //dia 7
    const day6 = daily[6]
    const diaUnix6 = day6.dt
    const diaUnixOk6 = (diaUnix6 * 1000)
    const dia6 = new Date(diaUnixOk6)
    const diaPT6 = dia6.getDate()

    //aqui, com os dados organizados, o bot envia uma mensagem usando o template que criei.
    bot.sendMessage(chatId, templatePrev(day0, diaPT0, day1, diaPT1, day2, diaPT2, day3, diaPT3, day4, diaPT4, day5, diaPT5, day6, diaPT6, cidadeFormatada), { parse_mode: "HTML" });

  }, error => {
    console.log("error", error);
  });
}

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `🆘 Ajuda do <b>Galo do Tempo</b> 🐓:

    ⛅️ Para consultar as condições do clima em uma cidade basta usar o comando: <b>/clima</b> seguido da <b>cidade</b> 
    ➡️ Exemplo: /clima Lisboa 

    🗓 Para consultar a previsão para 7 dias em uma cidade basta usar o comando: <b>/prev</b> seguido da <b>cidade</b> 
    ➡️ Exemplo: /prev Porto 

    🆘 Se precisar digite <b>/help</b> a qualquer momento. 
      
  `, {
    parse_mode: "HTML"
  }
  );
});


/* bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const nome = msg.from.language_code

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, `Oi, ${msg}`);
  
});
 */

bot.onText(/\/st/, (msg) => {


  bot.sendMessage(msg.chat.id, "Welcome", {
    "reply_markup": {
      "keyboard": [["/start", "/clima"], ["Keyboard"], ["location"]]
    }
  });
  


});


