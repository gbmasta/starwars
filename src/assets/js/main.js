export class BugabooTest {

	constructor() {
		this.pilots = Array();
		this.currentPilots = Array();
		this.mainTable = document.querySelector('#mainTable');
		this.filterField = document.querySelector('form input');
		this.sortField = document.querySelector('form select');
	}

	handleError(response) {
		if (!response.ok) {
			this.mainTable.replaceChildren(response);
			return Promise.reject(response);
		} else {
			return response;
		}
	} //handler function that throws any encountered error

	uniqueFilterFunction(value, index, self) {
		return self.indexOf(value) === index;
	}

	getSiblings(elem) {
		return Array.prototype.filter.call(elem.parentNode.children, function(sibling) {
			return sibling !== elem;
		});
	}

	attachEvents() {
		this.filterField.addEventListener('input', (event) => {
			this.filterPilots();
		});

		this.sortField.addEventListener('change', (event) => {
			this.filterPilots();
		});

		window.addEventListener('hashchange', (event) => {
			this.loadPage();
		});
	}

	loadPage() {
		const pageId = location.hash.split("/");
		const elem = document.querySelector(pageId[0]);
		elem.classList.replace('d-none', 'd-block');
		if (elem.dataset.callback) {
			this[elem.dataset.callback]();

		}

		this.getSiblings(elem).forEach(el => {
			el.classList.add('d-none');
			el.classList.remove('d-block');
		});
	}

	filterPilots() {
		const filterValue = this.filterField.value;
		console.log(filterValue);
		if (filterValue.length > 0) {
			this.currentPilots = this.pilots.filter(pilot => pilot.name.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1);
		} else {
			this.currentPilots = this.pilots;
		}

		const sortValue = this.sortField.value;
		console.log(sortValue);
		if (sortValue != 0) {
			this.currentPilots.sort((a, b) => {
				if (sortValue.includes('.')) {
					let values = sortValue.split('.');

					a = a[values[0]];
					a = a[values[1]];
					b = b[values[0]];
					b = b[values[1]];

				} else {
					a = a[sortValue];
					b = b[sortValue];
				}

				if (a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				if (a.toLowerCase() > b.toLowerCase()) {
					return 1;
				}
				return 0;
			});
		}
		this.updateTable();
	}

	getId(url) {
		const tokens = url.split("/");
		return parseInt(tokens[tokens.length - 2], 10);
	}

	async fetchIds(url, ids, filterFunc = (item) => true) {
		const operations = [];
		ids.forEach((id) =>
			operations.push(fetch(`${url}${id}/`).then(this.handleError).then((res) => res.json()))
		);
		const res = await Promise.all(operations);
		return res.filter(filterFunc).reduce((acc, item) => {
			const id = this.getId(item.url);
			acc[id] = item;
			return acc;
		}, {});
	}

	fetchAll(url) {
		return new Promise((resolve, reject) => {
			let data = [];
			const fetchData = (url) => {
				fetch(url).then(this.handleError).then((res) => {
					return res.json().then((page) => {
						data = page.results ? [...data, ...page.results] : data;
						page.next ?
							fetchData(page.next) : resolve(data);
					});
				}).catch((response) => {
					this.handleError(response);

				});
			};
			fetchData(url);
		});
	}

	async initApp() {

		if (!location.hash) {
			location.hash = "#home";
		}

		this.loadPage();

		this.attachEvents();

		this.pilots = await this.fetchAll("https://swapi.dev/api/people/");
		//console.log("people", pilots);


		// map pilots to planetIds, unique
		const planetIds = Object.values(this.pilots)
			.map((pilot) => this.getId(pilot.homeworld))
			.filter(this.uniqueFilterFunction);

		let planets = await this.fetchIds(
			"https://swapi.dev/api/planets/",
			planetIds
		);

		this.pilots.forEach(pilot => {
			pilot.id = this.getId(pilot.url);
			pilot.planet = planets[this.getId(pilot.homeworld)];

		});

		//console.log("people", pilots);

		this.currentPilots = this.pilots;
		this.updateTable();
		this.updatePeople();

		this.filterField.disabled = false;
		this.sortField.disabled = false;
	}

	updateTable() {
		//console.log(pilots);
		const pilotsRows = Object.values(this.currentPilots)
			.map((pilot) => {

				var tr = document.createElement('tr');
				tr.innerHTML = '' +
					'<td><a href="#people/' + pilot.id + '/">' + pilot.name + '</a></td>' +
					'<td>' + pilot.birth_year + '</td>' +
					'<td>' + pilot.planet.name + '</td>';
				return tr;
			});

		this.mainTable.getElementsByTagName('tbody')[0].replaceChildren(...pilotsRows);
	}

	updatePeople() {
		if (this.pilots.length > 0 && this.getId(location.hash)) {
			const pilot = this.pilots.find(x => x.id === this.getId(location.hash));
			//console.log(this.pilots);
			//console.log(pilot);
			Array('name', 'gender', 'height', 'planet.name', 'planet.residents').forEach(property => {
				let value;
				if (property.includes('.')) {
					let properties = property.split('.');
					value = pilot[properties[0]];
					value = value[properties[1]];
				} else {
					value = pilot[property];
				}
				//console.log(property +" "+ value);
				if (Array.isArray(value)) {
					const pilotsRows = Object.values(value)
						.map((url) => {
							var span = document.createElement('span');
							if (pilot.id != this.getId(url)) {
								const neighbour = this.pilots.find(x => x.id === this.getId(url));
								span.innerHTML = '' +
									'<a href="#people/' + neighbour.id + '/">' + neighbour.name + '</a> , ';

							}
							return span;
						});
					value = pilotsRows;
					document.querySelector('[data-bind="' + property + '"]').replaceChildren(...pilotsRows);
				} else
					document.querySelector('[data-bind="' + property + '"]').textContent = value;
			})
		}
	}
}