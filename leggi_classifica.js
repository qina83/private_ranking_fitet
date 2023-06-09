const fs = require('fs');
const simpleGit = require("simple-git");
const atleti = require("./atleti.json");

const { openBrowser, goto, write, click, waitFor, highlight, $, closeBrowser } = require('taiko');

function sortAtleti(a, b) {
    if (a.posizione < b.posizione) {
        return -1;
    }
    if (a.posizione > b.posizione) {
        return 1;
    }
    return 0;
}


function createIndex(atletiMaschi, atletiFemmine) {
    const template = fs.readFileSync('./index_template.html', 'utf8');

    const stringAtletiMaschi = JSON.stringify(atletiMaschi)
    let content = template.replace(/#ATLETI_MASCHI/g, stringAtletiMaschi);

    const stringAtletiFemmine = JSON.stringify(atletiFemmine)
    content = content.replace(/#ATLETI_FEMMINE/g, stringAtletiFemmine);

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

        atleti[i].posizione = parseInt(await $('.badge').text());

        await click('classifica al');
        await waitFor(1000);
        await click('Storico classifica');
        await waitFor(1000);

        atleti[i].storico = [];
        atleti[i].variazione = '=';
        for (let j = 2; j < 12; j++) {
            try {
                //await highlight(tableCell({ row: j, col: 2 }, below('Storico posizioni nella classifica individuale')));
                let storico = await tableCell({ row: j, col: 2 }, below('Storico posizioni nella classifica individuale')).text()
                atleti[i].storico.unshift(parseInt(storico))
            }
            catch {
                break;
            }
        }

        try{
                const storico = atleti[i].storico;

                if (storico[storico.length-2] > storico[storico.length-1]){
                    atleti[i].variazione = '+';
                }
                if (storico[storico.length-2] < storico[storico.length-1]){
                    atleti[i].variazione = '-';
                }
        }
        catch {
          
        }
    }

    return atleti;
}


(async () => {

    maschi = atleti.filter(x => x.sex === 'M');
    femmine = atleti.filter(x => x.sex === 'F');

    await openBrowser();
    classificaMaschi = await readClassifica(maschi);
    classifcaFemmine = await readClassifica(femmine);
    await closeBrowser();

    classificaMaschi.sort(sortAtleti);
    classifcaFemmine.sort(sortAtleti);

    await createIndex(classificaMaschi, classifcaFemmine);


    await publish();
})();