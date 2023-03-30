import { onMount, createResource, createEffect } from "solid-js";

// Variable globale contenant le kanban
var kanban

// Requêtes API---------------------------------------------------------------------------------------------------------

// Récup liste des colonnes
const columnRequest = async () => (await fetch('http://localhost:8000/api/colonne/', {method: 'GET'})).json().then(
    response => {loadBoards(response, kanban)})

// Récup liste des taches
const taskRequest = async () => (await fetch ('http://localhost:8000/api/tache/', {method: 'GET'})).json().then(
    response=> {loadItems(response, kanban)})

// Ajout nouvelle colonne
const addColumnRequest = async (data) => (await fetch ('http://localhost:8000/api/colonne', {method: 'POST', body : data})).json().then(
    response=> {addColumn(response, "Nouvelle colonne")}) //ecrire addColumn(id = response) ft buger, pq ?? 

// Modifier Taches(id_column)
const modify_id_colonne = async (data) => (await fetch ('http://localhost:8000/api/tache/reorder', { method: 'PUT', body : data})).json().then(response=> console.log(response))

// Reorder column
const reorderColumn = async (data) => (await fetch ('http://localhost:8000/api/colonne/reorder', { method: 'PUT', body : data})).json().then(response=> console.log(response))

// Modifier titre de colonne
const modify_titre_colonne = async (data) => (await fetch ('http://localhost:8000/api/colonne/'+data["idColonne"], { method : 'PUT', body : data['data']})).json().then(response=>console.log('then modif titre col'+response))

// Ajouter une tache
const ajouterTache = async (data) => (await fetch ('http://localhost:8000/api/tache', {method : "POST", body : data})).json().then(response=> ajouterTacheApresRequete(response))

// Modifier titre tache
const modify_titre_tache = async (data) => (await fetch ('http://localhost:8000/api/tache/'+ data['id'], { method : "PUT", body : data['data'] })).json().then(
    response => console.log(response))


// Fonctions------------------------------------------------------------------------------------------------------------

// Formatage des data à envoyer dans le body requete POST
const Formater = (data) => {
    const formdata = new FormData()
    Object.keys(data).forEach(_data => formdata.append(_data, data[_data]) )
    return formdata
}

// Modif titre tache

function modifyTaskTitle (el, e){
    // console.log(el.dataset.eid, "\n", e);

    // Datas
    let newTitle = prompt("Entrer le nouveau titre de la tache")
    console.log("newTitle=>",newTitle)

    let idTache = el.dataset.eid
    let mydata = Formater({ newTitle : newTitle })
    let dicoDatas = {"data" : mydata, "id" : idTache}

    // Requete
    const [modifTitreTache] = createResource(dicoDatas, modify_titre_tache)

    // Modif du titre dans le HTML
    e.target.innerText = newTitle

}

function ajouterTacheApresRequete(response){
    let titre = response['titreTache']
    let id = response['derId']
    console.log('id=>', id)


    kanban.addElement(response['idColonne'],{
        'title': titre, 
        'id' : id,
        context: function(el, e){
            modifyTaskTitle(el, e);
        },

        drop: function(el, target, source) {
            let taskId = el.dataset.eid
            let targetColumnId = target.parentElement.dataset.id
            let sourceColumnId = source.parentElement.dataset.id

            // Pos de l'item
            let posCibleTache = recupPos(target, taskId)

            console.log('taskId=>',taskId, "\n TargetColumnId=>", targetColumnId, "\n sourceColumnId=>", sourceColumnId, "\n posCibleTache=>",posCibleTache)
            let data = Formater({ targetColumnId : targetColumnId,sourceColumnId : sourceColumnId, taskId : taskId, posCibleTache : posCibleTache })

            const [taskDrop] = createResource(data, modify_id_colonne)
        }}, response['pos']
    )
}

