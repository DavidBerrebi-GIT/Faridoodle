const PUPITRES = ["Trombone", "Saxophone", "Gros", "Basse", "Trompette"];

const ROLES = [
  "Président",
  "Chef Mu",
  "Roi des Blairo",
  "Respo Com",
  "Trésorier",
  "Respo prev",
  "Respo Bière",
  "Blairo"
];

const members = [
  { name: "Gros2019Président", promotion: 2019, pupitre: "Gros", roles: ["Président"] },
  { name: "Gros2019ChefMu", promotion: 2019, pupitre: "Gros", roles: ["Chef Mu"] },
  { name: "Gros2019RoiDesBlairo", promotion: 2019, pupitre: "Gros", roles: ["Roi des Blairo"] },
  { name: "Trombone2019RespoCom", promotion: 2019, pupitre: "Trombone", roles: ["Respo Com"] },
  { name: "Saxophone2019Trésorier", promotion: 2019, pupitre: "Saxophone", roles: ["Trésorier"] },
  { name: "Basse2019RespoPrev", promotion: 2019, pupitre: "Basse", roles: ["Respo prev"] },
  { name: "Trompette2019RespoBière", promotion: 2019, pupitre: "Trompette", roles: ["Respo Bière"] },
  { name: "Gros2019Blairo", promotion: 2019, pupitre: "Gros", roles: ["Blairo"] },
  { name: "Trombone2019Blairo", promotion: 2019, pupitre: "Trombone", roles: ["Blairo"] },

  { name: "Gros2020Président", promotion: 2020, pupitre: "Gros", roles: ["Président"] },
  { name: "Gros2020ChefMu", promotion: 2020, pupitre: "Gros", roles: ["Chef Mu"] },
  { name: "Gros2020RoiDesBlairo", promotion: 2020, pupitre: "Gros", roles: ["Roi des Blairo"] },
  { name: "Trombone2020RespoCom", promotion: 2020, pupitre: "Trombone", roles: ["Respo Com"] },
  { name: "Saxophone2020Trésorier", promotion: 2020, pupitre: "Saxophone", roles: ["Trésorier"] },
  { name: "Basse2020RespoPrev", promotion: 2020, pupitre: "Basse", roles: ["Respo prev"] },
  { name: "Trompette2020RespoBière", promotion: 2020, pupitre: "Trompette", roles: ["Respo Bière"] },
  { name: "Saxophone2020Blairo", promotion: 2020, pupitre: "Saxophone", roles: ["Blairo"] },

  { name: "Gros2021Président", promotion: 2021, pupitre: "Gros", roles: ["Président"] },
  { name: "Gros2021ChefMu", promotion: 2021, pupitre: "Gros", roles: ["Chef Mu"] },
  { name: "Gros2021RoiDesBlairo", promotion: 2021, pupitre: "Gros", roles: ["Roi des Blairo"] },
  { name: "Trombone2021RespoCom", promotion: 2021, pupitre: "Trombone", roles: ["Respo Com"] },
  { name: "Saxophone2021Trésorier", promotion: 2021, pupitre: "Saxophone", roles: ["Trésorier"] },
  { name: "Basse2021RespoPrev", promotion: 2021, pupitre: "Basse", roles: ["Respo prev"] },
  { name: "Trompette2021RespoBière", promotion: 2021, pupitre: "Trompette", roles: ["Respo Bière"] },
  { name: "Basse2021Blairo", promotion: 2021, pupitre: "Basse", roles: ["Blairo"] },
  { name: "Trompette2021Blairo", promotion: 2021, pupitre: "Trompette", roles: ["Blairo"] },

  { name: "Gros2022Président", promotion: 2022, pupitre: "Gros", roles: ["Président"] },
  { name: "Gros2022ChefMu", promotion: 2022, pupitre: "Gros", roles: ["Chef Mu"] },
  { name: "Gros2022RoiDesBlairo", promotion: 2022, pupitre: "Gros", roles: ["Roi des Blairo"] },
  { name: "Trombone2022RespoCom", promotion: 2022, pupitre: "Trombone", roles: ["Respo Com"] },
  { name: "Saxophone2022Trésorier", promotion: 2022, pupitre: "Saxophone", roles: ["Trésorier"] },
  { name: "Basse2022RespoPrev", promotion: 2022, pupitre: "Basse", roles: ["Respo prev"] },
  { name: "Trompette2022RespoBière", promotion: 2022, pupitre: "Trompette", roles: ["Respo Bière"] },
  { name: "Gros2022Blairo", promotion: 2022, pupitre: "Gros", roles: ["Blairo"] }
];

