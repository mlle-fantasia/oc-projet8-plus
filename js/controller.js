/**
 *
 * Dans un système de programmation MVC, le controller gère la logique du code, c'est lui qui prend des décisions.
 * C'est l'intermédiaire entre le modèle et la vue : le contrôleur va  demander au modèle les données, les analyser, prendre des décisions et renvoyer le texte à afficher à la vue.
 * C'est notamment lui qui détermine si le visiteur a le droit de voir la page ou non (gestion des droits d'accès, ici pas de gestion de droit).
 *
 * @module Controller
 *
 */
(function (window) {
	("use strict");

	/**
	 *
	 * Prend une instance de model et une instance de vue en paramettre et agi comme un controlleur entre les deux.
	 * C'est à dire que c'est lui qui va appeler les méthodes de la view et du model pour les mettre à jour
	 *
	 * @constructor
	 * @param {object} model  l'instance de model
	 * @param {object} view  l'instance de vue
	 * @memberOf module:Controller
	 *
	 */
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;

		self.view.bind("newTodo", function (data) {
			self.addItem(data);
		});

		self.view.bind("itemEdit", function (item, type) {
			self.editItem(item.id, type);
		});

		self.view.bind("itemEditDone", function (item, type) {
			console.log("itemEditDone type : ", type);
			self.editItemSave(item.id, item.title, type);
		});

		self.view.bind("itemEditCancel", function (item, type) {
			self.editItemCancel(item.id, type);
		});

		self.view.bind("itemRemove", function (item, type) {
			self.removeItem(item.id, type);
		});

		self.view.bind("itemToggle", function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind("removeCompleted", function () {
			self.removeCompletedItems();
		});

		/* 		self.view.bind("toggleAll", function (status) {
			self.toggleAll(status.completed);
		}); */
	}

	/**
	 *
	 * Point d'entrée de l'application, elle reçoit la route demandé en paramettre et appelle d'autres fonctions pour afficher la page
	 *
	 * @param {string} locationHash la route demandée : '' | 'active' | 'completed'
	 */
	Controller.prototype.setView = function (locationHash) {
		var self = this;

		var tabroute = locationHash.split("/");
		var route = tabroute[1];
		var page = route || "";
		var list_id = "";
		if (tabroute[2]) list_id = tabroute[2];

		this._updateFilterState(page, list_id);
	};

	/**
	 * lit toutes les todos existantes et les envoie à la vue
	 *
	 *
	 */
	Controller.prototype.showAll = function (list_id) {
		var self = this;

		if (list_id) {
			self.model.read(
				list_id,
				function (data) {
					let data2 = {
						titleList: data[0].title,
						type: "todos",
						data: data[0].todos,
					};
					if (data[0].date) data2.dateList = data[0].date;
					self.view.render("showEntries", data2);
					self.view.bind("date", function (item) {
						console.log("item date change", item);
						self.model.update(parseInt(item.id), "lists", { date: item.date, listCopiee: "false" }, function () {});
					});
				},
				"lists"
			);
		} else {
			self.model.read(
				function (data) {
					let data2 = {
						type: "todos",
						data: data,
					};
					self.view.render("showEntries", data2);
					self.view.bind("toggleAll", function (status) {
						self.toggleAll(status.completed);
					});
				},
				{},
				"todos"
			);
		}
	};

	/**
	 * lit toutes les todos actives et les affiche
	 *
	 */
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read(
			{ completed: false },
			function (data) {
				let data2 = {
					type: "todos",
					data: data,
				};

				self.view.render("showEntries", data2);
			},
			"todos"
		);
	};

	/**
	 * lit toutes les todos completed et les affiche
	 *
	 */
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read(
			{ completed: true },
			function (data) {
				let data2 = {
					type: "todos",
					data: data,
				};
				self.view.render("showEntries", data2);
			},
			"todos"
		);
	};

	/**
	 * lit toutes les todos existantes et les affiche
	 *
	 *
	 */
	Controller.prototype.showLists = function () {
		var self = this;
		self.model.read(
			function (data) {
				let data2 = {
					type: "lists",
					data: data,
				};
				self.view.render("showEntries", data2);
			},
			{},
			"lists"
		);
	};

	/**
	 * crée une nouvelle todo, vide le champs titre et filtre les todos (avec this._filter)
	 * Si le titre est vide, la todo n'est pas ajoutée
	 *
	 * @param {string} title Le titre de la todo
	 */
	Controller.prototype.addItem = function (data) {
		var self = this;
		console.log("controller.addItem data", data);
		if (data.title.trim() === "") {
			return;
		}

		self.model.create(data, function () {
			self.view.render("clearNewTodo");
			self._filter(true);
		});
	};

	/**
	 * mettre la todo en mode édition : lit la todo dans le model et transmet les infos à la vue pour qu'elle passe en mode edition
	 *
	 * @param {number} id L'id de la todo qui doit être éditée
	 */
	Controller.prototype.editItem = function (id, type) {
		var self = this;
		if (Number.isInteger(parseInt(type))) {
			self.model.read(
				type,
				function (data) {
					let todoToEdit;
					for (let i = 0; i < data[0].todos.length; i++) {
						const todo = data[0].todos[i];
						console.log("todo.id, id", todo.id, id);
						if (todo.id === id) {
							todoToEdit = todo;
							break;
						}
					}
					console.log("todoToEdit", todoToEdit);
					self.view.render("editItem", { id: todoToEdit.id, title: todoToEdit.title });
				},
				"lists"
			);
		} else {
			self.model.read(
				id,
				function (data) {
					self.view.render("editItem", { id: id, title: data[0].title });
				},
				type
			);
		}
	};

	/**
	 * Met à jour une todo avec un nouveau titre, si le nouveau titre est vide, la todo est supprimée
	 *
	 * @param {number} id L'id de la todo
	 * @param {string} title le nouveau titre de la todo
	 */
	Controller.prototype.editItemSave = function (id, title, type) {
		var self = this;
		title = title.trim();
		console.log("controller.edititemSave type : ", type);
		if (title.length !== 0) {
			self.model.read(
				id,
				function (data) {
					self.model.update(id, type, { title: title }, function () {
						let item = { id: id, title: title };
						if (data[0].date) item.date = data[0].date;
						console.log("data[0].date", data[0].date);
						self.view.render("editItemDone", item);
					});
				},
				type
			);
		} else {
			self.removeItem(id, type);
		}
	};

	/**
	 * Cancels the item editing mode.
	 *
	 * @param {number} id L'id de la todo
	 */
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(
			id,
			function (data) {
				self.view.render("editItemDone", { id: id, title: data[0].title });
			},
			"todos"
		);
	};

	/**
	 *
	 * Supprime une todo du DOM et du localstorage
	 *
	 * @param {number} id L'id de la todo
	 */
	Controller.prototype.removeItem = function (id, type) {
		var self = this;

		self.model.remove(
			id,
			function () {
				self.view.render("removeItem", id);
			},
			type
		);

		self._filter();
	};

	/**
	 *
	 * Supprime toutes les todos "completed" du DOM et du localstorage
	 *
	 */
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		self.model.read(
			{ completed: true },
			function (data) {
				data.forEach(function (item) {
					self.removeItem(item.id, "todos");
				});
			},
			"todos"
		);

		self._filter();
	};

	/**
	 *
	 * Met à jour le statut completed ou non d'une todo dans le localstorage et dans la vue
	 *
	 *
	 * @param {number} id l'id de la todo à changer de statut
	 * @param {boolean} completed statut de la todo 'completed' ou non
	 * @param {boolean|undefined} silent si undefined re-filtre les todos
	 */
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		self.model.update(id, "todos", { completed: completed }, function () {
			self.view.render("elementComplete", {
				id: id,
				completed: completed,
			});
		});

		if (!silent) {
			self._filter();
		}
	};

	/**
	 * Met à jour les todos toutes à "completed" ou toutes à "active"
	 *
	 * @param {boolean} completed false si certaines todos "completed" et d'autres non ou toutes non | true si toutes "completed"
	 */
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		self.model.read(
			{ completed: !completed },
			function (data) {
				console.log("data", data);
				data.forEach(function (item) {
					self.toggleComplete(item.id, completed, true);
				});
			},
			"todos"
		);

		self._filter();
	};

	/**
	 *
	 * Met à jour les élements de la page en fonction du nomdre de todo (les éléments qui se trouvent dans le footer) :
	 * - le nombre de todo restante active, <br>
	 * - s'il faut afficher ou non le bouton pour effecer les todos completed<br>
	 * - la checkbox "mettre toutes les todo à completed" cochée ou pas cochée
	 * - afficher le block des todos ou pas
	 *
	 */
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render("updateElementCount", todos.active);
			self.view.render("clearCompletedButton", {
				completed: todos.completed,
				visible: todos.completed > 0,
			});

			self.view.render("toggleAll", { checked: todos.completed === todos.total });
			//self.view.render("contentBlockVisibility", { visible: todos.total > 0 });
		});
	};

	/**
	 *
	 * Filtre les todos en fonction de la route : <br>
	 * met à jour les éléments de la page (les éléments qui se trouvent dans le footer) <br>
	 * si la dernière active route n'est pas all ou que la route à changé, on met à jour la vue avec les bonnes todos
	 *
	 * @param {boolean|undefined} force  forces la mise à jour ds todos.
	 */
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);
		// Update the elements on the page, which change with each completed todo
		this._updateCount();

		// If the last active route isn't "All", or we're switching routes, we
		// re-create the todo item elements, calling:
		//   this.show[All|Active|Completed]();
		if (force || this._lastActiveRoute !== "All" || this._lastActiveRoute !== activeRoute) {
			if (this._listId) {
				this.showAll(this._listId);
			} else {
				this["show" + activeRoute]();
			}
		}

		this._lastActiveRoute = activeRoute;
	};

	/**
	 * Enregistre une référence de la route active qui servira à filtrer les todos par active ou completed <br>
	 * et Met à jour le filtre demandé dans la vue
	 *
	 * @param {string} currentPage  la route active : '' | 'active' | 'completed'
	 *
	 */
	Controller.prototype._updateFilterState = function (currentPage, list_id) {
		// Store a reference to the active route, allowing us to re-filter todo
		// items as they are marked complete or incomplete.
		var self = this;
		this._activeRoute = currentPage;
		this._listId = list_id ? list_id : "";

		if (currentPage === "") {
			this._activeRoute = "All";
		}
		console.log("coucou");
		self.model.read(
			function (lists) {
				console.log("lists", lists);
				for (let i = 0; i < lists.length; i++) {
					const list = lists[i];
					let dateNow = new Date();
					dateNow.setHours(0, 0, 0, 0);
					list.date = new Date(list.date);
					if (list.date) list.date.setHours(0, 0, 0, 0);
					if (list.date && list.listCopiee === "false" && list.date.getTime() === dateNow.getTime()) {
						console.log("list", list);
						for (let i = 0; i < list.todos.length; i++) {
							const todo = list.todos[i];
							todo.type = "todos";
							self.addItem(todo);
						}
						self.model.update(list.id, "lists", { listCopiee: "true" }, function () {});
					}
				}
			},
			{},
			"lists"
		);

		this._filter();
		if (currentPage !== "lists") {
			this.view.render("setFilter", currentPage);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);
