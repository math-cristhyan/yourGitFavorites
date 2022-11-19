export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch (endpoint)
    .then(data => data.json())
    .then(data => ({
      login: data.login,
      name: data.name,
      public_repos: data.public_repos,
      followers: data.followers,
    }))
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.table_body = document.querySelector('table tbody');
    this.load();
  }

  load() {
     this.entries = JSON.parse(localStorage.getItem
      ('@github-favorites:')) || [];

  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  delete(user) {
    const entriesFiltered = this.entries.filter(function(entry) {
      return entry.login !== user.login;
    });

    this.entries = entriesFiltered;
    this.update();
    this.save();
  }

  async add(value) {
    try {
      const userExists = this.entries.find(entry => entry.login == value);

      if(userExists) {
        throw new Error('Usuário já cadastrado nos seus favoritos')
      }
       const data = await GithubUser.search(value);

      if (data.login === undefined) {
        throw new Error('Usuário não encontrado');
      }
    
    this.entries = [data,...this.entries];
    this.update();
    this.save();

    } catch(error) {
      alert(error.message);
    }

  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super (root);

    this.tbody = this.root.querySelector('table tbody');

    this.update();
    this.onadd();
  }

  update() {
    this.removeAllTr();

    if(this.entries.length == 0) {
      console.log('oi');
      const bgHtml = this.emptyTableBackground();
      this.tbody.append(bgHtml);
    }

    this.entries.forEach(user => {
      const row = this.createRow();
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user p').textContent = `${user.name}`;
      row.querySelector('.user span').textContent = `/${user.login}`;
      row.querySelector('.repositories').textContent = `${user.public_repos}`;
      row.querySelector('.followers').textContent = `${user.followers}`;

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja apagar esse favorito?');
        if (isOk) {
          this.delete(user);
        }
      }
      this.tbody.append(row);

    })
   
  }

  removeAllTr() {
    this.table_body.querySelectorAll('tr').forEach((tr) => { tr.remove() });
    this.table_body.querySelectorAll('td').forEach((td) => { td.remove() });
    }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = 
    `
    <td class="user">
    <img src="https://github.com/maykbrito.png" alt="">
    <a href="https://github.com/maykbrito" target="_blank">
      <p>Mayk Brito</p>
      <span>/maykbrito</span>
    </a>
  </td>
  <td class="repositories">
    123
  </td>
  <td class="followers">
    1234
  </td>
  <td class="remove">
    Remover
  </td>
  `

  return tr;
  }

  onadd() {
    const button = this.root.querySelector('.input-wrapper button');
    button.addEventListener('click', () => {
      const {value} = this.root.querySelector('.input-wrapper input');
      this.add(value);
    })

    const input = document.querySelector('.input-wrapper input');
    input.addEventListener('keypress', (event) => {
      if(event.key == 'Enter') {
        this.add(input.value);
      }
    })
  }

  

  emptyTableBackground(){
    const bg = document.createElement('td');
    bg.classList.add("empty-table");
    bg.colSpan = "4";
    const htmlContent =
      `<img src="./assets/nofavorites.svg">`
    bg.innerHTML = htmlContent;
    return bg;
  }
}