const nameInput = document.querySelector("#name-input");
const guessButton = document.querySelector("#guess-button");
const historyBody = document.querySelector("#history-body");
const errorMessage = document.querySelector("#error-message");
const success = document.querySelector("#success");
const resetButton = document.querySelector("#reset-button");
const setup = document.querySelector("#setup");
const gameArea = document.querySelector("#game-area");
const startButton = document.querySelector("#start-button");
const attemptSetting = document.querySelector("#attempt-setting");
const timerSetting = document.querySelector("#timer-setting");
const hintSetting = document.querySelector("#hint-setting");
const entryFilterSetting = document.querySelector("#entry-filter-setting");
const attemptStatus = document.querySelector("#attempt-status");
const timerStatus = document.querySelector("#timer-status");
const hintButton = document.querySelector("#hint-button");
const hintText = document.querySelector("#hint-text");
const entryFilter = document.querySelector("#entry-filter");
const promotionFilter = document.querySelector("#promotion-filter");
const pupitreFilter = document.querySelector("#pupitre-filter");
const roleFilter = document.querySelector("#role-filter");
const selectedMemberDetails = document.querySelector("#selected-member-details");
const filteredMemberList = document.querySelector("#filtered-member-list");
const filteredMemberCount = document.querySelector("#filtered-member-count");

let target = null;
let gameSolved = false;
let candidateMembers = [...members];
let attemptsUsed = 0;
let attemptsLimit = 0;
let hintsRemaining = 0;
let secondsRemaining = 0;
let timerId = null;
let selectedMode = "easy";

function populateOptions() {
  [...new Set(candidateMembers.map((member) => member.promotion))]
    .sort((first, second) => first - second)
    .forEach((promotion) => {
      promotionFilter.append(new Option(String(promotion), String(promotion)));
    });

  PUPITRES
    .filter((pupitre) => candidateMembers.some((member) => member.pupitre === pupitre))
    .forEach((pupitre) => {
      pupitreFilter.append(new Option(pupitre, pupitre));
    });

  ROLES
    .filter((role) => candidateMembers.some((member) => member.roles.includes(role)))
    .forEach((role) => {
      roleFilter.append(new Option(role, role));
    });
}

function randomMember() {
  return members[Math.floor(Math.random() * members.length)];
}

function normalized(value) {
  return value.trim().toLocaleLowerCase();
}

function findMember(name) {
  return getCrossedMembers().find((member) => normalized(member.name) === normalized(name));
}

function updateFilteredMemberList() {
  const query = normalized(nameInput.value);
  const matches = getCrossedMembers()
    .filter((member) => !query || normalized(member.name).includes(query))
    .sort((first, second) => first.name.localeCompare(second.name, "fr"));

  filteredMemberList.replaceChildren();
  filteredMemberCount.textContent = `${matches.length} résultat${matches.length > 1 ? "s" : ""}`;

  matches.forEach((member) => {
    const item = document.createElement("li");
    item.tabIndex = 0;
    item.textContent = member.name;

    if (normalized(nameInput.value) === normalized(member.name)) {
      item.classList.add("selected");
    }

    item.addEventListener("click", () => chooseSuggestion(member.name));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        chooseSuggestion(member.name);
      }
    });

    filteredMemberList.append(item);
  });
}

function chooseSuggestion(name) {
  nameInput.value = name;
  showSelectedMemberDetails(name);
  updateFilteredMemberList();
  nameInput.focus();
}

