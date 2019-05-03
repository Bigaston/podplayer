/* TODO
 * +10 sec et -10 secondes (avoirle choix)
 * Un partage avec un démarrage à un endroit précis
 * Pouvoir écouter en accéléré (jusqu'à x5)
 */

document.getElementsByTagName("head")[0].innerHTML = document.getElementsByTagName("head")[0].innerHTML + `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/bigaston/podplayer/style.css">`

globaldiv = document.getElementById("big-player")

globaldiv.innerHTML = `
<style src="https://cdn.jsdelivr.net/gh/bigaston/podplayer/style.css">
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
`

parser = new DOMParser();

var CORSPROXY = "https://cors-anywhere.herokuapp.com/"

// CHANGE THIS

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


function initDocument(item, titre) {
  
  player = document.getElementById("audiosound");
  
  
  for (i = 0; i < item.children.length; i++) {
    if (item.children.item(i).tagName=="enclosure") {
      
        player.src = item.children.item(i).attributes.url.nodeValue;
    } else if (item.children.item(i).tagName=="itunes:image") {
        document.getElementById("audio-logo").src = item.children.item(i).attributes.href.nodeValue;
    } else if (item.children.item(i).tagName == "title") {
      document.getElementById("ep-title").innerHTML = item.children.item(i).innerHTML.replace("<![CDATA[", "").replace("]]>", "");
    } else if (item.children.item(i).tagName == "itunes:season") {
      document.getElementById("audio-ep").innerHTML = document.getElementById("audio-ep").innerHTML + " — S" + item.children.item(i).innerHTML
    } else if (item.children.item(i).tagName == "itunes:episode") {
      document.getElementById("audio-ep").innerHTML = document.getElementById("audio-ep").innerHTML + "E" + item.children.item(i).innerHTML
    } else if (item.children.item(i).tagName == "description") {
      document.getElementById("desc-text").innerHTML = item.children.item(i).innerHTML.replace("<![CDATA[", "").replace("]]>", "");
    } else if (item.children.item(i).tagName == "link") {
      document.getElementById("eplink").innerHTML = ` — <i class="fas fa-link"></i> Lien de l'épisode`
      document.getElementById("eplink").href = item.children.item(i).innerHTML
    }
    
  }  
  playbutton = document.getElementById("play");
  playbutton.addEventListener('click', playAudio);

  sharebutton = document.getElementById("sharebutton")
  sharebutton.addEventListener("click", openShare);

  descbutton = document.getElementById("descbutton")
  descbutton.addEventListener("click", openDesc);

  bar = document.getElementById("progressbar")
  bar.addEventListener("click", changeTime);
  
  setInterval(updateTime, 1000);
  
  function playAudio() {
    if (playbutton.classList.contains("fa-play-circle")) {
      player.play()
      playbutton.className = "fas fa-pause-circle"
    } else {
      player.pause()
      playbutton.className = "fas fa-play-circle"
    }
  
    playbutton.addEventListener('click', playAudio);
  }

  function updateTime() {
    timeText=document.getElementById("audio-time");
    currentTime = convertHMS(player.currentTime)
    timeText.innerHTML = currentTime.heure + ":" + currentTime.minute + ":" + currentTime.seconde;
  
  
    duration = document.getElementById("audio-duration");
    durationObj = convertHMS(player.duration)
    duration.innerHTML = durationObj.heure + ":" + durationObj.minute + ":" + durationObj.seconde;
  
    progress=document.getElementById("prog");
  
    progress.style = "width:" + Math.trunc((player.currentTime/player.duration)*100) + "%;"
  }

  function convertHMS(pSec) {
    nbSec = pSec;
    sortie = {};
    sortie.heure = Math.trunc(nbSec/3600);
    if (sortie.heure < 10) {sortie.heure = "0"+sortie.heure}
  
    nbSec = nbSec%3600;
    sortie.minute = Math.trunc(nbSec/60);
    if (sortie.minute < 10) {sortie.minute = "0"+sortie.minute}
 
    nbSec = nbSec%60;
    sortie.seconde = Math.trunc(nbSec);
    if (sortie.seconde < 10) {sortie.seconde = "0"+sortie.seconde}
  
    return sortie
  }

  function changeTime(event) {
    var percent = event.offsetX / this.offsetWidth;
    player.currentTime = percent * player.duration;
  }

  function openShare() {
    share = document.getElementById("share");
    desc = document.getElementById("description");
    
    if (share.style.display!= "block") {
      share.style.display = "block";
      desc.style.display = "none";
    } else {
      share.style.display = "none";
    }
  
    sharebutton.addEventListener("click", openShare);
  }

  function openDesc() {
    desc = document.getElementById("description");
    share = document.getElementById("share");

    
    if (desc.style.display!= "block") {
      desc.style.display = "block";
      share.style.display = "none";
    } else {
      desc.style.display = "none";
    }
  
    descbutton.addEventListener("click", openDesc);
  }
}
