const fs = require('fs');
const simpleGit = require("simple-git");

const { openBrowser, goto, write, click, waitFor, highlight, $, closeBrowser } = require('taiko');

function sortByNomeAtleta(a, b) {
    if (a.nome < b.nome) {
        return -1;
    }
    if (a.nome > b.nome) {
        return 1;
    }
    return 0;
}


function createIndex(atletiMaschi, atletiFemmine) {
    const template = fs.readFileSync('./index_template.html', 'utf8');

    const stringAtletiMaschi = JSON.stringify(atletiMaschi)
    let content = template.replace(/#ALTETI_MASCHI/g, stringAtletiMaschi);

    const stringAtletiFemmine = JSON.stringify(atletiFemmine)
    content = content.replace(/#ALTETI_FEMMINE/g, stringAtletiFemmine);

    fs.writeFileSync('./index.html', content, { encoding: 'utf8', flag: 'w' })

}

async function publish() {
    const git = simpleGit.default();
    await git.add('./index.html');
    await git.commit('aggiornamento classifica del ' + (new Date()).toDateString());
    await git.push();
}

async function readClassifica(atleti) {

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
        atleti[i].variazione = '=';
        for (let j = 2; j < 7; j++) {
            try {
                await highlight(tableCell({ row: j, col: 2 }, below('Storico posizioni nella classifica individuale')));
                let storico = await tableCell({ row: j, col: 2 }, below('Storico posizioni nella classifica individuale')).text()
                atleti[i].storico.push(storico)
            }
            catch {
                break;
            }
        }

        try{
                if (atleti[i].storico[0] > atleti[i].storico[1]){
                    atleti[i].variazione = '+';
                }
                if (atleti[i].storico[0] < atleti[i].storico[1]){
                    atleti[i].variazione = '-';
                }
        }
        catch {
          
        }
    }

    return atleti;
}


(async () => {


    let atleti = [];
    atleti.push(
        {
            nome: 'GIULIONI CRISTIANO',
            dataNascita: '03/08/1983',
            sex: 'M'
        },
        {
            nome: 'SCHIAROLI ALESSANDRO',
            dataNascita: '16/09/1969',
            sex: 'M'
        },
        {
            nome: 'PAUCCHI FABIO',
            dataNascita: '20/02/1965',
            sex: 'M'
        },
        {
            nome: 'PAUCCHI MARTINA',
            dataNascita: '29/08/1999',
            sex: 'F'
        },
        {
            nome: 'CONTI ANGELA',
            dataNascita: '14/10/1963',
            sex: 'F'
        }
    )

    maschi = atleti.filter(x => x.sex === 'M');
    femmine = atleti.filter(x => x.sex === 'F');

    await openBrowser();
    classificaMaschi = await readClassifica(maschi);
    classifcaFemmine = await readClassifica(femmine);
    await closeBrowser();

    classificaMaschi.sort(sortByNomeAtleta);
    classifcaFemmine.sort(sortByNomeAtleta);


    await createIndex(classificaMaschi, classifcaFemmine);



    await publish();
})();