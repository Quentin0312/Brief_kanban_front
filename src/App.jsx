import { onMount, createResource, createEffect } from "solid-js";

// Variable globale contenant le kanban
var kanban

// Requêtes API
const columnRequest = async () => (await fetch('http://localhost:8000/api/colonne/', {method: 'GET'})).json().then(
    response => {loadBoards(response, kanban)})

const taskRequest = async () => (await fetch ('http://localhost:8000/api/tache/', {method: 'GET'})).json().then(
    response=> {loadItems(response, kanban)})

const addColumnRequest = async () => (await fetch ('http://localhost:8000/api/colonne', {method: 'POST'})).json().then(
    response=> {addColumn(response, "Nouvelle colonne")}) //ecrire addColumn(id = response) ft buger, pq ?? 

// Fonctions
function addColumnButton(kanban){
  var addColumn = document.getElementById('addColumn');
  addColumn.addEventListener('click', function () {
    //ici metre la requete /api/colonne en "POST" => ATTENTION asynchrone à gérer
    const [ajoutColonne] = createResource(addColumnRequest)
  });
}

function addColumn(id, title, item = []){
    kanban.addBoards(
        [{
            'id' : id,
            'title' : title,
            'item' : item
        }]
    )
}


function otherAddColumn(id, titre){
    kanban.addBoards(
        [{
            'id' : String(id),
            'title' : titre,
            'item' : [{ 'title' : 'Tache 1'}]
        }]
    )
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

function OLDloadKanban(){
    const [listeColonnes] = createResource(columnRequest)
    console.log("laa",listeColonnes())
}

function oldloadKanban(response){
    var listeColumn = []
    for (let elt of response){
        listeColumn.push({
            'id' : elt[0],
            'title' : elt[1],
            'item' : [{ 'title' : '<span class="font-weight-bold">Item static de test</span>' }]
        })
    }
    var kanban = new jKanban({
        element : '#kanban',
        gutter : '15px',
        widthBoard : '250px',
        boards : listeColumn
    })
}

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

function loadItems(response, kanban){
    for(let elt of response){
        kanban.addElement(String(elt[0]),
            { 'title' : elt[1] }, elt[2]

        )
    }
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
        addColumnButton(kanban)
        // var kanban = loadKanban()
        // addColumn(kanban) // Ajoute le listener ou onClick ?
        // addTask(kanban) // Ajoute le listener
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
