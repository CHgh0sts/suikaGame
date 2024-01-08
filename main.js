let numberVertion = "1.3.1"

import {
  Engine,
  Render,
  Runner,
  Bodies,
  World,
  Body,
  Sleeping,
  Events,
} from "matter-js";
import { FRUITS } from "./fruits";
import { MODE } from "./config";
let widthGameZone = 700,heightGameZone = 950
let taileBorderWall = 10,taileBorderGround = 30
let xPos = widthGameZone / 2,playing = true,deathLine = 150

function $_GET(param) {
	let vars = {};
	window.location.href.replace( location.hash, '' ).replace( /[?&]+([^=&]+)=?([^&]*)?/gi, ( m, key, value ) => vars[key] = value !== undefined ? value : '');

	if (param) {
		return vars[param] ? vars[param] : null;
	}
	return vars;
}

let listImgs = 'default', get = $_GET('s');
if(get) listImgs = get
console.log(listImgs);

let boxGame = document.querySelector('#app')
let scoreP = document.createElement('p'), score = 0
scoreP.classList.add('score')
scoreP.innerHTML = 'Score: ' + score
boxGame.append(scoreP)

let next = document.createElement('div')
next.classList.add('next')
boxGame.append(next)


let vertion = document.createElement('p')
vertion.classList.add('vertion')
vertion.innerHTML = numberVertion
document.body.append(vertion)

let orderBox = document.createElement('div')
orderBox.classList.add('orderBox')

for (let x = 0; x < FRUITS.length; x++) {
  let fruit = FRUITS[x];
  if(x !== 0) orderBox.innerHTML += '<p> => </p>'
  if(listImgs !== 'colorMode') {
    orderBox.innerHTML += `<img style="--v: ${x}" src="/${listImgs}/${fruit.label}.png">`
  }else {
    orderBox.innerHTML += `<div style="--v: ${x};background: ${fruit.color}">`
  }
}
boxGame.append(orderBox)


let fusion = document.createElement('audio')
fusion.classList.add('audio')
fusion.src = `/${listImgs}/song.wav`;
boxGame.append(fusion)


let paramsBtn = document.createElement('div')
paramsBtn.classList.add('paramsBtn')
paramsBtn.style = `--x: ${xPos};--y: ${heightGameZone / 2}`
paramsBtn.innerHTML = `<img src="params.png">`
document.body.append(paramsBtn)

let son = true
let paramsSong = $_GET('song')
if(!paramsSong || (paramsSong && paramsSong == false)) son = false
let sonBtn = document.createElement('div')
sonBtn.classList.add('sonBtn')
sonBtn.style = `--x: ${xPos};--y: ${heightGameZone / 2}`
if(son) {
  sonBtn.innerHTML = `<img src="audioOff.png">`
}else {
  sonBtn.innerHTML = `<img src="audioOn.png">`
}
document.body.append(sonBtn)

sonBtn.addEventListener('click', () => {
  if(sonBtn.innerHTML == '<img src="audioOn.png">') {
    sonBtn.innerHTML = '<img src="audioOff.png">'
    fusion.volume = 0
  }else {
    fusion.setAttribute('muted', 'false')
    sonBtn.innerHTML = '<img src="audioOn.png">'
    fusion.volume = 1
  }
})


let params = document.createElement('div')
params.classList.add('paramsBox')
params.style = `--x: ${widthGameZone};--y: ${heightGameZone / 2}`

let listMode = ''
for (let j = 0; j < MODE.length; j++) {
  let configMode = MODE[j];
  let listImg = ''

  for (let x = 0; x < FRUITS.length; x++) {
    let fruit = FRUITS[x];
    if(x !== 0) listImg += '<p> => </p>'
    if(configMode.label !== 'colorMode') {
      listImg += `<img src="/${configMode.label}/${fruit.label}.png">`
    }else {
      listImg += `<div class="img" style="background: ${fruit.color}"></div>`
    }
  }

  listMode += `
    <li class="mode">
      <div class="infoMode">
        <h2>${configMode.label}</h2>
        <a href="${window.location.origin}?s=${configMode.label}">Choisir ce mode</a>
      </div>
      <div class="listImg">
        ${listImg}
      </div>
    </li>`
}

params.innerHTML = `<ul class="listMode">${listMode}</ul>`

let closeParams = document.createElement('button')
closeParams.innerHTML = 'Fermer'
params.append(closeParams)

document.body.append(params)

paramsBtn.addEventListener('click', () => {
  params.classList.toggle('open')
  playing = false
})

closeParams.addEventListener('click', () => {
  params.classList.remove('open')
  playing = true
})

let death = document.createElement('div')
death.classList.add('deathBox')
death.style = `--x: ${widthGameZone};--y: ${heightGameZone / 2}`

document.body.append(death)

const engine = Engine.create();
const render = Render.create({
  engine,
  element: boxGame,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: widthGameZone,
    height: heightGameZone,
  },
});

const world = engine.world;

