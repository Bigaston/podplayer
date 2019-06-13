document.getElementsByTagName("head")[0].innerHTML = document.getElementsByTagName("head")[0].innerHTML + `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/bigaston/podplayer@1.3.0/style.css">`
import("https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.0/jsmediatags.js")

var jsmediatags = window.jsmediatags;
playspeed = 1;

globaldiv = document.getElementById("big-player")

globaldiv.innerHTML = `
  <div class="player">
    <img id="audio-logo" alt="Logo du podcast">
    <div class="audio-info">
      <h2 id="ep-title"><!-- Nom de l'épisode --></h2>
      <div id="subbar">
        <h3 id="podcast-title"><!-- Nom du podcast --></h3> 
      <a id="eplink"></a>
<p id="audio-ep"></p>
        <div>
          <i class="fas fa-stopwatch"></i>
          <p>X1.0</p>
        </div>
      </div>
      <div id="speedrange">
        <input type="range" min="0.5" max="5" value="1" id="rangebar" step="0.1">
      </div>
      <div id="progressbar">
        <div id="prog"></div>
      </div>      
      <div class="time">
        <p id="audio-time">00:00:00</p>
        <p id="audio-duration">00:00:00</p>
      </div>
      <div id="plusmoins">
        <p id="plusdix">+10s <i class="fas fa-forward"></i></p>
        <p id="moinsdix"><i class="fas fa-backward"></i> -10s</p> 
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
      <a href="" id="sharetw" target="_blank"><i class="fab fa-twitter" style="color:#00aced;"></i></a>
      <a href="" id="sharefb" target="_blank"><i class="fab fa-facebook" style="color:#3B5998;"></a></i>
    </div>
  </div>
  
  <div id="description">
    <h3>Description</h3>
    <div id="desc-text">
      <!-- Description -->
    </div>
  </div>
  
  <div id="bookmark">
    <h3>Chapitres</h3>
    <ul id="book-list">
      
    </ul>
  </div>  
`

parser = new DOMParser();

var CORSPROXY = "https://cors-anywhere.herokuapp.com/"

// CHANGE THIS

