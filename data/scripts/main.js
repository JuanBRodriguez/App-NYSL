// Variables globales
var estadoUs = "inactivo";
var nombreUs = "";
var emailUs = "";
var emailVer = "";
var fotoURL = "img/person.svg";
var uid = "";
var providerData = "";
var ramaPost = "msj-0914";
/**
 * El ID del usuario actualmente conectado. Hacemos un seguimiento de esto para 
 * detectar eventos de cambio de estado de autenticación que son solo
 * Actualización de token programática pero no un cambio de estado del usuario.
 */
var uid = "";

// atajos del DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
// var addButton = document.getElementById('add'); //boton con icono de lapiz
// var recentPostsSection = document.getElementById('recent-posts-list');

var listeningFirebaseRefs = [];

var logueado = $(".logueado");
var noLogueado = $(".noLogueado");
var fotoUs = $("#fotoUs");
var posts = document.getElementById("posts-"+ramaPost)





/**Crea un elemento de publicación.
 * Creates a post element.
 */
function createPostElement(postId, title, text, author, authorId, authorPic) {

  console.log(postId, title, text, author, authorId, authorPic);

  var html =
    '<div class="post post-' + postId + ' card text-white bg-success mb-3 ">' +
      '<div class="card-header row">' +
        '<h4 class="card-title col m-0"></h4>' +
        '<div class="username mt-2"></div>' +
        '<img class="avatar "></img>' +
      '</div>' +
      '<div class="card-body text-justify">'+
        '<div class="text card-text"></div>' +
        '<div class="comments-container card-text list-group list-group-flush "></div>' +
        '<form class="add-comment" action="#">' +
        '<div class="mdl-textfield mdl-js-textfield">' +
        '<input class="form-control new-comment" type="text" placeholder="Comment...">' +
        '</div>' +
        '</form>' +
      '</div>' +
    '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;
  if (componentHandler) {
    componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
  }

  var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
  var commentInput = postElement.getElementsByClassName('new-comment')[0];

  // Set values.
  postElement.getElementsByClassName('text')[0].innerText = text;
  postElement.getElementsByClassName('card-title')[0].innerText = title;
  postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
    (authorPic || 'img/person.svg') + '")';


  // Listen for comments.
  // [START child_event_listener_recycler]
  var commentsRef = firebase.database().ref('post-comments/' + postId);
  commentsRef.on('child_added', function (data) {
    addCommentElement(postElement, data.key, data.val().text, data.val().author);
  });

  commentsRef.on('child_changed', function (data) {
    setCommentValues(postElement, data.key, data.val().text, data.val().author);
  });

  commentsRef.on('child_removed', function (data) {
    deleteComment(postElement, data.key);
  });
  // [END child_event_listener_recycler]

  // Keep track of all Firebase reference on which we are listening.
  // Mantenga un registro de todas las referencias de Firebase en las que estamos escuchando.
  listeningFirebaseRefs.push(commentsRef);

  // Create new comment.
  addCommentForm.onsubmit = function (e) {
    e.preventDefault();
    createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
    commentInput.value = '';
    commentInput.parentElement.MaterialTextfield.boundUpdateClassesHandler();
  };
  return postElement;
}

/**Escribe un nuevo comentario para la publicación dada. 
 * Writes a new comment for the given post.
 */
function createNewComment(postId, username, uid, text) {
  firebase.database().ref('post-comments/' + postId).push({
    text: text,
    author: username,
    uid: uid
  });
}

/**Crea un elemento de comentario y lo agrega al elemento postElement dado.
 * Creates a comment element and adds it to the given postElement.
 */
function addCommentElement(postElement, id, text, author) {
  var comment = document.createElement('div');
  comment.classList.add('comment-' + id +"list-group-item");
  comment.classList.add("list-group-item");
  comment.classList.add("bg-success");
  comment.innerHTML = '<span class="username"></span>: <span class="comment"> </span>';
  comment.getElementsByClassName('comment')[0].innerText = text;
  comment.getElementsByClassName('username')[0].innerText = author || 'Anonymous';

  var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
  commentsContainer.appendChild(comment);
}


