/* TODO
 * Ajouter fonction pour afficher bouton en fonction du radion
 * Fonction de génération du player
 * Text box d'affichage du code
 * Copie du code du player
 * Affichage dynamique du player
 */

parser = new DOMParser();

var CORSPROXY = "https://cors-anywhere.herokuapp.com/"

function rechercher() {
  rss = document.getElementById("rss-input").value;
  
  fetch(CORSPROXY + rss)
  .then((response) => {
    response.text().then((text) => {
      xmlDoc = parser.parseFromString(text,"text/xml");
      
      divi = document.getElementById("rss-result")
      divi.innerHTML = "";
      
      for (i = 0; i < xmlDoc.getElementsByTagName("item").length; i++) {
        divchild = document.createElement("div")
        divchild.className = "div-rss";
        divchild.innerHTML = `        
            <h3>${xmlDoc.getElementsByTagName("item")[i].getElementsByTagName("title")[0].innerHTML.replace("<![CDATA[", "").replace("]]>", "")}</h3>
            <button onclick="genPlayer('${xmlDoc.getElementsByTagName("item")[i].getElementsByTagName("guid")[0].innerHTML}')">Génerer le player</button>`
        divi.appendChild(divchild);
      }
    })
  })
}

rdbEp = document.getElementById("episode");
rdbEp.addEventListener("click", dispSearch)

function dispSearch() {
  s = document.getElementById("search");
  s.style = "display: block;"
}

rdbLast = document.getElementById("dernier");
rdbLast.addEventListener("click", dispLast);

function dispLast() {
  s = document.getElementById("search");
  s.style = "display: none;"
  
  divi = document.getElementById("rss-result")
  divi.innerHTML = "";
  
  genPlayer("last");
}

function genPlayer(id) {
  widget = `<div id="big-player" feed="${document.getElementById("rss-input").value}" guid="${id}"></div>`;
  
  text = document.getElementById("widgetcode");
  text.style = "display: block;"
  text.value = widget + `<script src="https://cdn.jsdelivr.net/gh/bigaston/podplayer@1.1.0/script.js"></script>`;
  disp = document.getElementById("dispwidget")
  disp.style = "text-align: left;display:block;"
  disp.innerHTML = `<div id="big-player" feed="${document.getElementById("rss-input").value}" guid="${id}">
<div class="player">
    <img id="audio-logo" alt="Logo du podcast">
    <div class="audio-info">
      <h2 id="ep-title"><!-- Nom de l'épisode --></h2>
      <h3 id="podcast-title"><!-- Nom du podcast --></h3> 
      <a id="eplink"></a>      
<p id="audio-ep"></p>
      <div id="progressbar">
        <div id="prog"></div>
      </div>
      <div class="time">
        <p id="audio-time">00:00:00</p>
        <p id="audio-duration">00:00:00</p>
      </div>
      <div class="controls">
        <i id="descbutton" class="fas fa-align-left"></i>
        <i id="play" class="fas fa-play-circle"></i>
        <i id="sharebutton" class="fas fa-share"></i>
      </div>
    </div>
    <audio id="audiosound" src="" hidden></audio>
  </div>
  <div id="share">
    <h3 id="sharetitle">Partager <!-- Nom du podcast --></h3>
    <div class="share-icon">
      <i class="fab fa-twitter" style="color:#00aced;"></i>
      <i class="fab fa-facebook" style="color:#3B5998;"></i>
    </div>
  </div>
  
  <div id="description">
    <h3>Description</h3>
    <div id="desc-text">
      <!-- Description -->
    </div>
  </div>
</div>`;
  
  globaldiv = document.getElementById("big-player")
  
  fetch(CORSPROXY + globaldiv.attributes[1].value)
  .then((response) => {
    response.text().then((text) => {
      xmlDoc = parser.parseFromString(text,"text/xml");
      i = 0;
      if (globaldiv.attributes[2].value == "last") {
        item = xmlDoc.getElementsByTagName("item")[0];
      } else {
        while (globaldiv.attributes[2].value!=xmlDoc.getElementsByTagName("item")[i].getElementsByTagName("guid")[0].innerHTML && i < xmlDoc.getElementsByTagName("item").length) {
          i++;
        }
        item = xmlDoc.getElementsByTagName("item")[i];
      }
      
      document.getElementById("podcast-title").innerHTML = xmlDoc.getElementsByTagName("title")[0].innerHTML.replace("<![CDATA[", "").replace("]]>", "");
      document.getElementById("sharetitle").innerHTML = "Partager " + xmlDoc.getElementsByTagName("title")[0].innerHTML.replace("<![CDATA[", "").replace("]]>", "");

      initDocument(item);
    })
  })
}