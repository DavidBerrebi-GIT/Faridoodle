let PUPITRES = [];
let ROLES = [];
let members = [];

const nameInput = document.querySelector("#name-input");
const suggestions = document.querySelector("#suggestions");
const guessButton = document.querySelector("#guess-button");
const historyBody = document.querySelector("#history-body");
const errorMessage = document.querySelector("#error-message");
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
const menuButton = document.querySelector("#menu-button");
const entryFilter = document.querySelector("#entry-filter");
const gameResult = document.querySelector("#game-result");
const gameResultMessage = document.querySelector("#game-result-message");
const revealButton = document.querySelector("#reveal-button");
const revealedTarget = document.querySelector("#revealed-target");
const promotionFilter = document.querySelector("#promotion-filter");
const pupitreFilter = document.querySelector("#pupitre-filter");
const roleFilter = document.querySelector("#role-filter");
const selectedMemberDetails = document.querySelector("#selected-member-details");
const filteredMemberList = document.querySelector("#filtered-member-list");
const filteredMemberCount = document.querySelector("#filtered-member-count");
const dataStatus = document.querySelector("#data-status");

let target = null;
let gameSolved = false;
let candidateMembers = [...members];
let attemptsUsed = 0;
let attemptsLimit = 0;
let hintsRemaining = 0;
let secondsRemaining = 0;
let timerId = null;
let selectedMode = "easy";
let selectedSuggestion = -1;

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("Le fichier CSV ne contient aucune entrée.");
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const entries = [];

  lines.slice(1).forEach((line, index) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, column) =>
      [header, (values[column] || "").trim()]
    ));

    if (!row.name || !row.promotion || !row.pupitre) {
      throw new Error(`Ligne CSV ${index + 2} incomplète.`);
    }

    entries.push({
      name: row.name,
      promotion: Number(row.promotion),
      pupitre: row.pupitre,
      roles: (row.roles || "")
        .split(";")
        .map((role) => role.trim())
        .filter(Boolean)
    });
  });

  return entries;
}

async function loadMembers() {
  const response = await fetch("data/csv/members.csv");
  if (!response.ok) {
    throw new Error(`Impossible de charger le CSV (${response.status}).`);
  }

  const entries = parseCsv(await response.text());
  const names = new Set();

  entries.forEach((entry) => {
    if (!Number.isFinite(entry.promotion)) {
      throw new Error(`Promotion invalide pour ${entry.name}.`);
    }
    if (names.has(normalized(entry.name))) {
      throw new Error(`Nom en double : ${entry.name}.`);
    }
    names.add(normalized(entry.name));
  });

  members = entries;
  candidateMembers = [...members];
  PUPITRES = [...new Set(members.map((member) => member.pupitre))]
    .sort((first, second) => first.localeCompare(second, "fr"));
  ROLES = [...new Set(members.flatMap((member) => member.roles))]
    .sort((first, second) => first.localeCompare(second, "fr"));
}

function populateOptions() {
  promotionFilter.replaceChildren(
    new Option("Toutes les promotions", "")
  );
  pupitreFilter.replaceChildren(
    new Option("Tous les pupitres", "")
  );
  roleFilter.replaceChildren(
    new Option("Tous les rôles", "")
  );

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
  return members.find((member) => normalized(member.name) === normalized(name));
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

function updateNameSuggestions() {
  const query = normalized(nameInput.value);
  const matches = query
    ? candidateMembers
        .filter((member) => normalized(member.name).includes(query))
        .sort((first, second) => first.name.localeCompare(second.name, "fr"))
    : [];

  suggestions.replaceChildren();
  selectedSuggestion = -1;
  nameInput.setAttribute("aria-expanded", matches.length ? "true" : "false");

  matches.slice(0, 8).forEach((member, index) => {
    const item = document.createElement("li");
    item.id = `suggestion-${index}`;
    item.role = "option";
    item.dataset.memberName = member.name;
    item.textContent = member.name;

    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      chooseSuggestion(member.name);
    });

    suggestions.append(item);
  });

  suggestions.hidden = matches.length === 0;
}

