// variables globales
var orientacion = "";
var nameclass = "";


// atajos del DOM Elements.
var logeo = $("#logeo");
var sign = $("#sign");
var nav = $("#drop-nav");


// abrerviados del DOM
var cont = "#drop-cont";
var partidos = "#partidos";
var estadios = "#estadios";
var comentarios = "#comentarios";

var juegos = "#drop-game";

// A la espera de cambios en la orientacion
window.addEventListener("orientationchange", () => {
   console.log(window.screen.orientation);
   orientacion = window.screen.orientation.type;
   console.log(orientacion);
   if (orientacion == "landscape-primary") {
      console.log("horizontal");
   } else {
      console.log("vertical");
   }
});

//control de la barra de sign
logeo.click(function () {
   sign.collapse('toggle');
});

// a la espera de click en cualquier "botton"
$("button").click(function () {

   // limpio la pantalla de drop inecesarios
   sign.collapse('hide');
   nav.collapse('hide');

   // cargar la clase de el boton ingresado
   nameclass = this.className;
   console.log(nameclass);

   // if (orientacion == "landscape-primary") {
   //    $(juegos).collapse('show'); //mantiene cualquier informacion anterior
   // } else {
   //    $(juegos).collapse('hide'); //cierra cualquier informacion anterior
   // }

   // options info
   mirarCont("find-opt-cal", "#drop-cal"); //open calendar
   mirarCont("find-opt-tea", "#drop-tea"); //open teams
   mirarCont("find-opt-loc", "#drop-loc"); //open estadios


   //calendar

   visualizar(nameclass, "find-mes-sep", "#drop-sep", "toggle"); //open september
   // fechas septiembre
   visualizar(nameclass, "find-fecha-901", "#drop-901", "toggle"); //open 901
   visualizar(nameclass, "find-fecha-908", "#drop-908", "toggle"); //open 908
   visualizar(nameclass, "find-fecha-915", "#drop-915", "toggle"); //open 915
   visualizar(nameclass, "find-fecha-922", "#drop-922", "toggle"); //open 922
   visualizar(nameclass, "find-fecha-929", "#drop-929", "toggle"); //open 929

   visualizar(nameclass, "find-mes-oct", "#drop-oct", "toggle"); //open october
   // fechas octubre
   visualizar(nameclass, "find-fecha-1006", "#drop-1006", "toggle"); //open 10/06
   visualizar(nameclass, "find-fecha-1013", "#drop-1013", "toggle"); //open 10/13
   visualizar(nameclass, "find-fecha-1020", "#drop-1020", "toggle"); //open 10/20
   visualizar(nameclass, "find-fecha-1027", "#drop-1027", "toggle"); //open 10/27

   // Partidos ***************************************************************************************
   // septiembre
   mirarInfo("find-part-914", partidos, "#drop-914"); //open 9 u1 u4
   mirarInfo("find-part-932", partidos, "#drop-932"); //open 932

   mirarInfo("find-part-956", partidos, "#drop-956"); //open 956
   mirarInfo("find-part-961", partidos, "#drop-961"); //open 961

   mirarInfo("find-part-924", partidos, "#drop-924"); //open 924
   mirarInfo("find-part-935", partidos, "#drop-935"); //open 935

   mirarInfo("find-part-913", partidos, "#drop-913"); //open 913
   mirarInfo("find-part-926", partidos, "#drop-926"); //open 926

   mirarInfo("find-part-945", partidos, "#drop-945"); //open 945

   // octubre
   mirarInfo("find-part-1025", partidos, "#drop-1025"); //open 1025
   mirarInfo("find-part-1016", partidos, "#drop-1016"); //open 1016

   mirarInfo("find-part-1034", partidos, "#drop-1034"); //open 1034
   mirarInfo("find-part-1051", partidos, "#drop-1051"); //open 1051

   mirarInfo("find-part-1063", partidos, "#drop-1063"); //open 1063
   mirarInfo("find-part-1024", partidos, "#drop-1024"); //open 1024

   mirarInfo("find-part-1031", partidos, "#drop-1031"); //open 1031
   mirarInfo("find-part-1056", partidos, "#drop-1056"); //open 1056

   // Estadios ****************************************************************************************
   mirarInfo("find-loc-aj", estadios, "#drop-aj"); //open aj
   mirarInfo("find-loc-gre", estadios, "#drop-gre"); //open gre
   mirarInfo("find-loc-mar", estadios, "#drop-mar"); //open mar
   mirarInfo("find-loc-how", estadios, "#drop-how"); //open how
   mirarInfo("find-loc-nor", estadios, "#drop-nor"); //open nor
   mirarInfo("find-loc-sou", estadios, "#drop-sou"); //open sou

   // Comentarios ***************************************************************************************
   // septiembre
   mirarMsj("msj-0914", comentarios); //open 9 u1 u4
   mirarMsj("msj-0932", comentarios ); //open 932

   mirarMsj("msj-0956", comentarios ); //open 956
   mirarMsj("msj-0961", comentarios ); //open 961

   mirarMsj("msj-0924", comentarios ); //open 924
   mirarMsj("msj-0935", comentarios ); //open 935

   mirarMsj("msj-0913", comentarios ); //open 913
   mirarMsj("msj-0926", comentarios ); //open 926

   mirarMsj("msj-0945", comentarios ); //open 945

   // octubre
   mirarMsj("msj-1025", comentarios ); //open 1025
   mirarMsj("msj-1016", comentarios ); //open 1016

   mirarMsj("msj-1034", comentarios ); //open 1034
   mirarMsj("msj-1051", comentarios ); //open 1051

   mirarMsj("msj-1063", comentarios ); //open 1063
   mirarMsj("msj-1024", comentarios ); //open 1024

   mirarMsj("msj-1031", comentarios ); //open 1031
   mirarMsj("msj-1056", comentarios ); //open 1056





   // teams
   visualizar(nameclass, "find-team-u1", "#drop-u1", "toggle"); //open u1
   visualizar(nameclass, "find-team-u2", "#drop-u2", "toggle"); //open u2
   visualizar(nameclass, "find-team-u3", "#drop-u3", "toggle"); //open u3
   visualizar(nameclass, "find-team-u4", "#drop-u4", "toggle"); //open u4
   visualizar(nameclass, "find-team-u5", "#drop-u5", "toggle"); //open u5
   visualizar(nameclass, "find-team-u6", "#drop-u6", "toggle"); //open u6

});

