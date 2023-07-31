// utils

const blackJack = {
  user: { box: "userBox", skoreSpan: "user_skore", skore: 0 },
  bot: { box: "botBox", skoreSpan: "bot_skore", skore: 0 },
  cards: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "K", "J", "Q", "A"],
  wins: 0,
  losses: 0,
  draws: 0,
  cardsMap: {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    K: 10,
    J: 10,
    Q: 10,
    A: [1, 11],
  },
  isStand: false,
  isHit: false,
  turnsOver: false,
};

const User = blackJack["user"];
const Bot = blackJack["bot"];

const hit_sound = new Audio("Sounds/swish.mp3");
const win_sound = new Audio("Sounds/cash.mp3");
const lost_sound = new Audio("Sounds/aww.mp3");

function randomCard() {
  const random_index = parseInt(Math.random() * 13);
  return blackJack["cards"][random_index];
}

function updateSkore(activePlayer, card) {
  const prev_skore = activePlayer["skore"];
  let cur_skore = 0;
  if (card === "A") cur_skore = prev_skore + 10 > 21 ? 1 : 10;
  else cur_skore = blackJack["cardsMap"][card];

  activePlayer["skore"] = prev_skore + cur_skore;
}

function showSkore(activePlayer) {
  const selector = activePlayer["skoreSpan"];
  const skore = activePlayer["skore"];
  if (skore <= 21) {
    $(`.${selector}`).text(`${skore}`);
  } else {
    $(`.${selector}`).text(`BUST!!!`).css("color", "red");
  }
}

function showCard(activePlayer, random_card) {
  if (activePlayer["skore"] <= 21) {
    const boxId = activePlayer["box"];
    const imgCard = `<img src="images/${random_card}.png"></img>`;
    $(`#${boxId}`).append(imgCard);
    hit_sound.play();
  }
}

function removeNextImage(index, imgArray) {
  if (index < imgArray.length) {
    imgArray[index].remove();
    imgArray.splice(index, 1);
    setTimeout(() => removeNextImage(index, imgArray), 250);
  }
}

function blackJackDeal() {
  if (blackJack["turnsOver"] === true) {
    blackJack["isStand"] = false;
    blackJack["isHit"] = false;

    const user_id = User["box"];
    const bot_id = Bot["box"];
    let userImages = Array.from($(`#${user_id} img`));
    let botImages = Array.from($(`#${bot_id} img`));

    removeNextImage(0, userImages);
    removeNextImage(0, botImages);

    const user_skore_span = User["skoreSpan"];
    const bot_skore_span = Bot["skoreSpan"];

    $(`.${user_skore_span}`).text("0").css("color", "white");
    $(`.${bot_skore_span}`).text("0").css("color", "white");

    User["skore"] = 0;
    Bot["skore"] = 0;

    $(`.verdict`).text("Let's Play").css("color", "black");

    blackJack["turnsOver"] = false;
  }
}

$(".btn").click(function () {
  const instruction = this.id;

  if (instruction === "hit") hit();
  else if (instruction === "stand") stand();
  else if (instruction === "deal") blackJackDeal();
});

function hit() {
  if (blackJack["isStand"] === false) {
    const random_card = randomCard();
    showCard(User, random_card);
    updateSkore(User, random_card);
    showSkore(User);
    blackJack["isHit"] = true;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function stand() {
  if (blackJack["isHit"] === true && blackJack["turnsOver"] === false) {
    blackJack["isStand"] = true;

    while (Bot["skore"] <= 16 && blackJack["isStand"] === true) {
      const random_card = randomCard();
      showCard(Bot, random_card);
      updateSkore(Bot, random_card);
      showSkore(Bot);
      await sleep(1000);
    }

    blackJack["turnsOver"] = true;
    const winner = getWinner();
    showWinner(winner);
  }
}

function showWinner(winner) {
  if (blackJack["turnsOver"] === true) {
    let mssg, mssgColor;

    if (winner === "USER") {
      mssg = "YOU WIN !!!";
      mssgColor = "green";
      $("#win").text(`${blackJack["wins"]}`);
      win_sound.play();
    } else if (winner === "BOT") {
      mssg = "YOU LOST !!!";
      mssgColor = "red";

      $("#lost").text(`${blackJack["losses"]}`);
      lost_sound.play();
    } else {
      mssg = "YOU DREW !!!";
      mssgColor = "black";
      $("#draw").text(`${blackJack["draws"]}`);
    }

    $(".verdict").text(`${mssg}`).css("color", `${mssgColor}`);
  }
}

function getWinner() {
  const userSkore = User["skore"];
  const botSkore = Bot["skore"];

  let winner = "";

  if (userSkore <= 21) {
    if (botSkore > 21 || botSkore < userSkore) {
      winner = "USER";
      blackJack["wins"]++;
    } else if (botSkore <= 21 && botSkore > userSkore) {
      winner = "BOT";
      blackJack["losses"] += 1;
    }
  } else {
    if (botSkore <= 21) {
      winner = "BOT";
      blackJack["losses"]++;
    }
  }

  if (winner === "") {
    winner = "DRAW";
    blackJack["draws"]++;
  }

  return winner;
}