function showSelectedMemberDetails(name) {
  const member = candidateMembers.find((entry) =>
    normalized(entry.name) === normalized(name)
  );

  if (!member) {
    selectedMemberDetails.hidden = true;
    selectedMemberDetails.replaceChildren();
    return;
  }

  selectedMemberDetails.replaceChildren();

  const promotion = document.createElement("strong");
  const pupitre = document.createElement("strong");
  const roles = document.createElement("strong");

  promotion.textContent = String(member.promotion);
  pupitre.textContent = member.pupitre;
  roles.textContent = member.roles.join(", ");

  selectedMemberDetails.append(promotion, pupitre, roles);
  selectedMemberDetails.hidden = false;
}

function attribute(value, matches) {
  const span = document.createElement("span");
  span.className = `attribute ${matches ? "match" : "mismatch"}`;
  span.textContent = value;
  return span;
}

function promotionAttribute(promotion) {
  if (promotion === target.promotion) {
    return attribute(String(promotion), true);
  }

  const direction = promotion < target.promotion ? "Avant" : "Après";
  const span = attribute(`${promotion} - ${direction}`, false);
  return span;
}

function nameAttribute(name) {
  if (normalized(name) === normalized(target.name)) {
    return attribute(name, true);
  }

  const comparison = name.localeCompare(target.name, "fr", {
    sensitivity: "base"
  });
  const direction = comparison < 0 ? "Avant" : "Après";
  return attribute(`${name} - ${direction}`, false);
}

function roleAttribute(guessRoles) {
  const container = document.createElement("div");
  container.className = "role-list";

  guessRoles.forEach((role) => {
    const matches = target.roles.includes(role);
    container.append(attribute(role, matches));
  });

  return container;
}

function updateAttemptStatus() {
  attemptStatus.textContent = attemptsLimit
    ? `Propositions : ${attemptsUsed} / ${attemptsLimit}`
    : `Propositions : ${attemptsUsed}`;
}

