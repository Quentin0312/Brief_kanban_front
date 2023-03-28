import { onMount, createResource } from "solid-js";

const columnRequest = async () => (await fetch('http://localhost:8000/api/colonne/', {method: 'GET'})).json().then(response => {console.log(response)})

function addColumn(kanban){
  var addColumn = document.getElementById('addColumn');
  addColumn.addEventListener('click', function () {
      //ici metre la requete /api/colonne en "POST" => ATTENTION asynchrone à gérer
      kanban.addBoards(
          [{
              'id' : '_default',
              'title' : 'Nouvelle colonne',
              'item' : [{ 'title' : 'Tache 1'}]
          }]
      )
  });
}

function addTask(kanban){
  var addTask = document.getElementById('addTask');
  addTask.addEventListener('click', function () {
      //ici metre la requete /api/tache en "POST" => ATTENTION asynchrone à gérer
      kanban.addElement('_todo',
      {
          'title': 'Test'
      })
  })
}

function loadKanban(){
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

function App() {
  onMount( ()=>{
    var kanban = loadKanban()
    addColumn(kanban) // Ajoute le listener ou onClick ?
    addTask(kanban) // Ajoute le listener
  })
  
  return (<>
    <div>Kanban</div>
    <button id="addTask">Ajouter une tache</button>
    <button id="addColumn" >Ajouter une colonne</button>
    <div id="kanban" ></div>
    </>);
}

export default App;