fetch(CORSPROXY + getAttribute("feed"))
  .then((response) => {
    response.text().then((text) => {
      xmlDoc = parser.parseFromString(text,"text/xml");
      i = 0;
      if (getAttribute("guid") == "last") {
        item = xmlDoc.getElementsByTagName("item")[0];
      } else {
        while (getAttribute("guid")!=xmlDoc.getElementsByTagName("item")[i].getElementsByTagName("guid")[0].innerHTML && i < xmlDoc.getElementsByTagName("item").length) {
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
  if (getAttribute("mc") != undefined) {
    document.documentElement.style.setProperty('--main-color', getAttribute("mc"));
  }
  
  if (getAttribute("bc") != undefined) {
    document.documentElement.style.setProperty('--button-color', getAttribute("bc"));    
  } 
  
  player = document.getElementById("audiosound");
  
  for (i = 0; i < item.children.length; i++) {
    if (item.children.item(i).tagName=="enclosure") {
      
        player.src = item.children.item(i).attributes.url.nodeValue;
      getMetaData(item.children.item(i).attributes.url.nodeValue);
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
      document.getElementById("sharefb").href = `http://www.facebook.com/sharer.php
?u=${encodeURIComponent(item.children.item(i).innerHTML)}`
      document.getElementById("sharetw").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent( item.children.item(i).innerHTML + " #podcast")}`
      document.getElementById("eplink").href = item.children.item(i).innerHTML
    }
    
  }  
  playbutton = document.getElementById("play");
  playbutton.addEventListener('click', playAudio);

  sharebutton = document.getElementById("sharebutton")
  sharebutton.addEventListener("click", openShare);

  descbutton = document.getElementById("descbutton")
  descbutton.addEventListener("click", openDesc);
  
  speedbutton = document.querySelector("#subbar > div");
  speedbutton.addEventListener("click", openSpeed)
  
  speedrange = document.getElementById("rangebar");
  speedrange.addEventListener("change", changeSpeed)

  bar = document.getElementById("progressbar")
  bar.addEventListener("click", changeTime);
  
  document.getElementById("plusdix").addEventListener("click", jumpTime)
  document.getElementById("moinsdix").addEventListener("click", jumpTime)
  
  setInterval(updateTime, 1000);
  
  function playAudio() {
    if (playbutton.classList.contains("fa-play-circle")) {
      player.play()
      player.playbackRate = playspeed;
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
    book = document.getElementById("bookmark")
    
    if (share.style.display!= "block") {
      share.style.display = "block";
      desc.style.display = "none";
      book.style.display = "none";
    } else {
      share.style.display = "none";
    }
  
    sharebutton.addEventListener("click", openShare);
  }

  function openBook() {
    desc = document.getElementById("description");
    share = document.getElementById("share");
    book = document.getElementById("bookmark")
    
    if (book.style.display!= "block") {
      book.style.display = "block";
      share.style.display = "none";
      desc.style.display = "none";
    } else {
      book.style.display = "none";
    }
  
    bookbutton = document.getElementById("bookbutton")
    bookbutton.addEventListener("click", openBook);
  }
  
  function openDesc() {
    desc = document.getElementById("description");
    share = document.getElementById("share");
    book = document.getElementById("bookmark")
    
    if (desc.style.display!= "block") {
      desc.style.display = "block";
      share.style.display = "none";
      book.style.display = "none";
    } else {
      desc.style.display = "none";
    }
  
    descbutton.addEventListener("click", openDesc);
    }
  function getMetaData(audio) {
      jsmediatags.read(CORSPROXY + audio, {
        onSuccess: function(tag) {
          if (tag.tags.CHAP != undefined) {
            btn_book = document.createElement("i")
            btn_book.className = "fas fa-bookmark";
            btn_book.id = "bookbutton"
            btn_book.addEventListener("click", openBook);
            document.getElementsByClassName("controls")[0].appendChild(btn_book)
            
            list_book = document.getElementById("book-list");
                        
            for (i = 0; i < tag.tags.CHAP.length; i++) {
              li = document.createElement("li")
              s1 = document.createElement("span")
              s2 = document.createElement("span")
              
              s1.innerHTML = " : " + tag.tags.CHAP[i].data.subFrames.TIT2.data
                            
              hms = convertHMS(tag.tags.CHAP[i].data.startTime/1000)

              s2.innerHTML = hms.heure + ":" + hms.minute + ":" + hms.seconde
              
              s2.setAttribute("time", tag.tags.CHAP[i].data.startTime/1000)
              s2.addEventListener("click", jumpTo);
              li.appendChild(s2)
              li.appendChild(s1)
              list_book.appendChild(li)
            }
          }
        },
        onError: function(error) {
          console.log(error);
        }
  });
  }
  
  function jumpTo(event) {
    player = document.getElementById("audiosound");
    player.currentTime = event.target.getAttribute("time")
  }
  
  function openSpeed() {
    if (document.getElementById("speedrange").style.display!="block") {
      document.getElementById("speedrange").style.display = "block"
    } else {
      document.getElementById("speedrange").style.display = "none"
    }
  }
  
  function changeSpeed(event) {
    playspeed = event.target.value;
    document.querySelector("#subbar > div > p").innerHTML = "X" + addZero(playspeed);
    player = document.getElementById("audiosound");
    player.playbackRate = playspeed;
    
  }
  
  function jumpTime(event) {
    player = document.getElementById("audiosound");
    if (event.target.attributes["id"].value == "plusdix") {
      player.currentTime = player.currentTime + 10
    } else {
      player.currentTime = player.currentTime - 10
    }
  }
}

function getAttribute(att) {
  if (globaldiv.attributes[att] == undefined) {
    return undefined;
  } else {
    return globaldiv.attributes[att].value;
  }
}

function addZero(val) {
  if (Math.trunc(val) != val) {
    return "" + val;
  } else {
    return "" + val + ".0"
  }
}
