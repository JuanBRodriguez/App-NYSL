// Variables globales
var estadoUs = "inactivo";
var nombreUs = "";
var emailUs = "";
var emailVer = "";
var fotoURL = "img/person.svg";
var uid = "";
var providerData = "";

// atajos del DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
// var addButton = document.getElementById('add'); //boton con icono de lapiz
var recentPostsSection = document.getElementById('recent-posts-list');

var listeningFirebaseRefs = [];

var logueado = $(".logueado");
var noLogueado = $(".noLogueado");
var fotoUs = $("#fotoUs");
var posts = $(".posts");





/**Crea un elemento de publicación.
 * Creates a post element.
 */
function createPostElement(postId, title, text, author, authorId, authorPic) {
  var uid = firebase.auth().currentUser.uid;

  var html =
    '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
    'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
    '<div class="mdl-card mdl-shadow--2dp">' +
    '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
    '<h4 class="mdl-card__title-text"></h4>' +
    '</div>' +
    '<div class="header">' +
    '<div>' +
    '<div class="avatar"></div>' +
    '<div class="username mdl-color-text--black"></div>' +
    '</div>' +
    '</div>' +
    '<div class="text"></div>' +
    '<div class="comments-container"></div>' +
    '<form class="add-comment" action="#">' +
    '<div class="mdl-textfield mdl-js-textfield">' +
    '<input class="mdl-textfield__input new-comment" type="text">' +
    '<label class="mdl-textfield__label">Comment...</label>' +
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
  var star = postElement.getElementsByClassName('starred')[0];
  var unStar = postElement.getElementsByClassName('not-starred')[0];

  // Set values.
  postElement.getElementsByClassName('text')[0].innerText = text;
  postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
    (authorPic || './silhouette.jpg') + '")';

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
  comment.classList.add('comment-' + id);
  comment.innerHTML = '<span class="username"></span><span class="comment"></span>';
  comment.getElementsByClassName('comment')[0].innerText = text;
  comment.getElementsByClassName('username')[0].innerText = author || 'Anonymous';

  var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
  commentsContainer.appendChild(comment);
}

/*** Establece los valores del comentario en el postElement dado.
 * Sets the comment's values in the given postElement.
 */
function setCommentValues(postElement, id, text, author) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.getElementsByClassName('comment')[0].innerText = text;
  comment.getElementsByClassName('fp-username')[0].innerText = author;
}

/*** Elimina el comentario de la ID dada en el postElement dado.
 * Deletes the comment of the given ID in the given postElement.
 */
function deleteComment(postElement, id) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.parentElement.removeChild(comment);
}


/*** Limpia la interfaz de usuario y elimina todos los oyentes de Firebase.
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  recentPostsSection.getElementsByClassName('posts').innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function (ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/** Crea una nueva publicación para el usuario actual EN DB
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text) {
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
    var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // [START_EXCLUDE]
    return writeNewPost(firebase.auth().currentUser.uid, username,
      firebase.auth().currentUser.photoURL, title, text);
    // [END_EXCLUDE]
  });
  // [END single_value_read]
}

/** Guarda una nueva publicación en Firebase DB.
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]
function writeNewPost(uid, username, picture, title, body) {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    // starCount: 0,
    authorPic: picture
  };
  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}
// [END write_fan_out]


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

function observador() {

}
/**
 * Se activa cada vez que hay un cambio en el estado de autenticación de Firebase
 *  (es decir, el usuario ha iniciado sesión o ha cerrado la sesión).
 */
function onAuthStateChanged(user) {
  //PARA IGNORAR EVENTOS DE REFRESCO We ignore token refresh events. 
  if (user && currentUID === user.uid) {
    return;

  }
  cleanupUi();
  // si hay un usuario logueado o no
  if (user) {
    currentUID = user.uid;
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();

    estadoUs = "activo";
    console.log("usuario " + estadoUs);
    // User is signed in.
    nombreUs = user.displayName;
    emailUs = user.email;
    emailVer = user.emailVerified;
    photoURL = user.photoURL;
    uid = user.uid;
    providerData = user.providerData;
    // asigno la nueva foto de usuario
    fotoUs.src = photoURL;
    logueado.show();
    noLogueado.hide();

  } else {
    // Set currentUID to null.
    currentUID = null;

    // User is signed out.
    estadoUs = "inactivo";
    console.log("usuario " + estadoUs);

    nombreUs = "";
    emailUs = "";
    emailVer = "";
    photoURL = "";
    uid = "";
    providerData = "";
    // asigno la  foto de usuario default
    fotoUs.src = "img/person.svg";
    logueado.hide();
    noLogueado.show();

    // Display the splash page where you can sign-in.
    //   splashPage.style.display = '';
  }
}
/**
 * El ID del usuario actualmente conectado. Hacemos un seguimiento de esto para 
 * detectar eventos de cambio de estado de autenticación que son solo
 * Actualización de token programática pero no un cambio de estado del usuario.
 */
var currentUID;


/* Escribe los datos del usuario en la base de datos.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture: imageUrl
  });
}
// [END basic_write]
/**Comienza a escuchar nuevas publicaciones y llena listas de publicaciones.
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  // [START my_top_posts_query]
  var myUserId = firebase.auth().currentUser.uid;
  var topUserPostsRef = firebase.database().ref('user-posts/' + myUserId).orderByChild('starCount');
  // [END my_top_posts_query]
  // [START recent_posts_query]
  var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
  // [END recent_posts_query]
  var userPostsRef = firebase.database().ref('user-posts/' + myUserId);

  var fetchPosts = function (postsRef, sectionElement) {
    postsRef.on('child_added', function (data) {
      var author = data.val().author || 'Anonymous';
      var containerElement = sectionElement.getElementsByClassName('posts');
      // containerElement.insertBefore(createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
      //   containerElement.firstChild);
    });
    postsRef.on('child_changed', function (data) {
      var containerElement = sectionElement.getElementsByClassName('posts');
      var postElement = containerElement.getElementsByClassName('post-' + data.key);
      postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
      postElement.getElementsByClassName('username')[0].innerText = data.val().author;
      postElement.getElementsByClassName('text')[0].innerText = data.val().body;
    });
    postsRef.on('child_removed', function (data) {
      var containerElement = sectionElement.getElementsByClassName('posts');
      var post = containerElement.getElementsByClassName('post-' + data.key);
      post.parentElement.removeChild(post);
    });
  };
  // Obteniendo y mostrando todas las publicaciones de cada sección.
  fetchPosts(recentPostsRef, recentPostsSection);

  // Keep track of all Firebase refs we are listening to.
  listeningFirebaseRefs.push(recentPostsRef);
}


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

// document.addEventListener("click", function () {
//   orientacion = window.screen.orientation.type;
//   console.log("Orientacion clikeada: " + orientacion);
//   observador();
// });

// ****************************************************************************************



// [END post_value_event_listener]
