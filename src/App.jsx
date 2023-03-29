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
const addColumnRequest = async () => (await fetch ('http://localhost:8000/api/colonne', {method: 'POST'})).json().then(
    response=> {addColumn(response, "Nouvelle colonne")}) //ecrire addColumn(id = response) ft buger, pq ?? 

// Modifier Taches(id_column)
const modifyColumnId = async (data) => (await fetch ('http://localhost:8000/api/tache/reorder', { method: 'PUT', body : data})).json().then(response=> console.log(response))

// Fonctions------------------------------------------------------------------------------------------------------------

// Formatage des data à envoyer dans le body requete POST
const Formater = (data) => {
    const formdata = new FormData()
    Object.keys(data).forEach(_data => formdata.append(_data, data[_data]) )
    return formdata
}

// Listener du bouton ajouter colonne
function addColumnButton(kanban){
  var addColumn = document.getElementById('addColumn');
  addColumn.addEventListener('click', function () {
    //ici metre la requete /api/colonne en "POST" => ATTENTION asynchrone à gérer
    const [ajoutColonne] = createResource(addColumnRequest)
  });
}

// Ajouter une colonne
function addColumn(id, title, item = []){
    kanban.addBoards(
        [{
            'id' : id,
            'title' : title,
            'item' : item
        }]
    )
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

// Charge les taches
function loadItems(response, kanban){
    for(let elt of response){
        kanban.addElement( String(elt[0]) ,{
            'id' : elt[3],
            'title' : elt[1],
            click: function(el){console.log('click')},
            // Executé lors du drop d'une tache
            drop: function(el, target, source) {
                let taskId = el.dataset.eid
                let targetColumnId = target.parentElement.dataset.id
                let sourceColumnId = source.parentElement.dataset.id
                // Pos de l'item
                let posCibleTache = recupPos(target, taskId)

                console.log('taskId=>',taskId, "\n TargetColumnId=>", targetColumnId, "\n sourceColumnId=>", sourceColumnId, "\n posCibleTache=>",posCibleTache) 
                let data = Formater({ targetColumnId : targetColumnId, sourceColumnId : sourceColumnId,taskId : taskId, posCibleTache : posCibleTache })
                const [taskDrop] = createResource(data, modifyColumnId)
            }}, elt[2]

        )
    }
}


function addTask(kanban){
  var addTask = document.getElementById('addTask');
  addTask.addEventListener('click', function () {
      //ici metre la requete /api/tache en "POST" => ATTENTION asynchrone à gérer
      kanban.addElement('_todo',
        { 'title': 'Test' }
      )
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

// MAIN
function App() {

    onMount( ()=>{
        // Création du kanban vide (fonction!)
        kanban = new jKanban({
            element: '#kanban',
            gutter: '15px',
            widthBoard: '250px'
        })

        // Execution de la requête API
        const [listeColonnes] = createResource(columnRequest)

        // Ajout du listener
        addColumnButton(kanban)
    })

    return (
        <>
            <div>Kanban</div>
            <button id="addTask">Ajouter une tache</button>
            <button id="addColumn" >Ajouter une colonne</button>

            <div id="kanban" ></div>
        </>
    );
}

export default App;