// Listener du bouton ajouter colonne
function addColumnButton(kanban){
  var addColumn = document.getElementById('addColumn');

  addColumn.addEventListener('click', function () {
    let nbColonne = document.getElementsByClassName("kanban-container")[0].childElementCount
    let data = Formater({ titreColonne : "Nouvelle colonne", pos : nbColonne + 1}) // pos: pos
    const [ajoutColonne] = createResource(data, addColumnRequest)
  });
}

// Ajouter une colonne
function addColumn(id, title, item = []){
    kanban.addBoards(
        [{
            'id' : String(id),
            'title' : title,
            'item' : item
        }]
    )
    modifyColumnTitle() // pas propre car recreer tout les listener au lieu de rajouter le nouveau 
}

// Charge les colonnes
function loadBoards(response, kanban){
    for(let elt of response){
        kanban.addBoards(
            [{
                'id' : String(elt[0]),
                'title' : elt[1]
            }]
        )
    }
    const [listeTaches] = createResource(taskRequest)

}

// Récupérer la pos d'une tache
function recupPos(target, taskId){
    console.log("target=>",target)
    var i = -1
    while(true){
        i+=1
        if (target.parentNode.children[1].children[i].dataset.eid == taskId){
            break
        }
        else{continue}
        
    }
    return i+1
}

// Récuperer la pos d'une colonne
// function recupPosColonne(el){
//     let nbColonne = document.getElementsByClassName("kanban-container")[0].childElementCount
//     let posColonne
//     for(let i = 1 ; i <= nbColonne ; i+= 1){
//         if (i == el.dataset.id){
//             posColonne = i
//             console.log('yabidou')
//             break
//         }
//     }
//     return posColonne
// }

// Charge les taches
function loadItems(response, kanban){
    for(let elt of response){
        kanban.addElement( String(elt[0]) ,{
            'id' : elt[3],
            'title' : elt[1],
            context: function(el, e){
                modifyTaskTitle(el, e)
            },
            // Executé lors du drop d'une tache
            // En faire une seule fonction car réutilisé !
            drop: function(el, target, source) {
                let taskId = el.dataset.eid
                let targetColumnId = target.parentElement.dataset.id
                let sourceColumnId = source.parentElement.dataset.id
                // Pos de l'item
                let posCibleTache = recupPos(target, taskId)

                console.log('taskId=>',taskId, "\n TargetColumnId=>", targetColumnId, "\n sourceColumnId=>", sourceColumnId, "\n posCibleTache=>",posCibleTache) 
                let data = Formater({ targetColumnId : targetColumnId, sourceColumnId : sourceColumnId,taskId : taskId, posCibleTache : posCibleTache })
                const [taskDrop] = createResource(data, modify_id_colonne)
            }}, elt[2]

        )
    }
    modifyColumnTitle()
}

function addTask(kanban){
    var addTask = document.getElementById('addTask');
    addTask.addEventListener('click', function () {
        // Récup de l'id de la colonne en pos1
        let idColonne = document.getElementsByClassName('kanban-container')[0].children[0].dataset.id

        // Récup du dernier id taches présent ATTENTION si fclté supprimer tache ajouté, id doit être récup de la BDD
        let test = document.getElementsByClassName('kanban-item')
        let lastId = 0;
        for (let i = 0; i < test.length; i +=1){
            console.log(test.item(i).dataset.eid)
            let actualId = test.item(i).dataset.eid
            if ( actualId > lastId ){
                lastId = actualId
            }
        }
        lastId = Number(lastId)
        // Requete API
        let pos = document.getElementsByClassName('kanban-container')[0].children[0].children[1].children.length + 1
        // console.log('yolo', document.getElementsByClassName('kanban-container')[0].children[0].children[1].children.length)
        let data = Formater({ titreTache : 'Nouvelle tache', idColonne : idColonne, pos : pos })
        const [ajouter_tache] = createResource(data, ajouterTache)
    })
}

