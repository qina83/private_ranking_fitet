
const { openBrowser, goto, write, click, waitFor, highlight, $, closeBrowser } = require('taiko');

function sortByNomeAtleta( a, b ) {
    if ( a.nome < b.nome ){
      return -1;
    }
    if ( a.nome > b.nome ){
      return 1;
    }
    return 0;
  }
  



(async () => {
    await openBrowser();


    const atleti = [];
    atleti.push(
        {
            nome: 'GIULIONI CRISTIANO',
            dataNascita: '03/08/1983'
        },
        {
            nome: 'SCHIAROLI ALESSANDRO',
            dataNascita: '16/09/1969'
        },
        {
            nome: 'PAUCCHI FABIO',
            dataNascita: '20/02/1965'
        },
        {
            nome: 'PAUCCHI MARTINA',
            dataNascita: '29/08/1999'
        }
        )

    const idAtletaInputId = '#topic_title';

    for (let i = 0; i < atleti.length; i++) {
        const atleta = atleti[i];
        await goto("https://portale.fitet.org/");
        await write(atleta.nome, $(idAtletaInputId));
        await waitFor(500);
        await click(atleta.nome + ' (' + atleta.dataNascita + ')');
        await waitFor(2000);

        atleti[i].posizione = await $('.badge').text();      
        
        await click('classifica al');
        await waitFor(1000);
        await click('Storico classifica');
        await waitFor(1000);

        atleti[i].storico = [];
        for(let j = 2; j<7; j++){
            try{
                await highlight(tableCell({row:j, col:2}, below('Storico posizioni nella classifica individuale')));
                let storico = await tableCell({row:j, col:2}, below('Storico posizioni nella classifica individuale')).text()
                atleti[i].storico.push(storico)
            }
            catch{
                break;
            }
        }
    }


    console.log(atleti.sort(sortByNomeAtleta));


    await closeBrowser();
})();