function chooseSuggestion(name) {
  nameInput.value = name;
  suggestions.hidden = true;
  nameInput.setAttribute("aria-expanded", "false");
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

  const arrow = promotion < target.promotion ? "↑" : "↓";
  const span = attribute(`${promotion} ${arrow}`, false);
  return span;
}

function nameAttribute(name) {
  if (normalized(name) === normalized(target.name)) {
    return attribute(name, true);
  }

  const comparison = name.localeCompare(target.name, "fr", {
    sensitivity: "base"
  });
  const arrow = comparison < 0 ? "↑" : "↓";
  return attribute(`${name} ${arrow}`, false);
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

function showGameResult(won, message) {
  gameSolved = true;
  stopTimer();
  gameResultMessage.textContent = message;
  revealButton.hidden = won;
  revealedTarget.hidden = true;
  revealedTarget.textContent = "";
  gameResult.hidden = false;
  gameResult.className = won ? "success" : "failure";
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
      showGameResult(false, "Temps écoulé.");
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
  gameResult.hidden = true;
  gameResult.className = "success";
  revealButton.hidden = true;
  revealedTarget.hidden = true;
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

startButton.disabled = true;

loadMembers()
  .then(() => {
    populateOptions();
    applyMode("easy");
    dataStatus.textContent = `${members.length} membres chargés depuis le CSV.`;
    dataStatus.className = "";
    startButton.disabled = false;
  })
  .catch((error) => {
    dataStatus.textContent = error.message;
    dataStatus.className = "error";
    startButton.disabled = true;
  });

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
    showGameResult(true, "Vous avez trouvé le membre mystère !");
  } else if (attemptsLimit > 0 && attemptsUsed >= attemptsLimit) {
    showGameResult(false, "Limite atteinte.");
  }

  nameInput.value = "";
  selectedMemberDetails.hidden = true;
  selectedMemberDetails.replaceChildren();
  suggestions.hidden = true;
  nameInput.setAttribute("aria-expanded", "false");
  updateFilteredMemberList();
  nameInput.focus();
}

nameInput.addEventListener("input", () => {
  selectedMemberDetails.hidden = true;
  selectedMemberDetails.replaceChildren();
  updateNameSuggestions();
  updateFilteredMemberList();
});

nameInput.addEventListener("blur", () => {
  suggestions.hidden = true;
  nameInput.setAttribute("aria-expanded", "false");
});

nameInput.addEventListener("keydown", (event) => {
  const items = [...suggestions.querySelectorAll("li")];

  if (event.key === "ArrowDown" && items.length) {
    event.preventDefault();
    selectedSuggestion = (selectedSuggestion + 1) % items.length;
  } else if (event.key === "ArrowUp" && items.length) {
    event.preventDefault();
    selectedSuggestion = (selectedSuggestion - 1 + items.length) % items.length;
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (selectedSuggestion >= 0) {
      chooseSuggestion(items[selectedSuggestion].dataset.memberName);
      return;
    }
    submitGuess();
  } else if (event.key === "Escape") {
    suggestions.hidden = true;
    nameInput.setAttribute("aria-expanded", "false");
  } else {
    return;
  }

  items.forEach((item, index) => {
    item.setAttribute("aria-selected", String(index === selectedSuggestion));
  });
});

guessButton.addEventListener("click", submitGuess);

resetButton.addEventListener("click", () => {
  startGame();
});

menuButton.addEventListener("click", () => {
  stopTimer();
  gameSolved = false;
  gameArea.hidden = true;
  setup.hidden = false;
  gameResult.hidden = true;
  revealedTarget.hidden = true;
  errorMessage.textContent = "";
  nameInput.value = "";
  suggestions.hidden = true;
  nameInput.setAttribute("aria-expanded", "false");
  setup.scrollIntoView({ behavior: "smooth", block: "start" });
});

revealButton.addEventListener("click", () => {
  revealedTarget.textContent =
    `${target.name} - ${target.promotion} - ${target.pupitre} - ${target.roles.join(", ")}`;
  revealedTarget.hidden = false;
  revealButton.hidden = true;
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
  updateNameSuggestions();
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
