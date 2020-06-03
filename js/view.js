/*global qs, qsa, $on, $parent, $delegate */
/**
 *
 * Dans un système de programmation MVC, la vue se concentre sur l'affichage. Elle ne fait presque aucun calcul et se contente de récupérer des variables pour savoir ce qu'elle
 * doit afficher.
 *
 * @module View
 *@memberOf module:View
 */

(function (window) {
	("use strict");

	/**
	 * La vue agi sur le DOM et affiche ce que lui demande le controller.<br>
	 * elle a deux points d'entrée :
	 *
	 *
	 *   - bind(event, handler)
	 *     Agi différement en fonction de l'event et exécute le handler
	 *   - render(command, parameterObject)
	 *     Affiche l'élément demandé dans command avec les options transmises dans parameterObject
	 *
	 * @constructor
	 * @param {object} template L'instance de template
	 * @memberOf module:View
	 */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs(".todo-list");
		this.$todoItemCounter = qs(".todo-count");
		this.$clearCompleted = qs(".clear-completed");
		this.$main = qs(".main");
		this.$footer = qs(".footer");
		this.$toggleAll = qs(".toggle-all");
		this.$newTodo = qs("#new-todo");
		this.$newDate = qs(".new-date");
		//this.$newTodo = qs(".new-todo");
		//this.$newList = qs(".new-list");
		this.$additem = qs(".add-item");
		this.$labelNewTodo = qs(".label-new-todo");
		this.$title = qs(".title");
		this.$sectionToggleAll = qs(".section-toggle-all");
		this.$btnShowList = qs(".btn-show-list");
		this.$todoCount = qs(".todo-count");
		this.$filters = qs(".filters");
		this.$item = qs(".item");
	}
	/**
	 * Supprime une todo. récupère l'élément du DOM qui a un data attribut "data-id" égale à "id" passé en paramettre <br>
	 * si l'élément existe bien, il est supprimé
	 *
	 * @param {number} id l'id de la todo.
	 *
	 */
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? "block" : "none";
	};

	/**
	 * Met à jour le filtre des todo qui se trouve dans le footer en fonction de la route reçue en paramettre
	 *
	 * @param {string} currentPage  la route  : '' | 'active' | 'completed'
	 *
	 */
	View.prototype._setFilter = function (currentPage) {
		qs(".filters .selected").className = "";
		qs('.filters [href="#/' + currentPage + '"]').className = "selected";
	};

	/**
	 * Récupère l'élément du DOM qui a un data attribut "data-id" égale à "id" passé en paramettre et si l'élément existe,
	 * change sa classe et son statut
	 *
	 * @param {number} id  id de la todo
	 * @param {boolean} completed statut completed ou non de la todo
	 *
	 */
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? "completed" : "";

		// In case it was toggled from an event and not by clicking the checkbox
		qs("input", listItem).checked = completed;
	};

	/**
	 * Récupère l'élément du DOM qui a un data attribut "data-id" égale à "id" passé en paramettre et si l'élément existe,
	 * met la todo en mode édition : ajoute une classe et crée un élément input avec le focus
	 *
	 * @param {number} id  id de la todo
	 * @param {string} title titre de la todo
	 *
	 */
	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + " editing";

		var input = document.createElement("input");
		input.className = "edit";

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	 * Récupère l'élément du DOM qui a un data attribut "data-id" égale à "id" passé en paramettre et si l'élément existe,
	 * met la todo en mode lecture : change la classe et supprime l'élément input avec le focus
	 *
	 * @param {number} id  id de la todo
	 * @param {string} title titre de la todo
	 *
	 */
	View.prototype._editItemDone = function (id, title, date) {
		console.log("id, title, date", id, title, date);
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs("input.edit", listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace("editing", "");

		let titletxt = title;
		if (date) titletxt += "<span class='date-list'>  Pour le : " + date + "</span>";

		qsa("label", listItem).forEach(function (label) {
			label.innerHTML = titletxt;
		});
	};

	/**
	 *
	 * Affiche un élément de la page en fonction de viewCmd
	 *
	 * @param {string} viewCmd  Nom de l'event : 'showEntries' | 'removeItem' | 'updateElementCount' | 'clearCompletedButton' | 'contentBlockVisibility' | 'toggleAll' |
	 *  'setFilter' | 'clearNewTodo' | 'elementComplete' | 'editItem' | 'editItemDone'
	 * @param {object} parameter Options pour l'affichage
	 *
	 */
	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			showEntries: function () {
				var objData = self.template.getDataToShow(parameter);
				self.$todoList.innerHTML = objData.todoList;
				self.$newTodo.placeholder = objData.inputNew;
				//self.$newTodo.className = objData.newTodo;
				self.$labelNewTodo.innerHTML = objData.inputNew;
				self.$title.innerHTML = parameter.titleList ? parameter.titleList : objData.title;
				self.$sectionToggleAll.innerHTML = objData.toggleAll;
				self.$clearCompleted.innerHTML = objData.clearCompleted;
				self.$btnShowList.innerHTML = objData.btnShowList;
				self.$todoCount.innerHTML = objData.todoCount;
				self.$filters.innerHTML = objData.filters;
			},
			removeItem: function () {
				self._removeItem(parameter);
			},
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? "block" : "none";
			},
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			setFilter: function () {
				self._setFilter(parameter);
			},
			clearNewTodo: function () {
				self.$newTodo.value = "";
			},
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title, parameter.date);
			},
		};

		viewCommands[viewCmd]();
	};
	/**
	 *
	 *
	 *
	 * @param {object} element un element du DOM
	 *
	 */
	View.prototype._itemId = function (element) {
		var li = $parent(element, "li");
		return parseInt(li.dataset.id, 10);
	};

	/**
	 *
	 * Passe les todos en mode lecture, sur l'event blur et le keypress de la touche entrer
	 *
	 * @param {function} handler callback
	 *
	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, "li .edit", "blur", function () {
			let type = document.location.hash === "" || document.location.hash.split("/")[1] !== "lists" ? "todos" : "lists";
			if (type === "lists" && document.location.hash.split("/")[2]) type = document.location.hash.split("/")[2];
			if (!this.dataset.iscanceled) {
				handler(
					{
						id: self._itemId(this),
						title: this.value,
					},
					type
				);
			}
		});

		$delegate(self.$todoList, "li .edit", "keypress", function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	/**
	 *
	 * Passe les todos en mode lecture, sur l'event keyup de la touche escape
	 *
	 * @param {function} handler callback
	 *
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, "li .edit", "keyup", function (event) {
			let type = document.location.hash === "" || document.location.hash.split("/")[1] !== "lists" ? "todos" : "lists";
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({ id: self._itemId(this) }, type);
			}
		});
	};

	/**
	 *
	 * En fonction de l'event passé en parmettre, le programme va agir sur différent évènement élément du DOM et exécuter la fonction handler
	 *
	 * @param {string} event L'event : 'newTodo' | 'removeCompleted' | 'toggleAll' | 'itemEdit' | 'itemRemove' | 'itemToggle' | 'itemEditDone' | 'itemEditCancel'
	 * @param {function} handler Callback
	 *
	 */
	View.prototype.bind = function (event, handler) {
		var self = this;
		if (event === "newTodo") {
			$on(self.$newTodo, "keyup", function (event) {
				if (event.keyCode === self.ENTER_KEY) {
					let type = document.location.hash === "" || document.location.hash.split("/")[1] !== "lists" ? "todos" : "lists";
					if (type === "lists" && document.location.hash.split("/")[2]) type = document.location.hash.split("/")[2];
					console.log("view.bind.newTodo type : ", type);
					let data = {
						type: type,
						title: self.$newTodo.value,
					};
					if (qs(".new-date")) data.date = qs(".new-date").value;
					handler(data);
				}
			});
			$on(self.$additem, "click", function () {
				let type = document.location.hash === "" || document.location.hash.split("/")[1] !== "lists" ? "todos" : "lists";
				if (type === "lists" && document.location.hash.split("/")[2]) type = document.location.hash.split("/")[2];
				let data = {
					type: type,
					title: self.$newTodo.value,
				};
				if (qs(".new-date")) data.date = qs(".new-date").value;
				handler(data);
			});
		} else if (event === "removeCompleted") {
			$on(self.$clearCompleted, "click", function () {
				handler();
			});
		} else if (event === "toggleAll") {
			console.log("toggleAll", document.querySelector("#toggle-all"));
			/* qs(".toggle-all").addEventListener("click", function () {
				console.log("coucou");
			}); */
			$on(qs(".toggle-all"), "click", function () {
				console.log("this.checked", this.checked);
				handler({ completed: this.checked });
			});
		} else if (event === "itemEdit") {
			$delegate(self.$todoList, "li label", "dblclick", function () {
				let type = document.location.hash === "" || document.location.hash.split("/")[1] !== "lists" ? "todos" : "lists";
				if (type === "lists" && document.location.hash.split("/")[2]) type = document.location.hash.split("/")[2];
				handler({ id: self._itemId(this) }, type);
			});
		} else if (event === "itemRemove") {
			$delegate(self.$todoList, ".destroy", "click", function () {
				let type = document.location.hash === "" || document.location.hash.split("/")[1] !== "lists" ? "todos" : "lists";
				if (type === "lists" && document.location.hash.split("/")[2]) type = document.location.hash.split("/")[2];
				handler({ id: self._itemId(this) }, type);
			});
		} else if (event === "itemToggle") {
			$delegate(self.$todoList, ".toggle", "click", function () {
				handler({
					id: self._itemId(this),
					completed: this.checked,
				});
			});
		} else if (event === "itemEditDone") {
			self._bindItemEditDone(handler);
		} else if (event === "itemEditCancel") {
			self._bindItemEditCancel(handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
})(window);