function updateTimerStatus() {
  if (secondsRemaining <= 0) {
    timerStatus.textContent = "";
    return;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  timerStatus.textContent = `Temps restant : ${minutes}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  updateTimerStatus();

  if (secondsRemaining <= 0) {
    return;
  }

  timerId = window.setInterval(() => {
    secondsRemaining -= 1;
    updateTimerStatus();

    if (secondsRemaining <= 0) {
      stopTimer();
      gameSolved = true;
      errorMessage.textContent = "Temps écoulé. Lancez une nouvelle partie.";
    }
  }, 1000);
}

function filteredCandidates() {
  return [...members];
}

function applyMode(mode) {
  selectedMode = mode;

  if (mode === "easy") {
    attemptSetting.value = "0";
    timerSetting.value = "0";
    hintSetting.value = "3";
    entryFilterSetting.value = "yes";
  } else if (mode === "medium") {
    attemptSetting.value = "10";
    timerSetting.value = "180";
    hintSetting.value = "1";
    entryFilterSetting.value = "yes";
  } else {
    attemptSetting.value = "5";
    timerSetting.value = "60";
    hintSetting.value = "0";
    entryFilterSetting.value = "no";
  }
}

function startGame() {
  candidateMembers = filteredCandidates();

  if (candidateMembers.length === 0) {
    errorMessage.textContent = "Aucun membre ne correspond à ces filtres.";
    return;
  }

  target = candidateMembers[Math.floor(Math.random() * candidateMembers.length)];
  attemptsLimit = Number(attemptSetting.value);
  secondsRemaining = Number(timerSetting.value);
  hintsRemaining = Number(hintSetting.value);
  attemptsUsed = 0;
  gameSolved = false;

  setup.hidden = true;
  gameArea.hidden = false;
  success.hidden = true;
  hintText.textContent = "";
  hintButton.hidden = hintsRemaining === 0;
  entryFilter.hidden = entryFilterSetting.value !== "yes";
  errorMessage.textContent = "";
  historyBody.replaceChildren();
  selectedMemberDetails.hidden = true;
  selectedMemberDetails.replaceChildren();
  promotionFilter.value = "";
  pupitreFilter.value = "";
  roleFilter.value = "";
  updateCrossedFilter();
  updateAttemptStatus();
  startTimer();
  nameInput.focus();
}

populateOptions();
applyMode("easy");

function submitGuess() {
  if (gameSolved) {
    errorMessage.textContent = "Cette partie est terminée. Appuyez sur Rejouer pour recommencer.";
    return;
  }

  const guessedMember = findMember(nameInput.value);

  if (!guessedMember) {
    errorMessage.textContent = "Choisissez un nom exact dans la liste des membres.";
    return;
  }

  if (attemptsLimit > 0 && attemptsUsed >= attemptsLimit) {
    errorMessage.textContent = `Limite de ${attemptsLimit} propositions atteinte.`;
    return;
  }

  errorMessage.textContent = "";
  attemptsUsed += 1;
  updateAttemptStatus();

  const row = document.createElement("tr");
  const nameCell = document.createElement("td");
  const promotionCell = document.createElement("td");
  const pupitreCell = document.createElement("td");
  const rolesCell = document.createElement("td");

  nameCell.append(nameAttribute(guessedMember.name));
  promotionCell.append(promotionAttribute(guessedMember.promotion));
  pupitreCell.append(attribute(
    guessedMember.pupitre,
    guessedMember.pupitre === target.pupitre
  ));
  rolesCell.append(roleAttribute(guessedMember.roles));

  row.append(nameCell, promotionCell, pupitreCell, rolesCell);
  historyBody.prepend(row);

  if (guessedMember.name === target.name) {
    gameSolved = true;
    stopTimer();
    success.hidden = false;
  } else if (attemptsLimit > 0 && attemptsUsed >= attemptsLimit) {
    gameSolved = true;
    stopTimer();
    errorMessage.textContent = "Limite atteinte. Lancez une nouvelle partie.";
  }

  nameInput.value = "";
  selectedMemberDetails.hidden = true;
  selectedMemberDetails.replaceChildren();
  updateFilteredMemberList();
  nameInput.focus();
}

nameInput.addEventListener("input", () => {
  selectedMemberDetails.hidden = true;
  selectedMemberDetails.replaceChildren();
  updateFilteredMemberList();
});

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitGuess();
  }
});

guessButton.addEventListener("click", submitGuess);

resetButton.addEventListener("click", () => {
  startGame();
});

startButton.addEventListener("click", startGame);

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-button").forEach((modeButton) => {
      modeButton.classList.remove("selected");
    });
    button.classList.add("selected");
    applyMode(button.dataset.mode);
  });
});

function getCrossedMembers() {
  return candidateMembers.filter((member) => {
    const promotionMatches = !promotionFilter.value
      || String(member.promotion) === promotionFilter.value;
    const pupitreMatches = !pupitreFilter.value
      || member.pupitre === pupitreFilter.value;
    const roleMatches = !roleFilter.value
      || member.roles.includes(roleFilter.value);
    return promotionMatches && pupitreMatches && roleMatches;
  });
}

function updateCrossedFilter() {
  nameInput.focus();
  updateFilteredMemberList();
}

promotionFilter.addEventListener("change", updateCrossedFilter);
pupitreFilter.addEventListener("change", updateCrossedFilter);
roleFilter.addEventListener("change", updateCrossedFilter);

hintButton.addEventListener("click", () => {
  if (hintsRemaining <= 0 || gameSolved) {
    return;
  }

  let hint;
  if (hintsRemaining >= 3) {
    hint = `Promotion : ${target.promotion}`;
  } else if (hintsRemaining === 2) {
    hint = `Pupitre : ${target.pupitre}`;
  } else {
    hint = `Rôle disponible : ${target.roles[0]}`;
  }
  hintsRemaining -= 1;
  hintText.textContent = hint;
  hintButton.hidden = hintsRemaining === 0;
});