// a la espera de click en cualquier "a"
$("a").click(function () {

   // asignar la clase del a seleccionado
   nameclass = this.className;
   console.log(nameclass);
   //limpiar cualquier informacion anterior
   $(juegos).collapse('hide');
   nav.collapse('hide');

   // Visualizar las paginas internas del html
   mirarPagina("find-nav-hom", "#drop-hom"); //open home
   mirarPagina("find-nav-abo", "#drop-abo"); //open about
   mirarPagina("find-nav-inf", "#drop-inf"); //open inf
   mirarPagina("find-nav-rul", "#drop-rul"); //open rul
   mirarPagina("find-nav-con", "#drop-con"); //open con

});

// funciones************************************************************

function visualizar(clases, buscado, controlado, accion) {
   if (clases.includes(buscado)) {
      $(controlado).collapse(accion);
   }
}

// mirar los tres opciones de contenido de game info
function mirarCont(buscado, controlado, ) {
   if (nameclass.includes(buscado)) {
      $(cont).collapse("show");
      $(controlado).collapse("show");
   }
}

// mirar la informacion de juegos y estadios
function mirarInfo(clikeado, tipo, controlado) {
   let posicion = "";
   if (orientacion == "landscape-primary") {
      posicion = "show";
   } else {
      posicion = "hide";
   }
   if (nameclass.includes(clikeado)) {
      $(cont).collapse(posicion);
      $(tipo).collapse("show");
      $(juegos).collapse("show");
      $(controlado).collapse("show");
   }
}

// mirar la informacion de Comentarios
function mirarMsj(clikeado, tipo) {
   let posicion = "";
   let actualPart="";
   if (orientacion == "landscape-primary") {
      posicion = "show";
   } else {
      posicion = "hide";
   }
   if (nameclass.includes(clikeado)) {
      $(cont).collapse(posicion);
      $(juegos).collapse("show");
      $(tipo).collapse("show");
      $("#post-games").collapse("show");
      actualPart = nameclass.substr(nameclass.indexOf('msj-'), 8);
      $("posts-"+actualPart).collapse("show");

      console.log(actualPart);
      ramaPost = actualPart;
      startDatabaseQueries();
   }
}
// visualiza las paginas de la barra de nav
function mirarPagina(buscado, controlado) {
   if (nameclass.includes(buscado)) {
      $(controlado).collapse('show');
   }
}