/*** Limpia la interfaz de usuario y elimina todos los oyentes de Firebase.
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  posts.innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function (ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}



//Envia datos a la DB

function newPostForCurrentUser(title, text) {
  console.log("enviando " + title + "   " + text);
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
    var username = (snapshot.val() && snapshot.val().username) || 'Anonymous'; // verifica nombre de usuario o asigna anonimo
    return writeNewPost(firebase.auth().currentUser.uid, username, firebase.auth().currentUser.photoURL, title, text);
  });
}

//Guarda una nueva publicación en Firebase DB.
function writeNewPost(uid, username, picture, title, body) {
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    authorPic: picture
  };
  // obtiene una nueva clave para el nuevo post
  var newPostKey = firebase.database().ref().child(ramaPost).push().key;
  // Escriba los datos de la nueva publicación simultáneamente en la lista de publicaciones 
  var updates = {};
  updates['/' + ramaPost + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}

// acceder o registrar con google
function registrar() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function (result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
//  acceder con contraseña
function acceder() {
  console.log("acceder");
  let email = $("#email").val();
  console.log($("#email").val());
  let password = $("#contra").val();
  console.log($("#contra").val());

  console.log("Limpiando");
  // $("#email").val("");
  // $("#contra").val("");
  console.log("Limpiado");

  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      // ...
    });
}

function regis() {
  console.log("registrar");
  let email = $("#email").val();
  let password = $("#contra").val();
  console.log("Limpiando");
  // $("#email").val("");
  // $("#contra").val("");
  console.log("Limpiado");

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    // ...
  });
}
// des logearse
function salir() {
  console.log("saliendo");
  firebase.auth().signOut().then(function () {
    console.log("salio");
    // Sign-out successful.
  }).catch(function (error) {
    // An error happened.
    console.log(error);
  });
}

function observador() {}

//  * Se activa cada vez que hay un cambio en el estado de autenticación de Firebase (es decir, el usuario ha iniciado sesión o ha cerrado la sesión).
function onAuthStateChanged(user) {
  //PARA IGNORAR EVENTOS DE REFRESCO We ignore token refresh events. 
  if (user && uid === user.uid) {
    return;
  }
  cleanupUi();

  // si hay un usuario logueado o no
  if (user) {
    nombreUs = user.displayName;
    emailUs = user.email;
    emailVer = user.emailVerified;
    photoURL = user.photoURL;
    uid = user.uid;
    providerData = user.providerData;
    writeUserData(uid, nombreUs, emailUs, photoURL);

    // startDatabaseQueries();

    estadoUs = "activo";
    console.log("usuario :" + estadoUs);
    // asigno la nueva foto de usuario
    fotoUs.attr("src", photoURL);
    // se habilita los privilegios
    logueado.show();
    noLogueado.hide();

  } else {
    nombreUs = null;
    emailUs = null;
    emailVer = null;
    photoURL = null;
    uid = null;
    providerData = null;

    estadoUs = "inactivo";
    console.log("usuario " + estadoUs);


    // asigno la  foto de usuario default
    fotoUs.attr("src", "img/person.svg");
    logueado.hide();
    noLogueado.show();

    // Display the splash page where you can sign-in.
    //   splashPage.style.display = '';
  }
}

//Escribe los datos del usuario en la base de datos.
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture: imageUrl
  });
}

// escucha nuevas publicaciones y llena listas de publicaciones.
function startDatabaseQueries() {
  
  var postsRef = firebase.database().ref(ramaPost);
  console.log("bajando datos para :"+ ramaPost ); 
  // Obteniendo y mostrando todas las publicaciones de cada sección.
  postsRef.on('value', function (data) {
    posts.innerHTML="";
    var author = 'Anonymous';
    data.forEach(function (e) {
      element = e.val();
      author = element.author || 'Anonymous';
      posts.insertBefore(createPostElement(e.key, element.title, element.body, author, element.uid, element.authorPic), posts.firstChild);
    });
  });
  // Mantenga un registro de todas las referencias de Firebase que estamos escuchando.
  listeningFirebaseRefs.push(postsRef);
}

// EJECUCION INICIAL
window.addEventListener('load', function () {
  // Escucha los cambios de estado de autenticación
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  // Guarda el mensaje al enviar el formulario.
  messageForm.onsubmit = function (e) {
    e.preventDefault();
    var text = messageInput.value;
    var title = titleInput.value;
    if (text && title) {
      newPostForCurrentUser(title, text).then(function () {});
      messageInput.value = '';
      titleInput.value = '';
    }
  };
  // 
  orientacion = window.screen.orientation.type;
  console.log("Orientacion inicial: " + orientacion);
});