const globalState = {
  allPeople: [],
  filteredPeople: [],
  loadingData: true,
  currentFilter: '',

  radioAnd: false,
  radioOr: true,

  checkboxes: [
    {
      filter: 'java',
      description: 'Java',
      checked: true,
    },
    {
      filter: 'python',
      description: 'Python',
      checked: true,
    },
    {
      filter: 'javascript',
      description: 'JavaScript',
      checked: true,
    },
  ],
};
const globalDivPeople = document.querySelector('#divPeople');
const globalDivMain = document.querySelector('#rowPeople');
const globalDivCheckboxes = document.querySelector('#checkboxes');
const globalInputPeople = document.querySelector('#inputSearch');
const globalCheckAnd = document.querySelector('#radioAnd');
const globalCheckOr = document.querySelector('#radioOr');

async function startApp() {
  globalInputPeople.addEventListener('input', handleInputSearch);
  globalCheckAnd.addEventListener('input', handleRadioClick);
  globalCheckOr.addEventListener('input', handleRadioClick);
  renderCheckboxes();
  await fetchPeople();
  filterPeople();
}

function renderCheckboxes() {
  const { checkboxes } = globalState;

  const inputCheckboxes = checkboxes.map((checkbox) => {
    const { filter: id, description, checked } = checkbox;

    return `<label class="form-check form-check-inline">
        <input 
          id="${id}" 
          class="form-check-input"
          type="checkbox" 
          checked="${checked}"
        />
        <span>${description}</span>
      </label>`;
  });

  globalDivCheckboxes.innerHTML = inputCheckboxes.join('');

  checkboxes.forEach((checkbox) => {
    const { filter: id } = checkbox;
    const element = document.querySelector(`#${id}`);
    element.addEventListener('input', handleCheckboxClick);
  });
}
//----------------------------- função checkboxes --------------------------------

async function fetchPeople() {
  const url = 'http://localhost:3001/devs';
  const res = await fetch(url);
  const json = await res.json();

  const peopleMap = json.map((person) => {
    const { name, programmingLanguages } = person;
    const lowerCaseName = name.toLocaleLowerCase();

    return {
      ...person,
      searchName: removeAccentMarksFrom(lowerCaseName)
        .split('')
        .filter((char) => char !== ' ')
        .join(''),
      searchLanguages: getProgrammingLanguages(programmingLanguages),
    };
  });

  globalState.allPeople = [...peopleMap];
  globalState.filteredPeople = [...peopleMap];
  globalState.loadingData = false;
}
//----------------------------- função fetchPeople -------------------------------

function handleInputSearch({ target }) {
  globalState.currentFilter = target.value.toLocaleLowerCase().trim();
  filterPeople();
}
//----------------------------- função busca input -------------------------------

function handleCheckboxClick({ target }) {
  const { id, checked } = target;
  const { checkboxes } = globalState;

  const checkboxToChange = checkboxes.find(
    (checkbox) => checkbox.filter === id
  );
  checkboxToChange.checked = checked;
  filterPeople();
}
//----------------------------- função handleCheckboxClick -----------------------

function handleRadioClick({ target }) {
  const radioId = target.id;

  globalState.radioAnd = radioId === 'radioAnd';
  globalState.radioOr = radioId === 'radioOr';
  filterPeople();
}
//----------------------------- função Radio input -------------------------------

function getProgrammingLanguages(programmingLanguages) {
  return programmingLanguages
    .map((language) => language.language.toLocaleLowerCase())
    .sort();
}
//----------------------------- função getProgrammingLanguages -------------------

function removeAccentMarksFrom(text) {
  const WITH_ACCENT_MARKS = 'áãâäàéèêëíìîïóôõöòúùûüñ'.split('');
  const WITHOUT_ACCENT_MARKS = 'aaaaaeeeeiiiiooooouuuun'.split('');

  const newText = text
    .toLocaleLowerCase()
    .split('')
    .map((char) => {
      /**
       * Se indexOf retorna -1, indica
       * que o elemento não foi encontrado
       * no array. Caso contrário, indexOf
       * retorna a posição de determinado
       * caractere no array de busca
       */
      const index = WITH_ACCENT_MARKS.indexOf(char);

      /**
       * Caso o caractere acentuado tenha sido
       * encontrado, substituímos pelo equivalente
       * do array b
       */
      if (index > -1) {
        return WITHOUT_ACCENT_MARKS[index];
      }

      return char;
    })
    .join('');

  return newText;
}
//----------------------------- função removeAccentMarksFrom ------------------------------

function filterPeople() {
  const { allPeople, radioOr, currentFilter, checkboxes } = globalState;

  const filterPeopleNow = checkboxes
    .filter(({ checked }) => checked)
    .map(({ filter }) => filter)
    .sort();

  let filteredPeople = allPeople.filter(({ searchLanguages }) => {
    return radioOr === true
      ? filterPeopleNow.some((item) => searchLanguages.includes(item))
      : filterPeopleNow.join('') === searchLanguages.join('');
  });

  if (currentFilter) {
    filteredPeople = filteredPeople.filter(({ searchName }) =>
      searchName.includes(currentFilter)
    );
  }

  globalState.filteredPeople = filteredPeople;

  renderLengthPeople();
}
//----------------------------- função filterPeople ------------------------------

function renderLengthPeople() {
  const { filteredPeople } = globalState;

  const peopleToShow = filteredPeople
    .map((person) => {
      return renderPeople(person);
    })
    .join('');

  const renderedHTML = `
     <div class="devCounter">
       <h2>${filteredPeople.length} Dev(s) encontrado(s)</h2>
     
       <div class="row">
         ${peopleToShow}
       </div>
     </div>
  `;

  globalDivMain.innerHTML = renderedHTML;
}

function renderPeople(person) {
  const { name, picture, programmingLanguages } = person;
  const allLanguage = [...programmingLanguages];

  return `
    <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 " >
      <div class="card ">
      <a class="linkTitle" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample" style="text-decoration:none">
        <img class="card-img-top rounded mx-auto d-block" src="${picture}" alt="${name}" >
      </a>
        <div class="card-body">
          <h6 class="card-title">
          <a class="linkTitle" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample" style="text-decoration:none">
          ${name}
          </a>
          </h6>

          <div class="collapse" id="collapseExample">
            <div class="card card-body">
            <span class="card-text">${
              allLanguage[0].language === 'Java'
                ? `
                <img class="imgLanguage" src="./img/java.png" alt="Java"/><small class="text-muted">${allLanguage[0].experience}</small>`
                : allLanguage[0].language === 'Python'
                ? `<img class="imgLanguage" src="./img/python.png" alt="Python" /> <small class="text-muted">${allLanguage[0].experience}</small>`
                : `<img class="imgLanguage" src="./img/javascript.png" alt="JavaScript"  /><small class="text-muted">${allLanguage[0].experience}</small>`
            }  </span>

            <span class="card-text">
            ${
              allLanguage.length === 2
                ? allLanguage[1].language === 'Java'
                  ? `
                <img class="imgLanguage" src="./img/java.png" alt="Java"/><small class="text-muted">${allLanguage[1].experience}</small>`
                  : allLanguage[1].language === 'Python'
                  ? `<img class="imgLanguage" src="./img/python.png" alt="Python" /> <small class="text-muted">${allLanguage[1].experience}</small>`
                  : `<img class="imgLanguage" src="./img/javascript.png" alt="JavaScript"  /><small class="text-muted">${allLanguage[1].experience}</small>` ||
                    ''
                : ''
            }   </span>
            </div>
          </div>
       </div>
      </div>
    </div>
  `;
}

startApp();