function OLDOLDloadKanban(){
  // valeur de board doit être crées selon données récup des requêtes /api/colonne en "GET"
  // et /api/tache/<column_id> en "GET"
  const [listeColonnes] = createResource(columnRequest)
  var kanban = new jKanban({
    element: '#kanban',
    gutter: '15px',
    widthBoard: '250px',
    boards: [{
            'id': '_todo',
            'title': 'TODO',
            'item': [{
                    'title': '<span class="font-weight-bold">You can too</span>'
                },
                {
                    'title': '<span class="font-weight-bold">Buy Chocolate</span>'
                }
            ]
        }, {
            'id': '_inprocess',
            'title': 'In Process',
            'item': [{
                    'title': '<span class="font-weight-bold">You can drag me too</span>'
                },
                {
                    'title': '<span class="font-weight-bold">Buy Milk</span>'
                }
            ]
        }, {
            'id': '_working',
            'title': 'Working',
            'item': [{
                    'title': '<span class="font-weight-bold">Do Something!</span>'
                },
                {
                    'title': '<span class="font-weight-bold">Run?</span>'
                }
            ]
        }, {
            'id': '_done',
            'title': 'Done',
            'item': [{
                    'title': '<span class="font-weight-bold">All right</span>'
                },
                {
                    'title': '<span class="font-weight-bold">Ok!</span>'
                }
            ]
        }
    ]//,
    // itemAddOptions: {
    //     enabled : true,
    //     content : 'add',
    //     class : 'kanban-title-button btn btn-default btn-xs',
    //     footer : false
    // }
    // => Problème : présent sur toutes les colonnes alors que je veu_ que sur TODO
  });
  return kanban
}

function modifyColumnTitle(){
    let clickOnModify = document.getElementsByClassName('kanban-title-button btn btn-default btn-xs')
    let nbTotalBtn = clickOnModify.length
    for (let i = 0 ; i <= nbTotalBtn - 1 ; i+=1){
        clickOnModify.item(i).addEventListener('click', function (e) {
            let idColonne = e.target.parentElement.parentElement.dataset.id;
            let newTitle = prompt("Entrer le nouveau titre de colonne");
            if (newTitle != ""){
                console.log("id de la colonne=> ",idColonne);
                console.log("nouveau titre=>", newTitle);
    
                // Requete pour modif le titre dans la BDD
                let data = Formater({ newTitle : newTitle })
                let dicoDatas = { "idColonne" : idColonne, "data" : data}
                const [modifyTitle] = createResource(dicoDatas, modify_titre_colonne)
                // Modif du titre dans le HTML
                e.target.parentElement.children[0].innerText = newTitle
            }
        })
    }
    // console.log("la=>",clickOnModify.item(1))
}

// MAIN
function App() {

    onMount( ()=>{
        // Création du kanban vide (fonction!)
        kanban = new jKanban({
            element: '#kanban',
            gutter: '15px',
            widthBoard: '250px',
            itemAddOptions : {
                enabled: true,
                content: 'modifier'
            },
            dragendBoard : function (el) {
                let idColonne = el.dataset.id
                let posColonne = el.dataset.order
                let datas = Formater({ idColonne : idColonne, nvlePos : posColonne })
                const [changeColPos] = createResource(datas, reorderColumn)
            }
        })

        // Execution de la requête API
        const [listeColonnes] = createResource(columnRequest)

        // Ajout des listeners
        addColumnButton(kanban)

        addTask(kanban)

       
    })

    return (
        <>
            {/* <div class="bg-[#7D6ADE] h-[110px] flex justify-center grid content-center">
                <div class="text-center text-5xl text-white flex"> Kanban </div>
            </div> */}
            <div class="navbar bg-base-100 bg-[#7D6ADE] w-96">
                <a class="btn btn-ghost normal-case text-xl glass text-neutral-focus">Kanban</a>
            </div>
            <button class="btn btn-sm glass bg-[#7D6ADE] text-neutral-focus m-5"  id="addTask">Ajouter une tache</button>
            <button class="btn btn-sm glass bg-[#7D6ADE] text-neutral-focus" id="addColumn" >Ajouter une colonne</button>

            <div id="kanban" ></div>
        </>
    );
}

export default App;