const ground = Bodies.rectangle(widthGameZone / 2, (heightGameZone - (taileBorderGround / 2)), widthGameZone, taileBorderGround, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});
const leftWall = Bodies.rectangle(taileBorderWall / 2, (heightGameZone - taileBorderGround) / 2, taileBorderWall, heightGameZone, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});
const rightWall = Bodies.rectangle((widthGameZone - (taileBorderWall / 2)), (heightGameZone - taileBorderGround) / 2, taileBorderWall, heightGameZone, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});
const topLine = Bodies.rectangle(widthGameZone / 2, deathLine, widthGameZone, 2, {
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" },
  label: "topLine",
});
const verticalLine = Bodies.rectangle(xPos, (heightGameZone - taileBorderGround) / 2, 2, heightGameZone - taileBorderGround, {
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "rgba(0, 0, 0, .1)" },
  label: "verticalLine",
});

World.add(world, [ground, verticalLine, leftWall, rightWall, topLine]);

Render.run(render);
Runner.run(engine);



let currentBody = null;
let currentLigne = verticalLine;
let currentFruit = null;
let interval = null;
let disableAction = false;


function getRandomFruit() {
  const randomIndex = Math.floor(Math.random() * 5);
  const fruit = FRUITS[randomIndex];
  

  if (currentFruit && currentFruit.label === fruit.label)
    return getRandomFruit();

  return fruit;
}

let nextIndex = getRandomFruit()
nextIndex = getRandomFruit();
  if(listImgs !== 'colorMode') {
    next.innerHTML = `<img src="/${listImgs}/${nextIndex.label}.png">`
  }else {
    next.innerHTML = `<div class="nextFruit" style="background: ${nextIndex.color};--size: ${((nextIndex.radius * 2) / 150) * 90}"></div>`
  }

function addCurrentFruit() {

  const randomFruit = nextIndex;
  nextIndex = getRandomFruit();
  if(listImgs !== 'colorMode') {
    next.innerHTML = `<img src="/${listImgs}/${nextIndex.label}.png">`
  }else {
    next.innerHTML = `<div class="nextFruit" style="background: ${nextIndex.color};--size: ${((nextIndex.radius * 2) / 150) * 90}"></div>`
  }
  let paramBody = {}
  if(listImgs !== 'colorMode') {
    paramBody = {
      label: randomFruit.label,
      isSleeping: true,
      render: {
        fillStyle: randomFruit.color,
        sprite: { texture: `/${listImgs}/${randomFruit.label}.png`},
      },
      restitution: 0.2,
    }
    
  }else {
    paramBody = {
      label: randomFruit.label,
      isSleeping: true,
      render: {
        fillStyle: randomFruit.color,
      },
      restitution: 0.2,
    }
  }
  const body = Bodies.circle(xPos, 50, randomFruit.radius, paramBody);

  currentBody = body;
  currentFruit = randomFruit;

  World.add(world, body);
}

boxGame.onpointermove = (event) => {
  if (disableAction || !playing) return;

  

  let move = event.offsetX
  if(event.offsetX < taileBorderWall + currentBody.circleRadius) move = taileBorderWall + currentBody.circleRadius
  if(event.offsetX > (widthGameZone - taileBorderWall) - currentBody.circleRadius) move = widthGameZone - taileBorderWall - currentBody.circleRadius


  Body.setPosition(currentBody, {
    x: move,
    y: currentBody.position.y,
  });
  Body.setPosition(currentLigne, {
    x: move,
    y: (heightGameZone - taileBorderGround) / 2,
  });
  xPos = move
};
boxGame.onpointerdown = (event) => {
  if(!playing || disableAction) return;
  disableAction = true;
  Sleeping.set(currentBody, false);
  setTimeout(() => {
    addCurrentFruit();
    disableAction = false;
  }, 500);
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.label === collision.bodyB.label && !collision.bodyA.isSleeping && !collision.bodyB.isSleeping) {
      collision.verifySortie = true
      World.remove(world, [collision.bodyA, collision.bodyB]);

      const index = FRUITS.findIndex(
        (fruit) => fruit.label === collision.bodyA.label
      );

      // If last fruit, do nothing
      if (index === FRUITS.length - 1) return;

      const newFruit = FRUITS[index + 1];
      score += index + 1
      scoreP.innerHTML = 'Score: ' + score


      let paramBody = {}
      if(listImgs !== 'colorMode') {
        paramBody = {
          render: {
            fillStyle: newFruit.color,
            sprite: { texture: `/${listImgs}/${newFruit.label}.png` },
          },
          label: newFruit.label,
        }
      }else {
        paramBody = {
          render: {
            fillStyle: newFruit.color,
          },
          label: newFruit.label,
        }
      }
      const body = Bodies.circle(collision.collision.supports[0].x,collision.collision.supports[0].y,newFruit.radius, paramBody)
      World.add(world, body);
      fusion.play()
    }
    if (((collision.bodyA.label === "topLine" && collision.bodyB.position.y <= deathLine) || (collision.bodyB.label === "topLine" && collision.bodyA.position.y <= deathLine)) && !disableAction) {
      console.log('game over');
      playing = false
      death.innerHTML = `
        <h1>Game Over</h1>
        <h2>Score : ${score}</h2>
        <a href="${window.location.href}">Rejouer</a>`
      death.classList.add('open')
    }
  });
});

addCurrentFruit();
