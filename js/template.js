/**
 *
 *
 *blabla template
 * @module Template
 *
 *
 *
 */
(function (window) {
	("use strict");

	var htmlEscapes = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#x27;",
		"`": "&#x60;",
	};

	var escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	var reUnescapedHtml = /[&<>"'`]/g;
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
		return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
	};

	/**
	 * Sets up defaults for all the Template methods such as a default template
	 *
	 * @constructor
	 * @memberOf module:Template
	 */
	function Template() {
		this.todoTemplate =
			'<li data-id="{{id}}" class="item {{completed}}">' +
			'<div class="view">' +
			'<input class="toggle" type="checkbox" {{checked}}>' +
			"<label>{{title}}</label>" +
			'<button class="destroy"></button>' +
			"</div>" +
			"</li>";

		this.listTemplate =
			'<li data-id="{{id}}" class="item">' +
			'<div class="view">' +
			"<label>{{title}} <span class='date-list'>{{date}}</span> </label>" +
			'<a href="#/lists/{{link-id}}" class="edit-list"></a>' +
			'<button class="destroy"></button>' +
			"</div>" +
			"</li>";
	}

	/**
	 * Crée une <li> HTML string et la retourne.
	 *
	 * NOTE: Normalement, il faut utiliser un moteur de template tel que Mustache ou Handlebar, mais, ce projet est un exemple en vanilla JS.
	 *
	 * @param {array} data array de todo à afficher
	 * @returns {string} HTML String <li>
	 *
	 * @example
	 * view.show({
	 *	id: 1,
	 *	title: "Hello World",
	 *	completed: 0,
	 * });
	 */
	Template.prototype.show = function (data) {
		var view = "";
		if (data.type === "lists") {
			for (var i = 0; i < data.data.length; i++) {
				var list = data.data[i];
				var template = this.listTemplate;

				template = template.replace("{{id}}", list.id);
				template = template.replace("{{link-id}}", list.id);
				template = template.replace("{{title}}", escape(list.title));
				if (list.date) template = template.replace("{{date}}", " Pour le : " + list.date);
				else template = template.replace("{{date}}", "");

				view = view + template;
			}
		} else {
			for (var i = 0; i < data.data.length; i++) {
				var todo = data.data[i];
				var template = this.todoTemplate;
				var completed = "";
				var checked = "";

				if (todo.completed) {
					completed = "completed";
					checked = "checked";
				}

				template = template.replace("{{id}}", todo.id);
				template = template.replace("{{title}}", escape(todo.title));
				template = template.replace("{{completed}}", completed);
				template = template.replace("{{checked}}", checked);

				view = view + template;
			}
		}

		return view;
	};

	/**
	 *
	 * Retourne un objet avec les données à afficher sur la vue en fonction si on affiche les todos ou les listes
	 *
	 * @param {array} data array de todo
	 * @returns {object} objData = {
			title: "",
			newTodo:"",
			toggleAll: "",
			inputNew: "",
			clearCompleted: "",
			todoList: "",
			filters: "",
			btnShowList: "",
			todoCount: "",
		};
	 *
	 */
	Template.prototype.getDataToShow = function (data) {
		var date = new Date();
		var objData = {
			title: "",
			newTodo: "",
			toggleAll: "",
			inputNew: "",
			clearCompleted: "",
			todoList: this.show(data),
			filters: "",
			btnShowList: "",
			todoCount: "",
		};
		if (data.type === "lists") {
			objData.title = "Les listes";
			objData.newTodo = "new-list";
			objData.inputNew = "Ajouter un liste";
			objData.toggleAll =
				'<label class="label-date" for="date">Date : </label>' +
				'<input class="new-date" type="date" id="start" name="trip-start" value=' +
				date +
				">";
			objData.btnShowList = '<a href="#/">Les todos</a>';
		} else {
			objData.title = "Todos";
			objData.newTodo = "new-todo";
			objData.inputNew = "Que devez-vous faire ?";
			objData.toggleAll =
				'<label class="container" for="toggle-all">Marquer toutes les todos à faites' +
				'<input class="toggle-all" id="toggle-all" type="checkbox">' +
				'<span class="toggle-all checkmark"></span>' +
				"</label>" +
				'<div class="clear-completed">Supprimer les faites</div>';
			objData.clearCompleted = this.clearCompletedButton(data.data);
			objData.filters =
				'<li><a href="#/" class="selected">toutes</a></li>' +
				'<li><a href="#/active">Actives</a></li>' +
				'<li><a href="#/completed">faites</a></li>';
			objData.btnShowList = '<a href="#/lists">Les listes</a>';
			objData.todoCount = this.itemCounter(data.data);
		}

		if (data.titleList) {
			let date = data.dateList ? data.dateList : "";
			objData.toggleAll =
				'<label class="label-date" for="date">Date : </label>' +
				'<input class="new-date" type="date" id="start" name="trip-start" value=' +
				date +
				">" +
				'<div class="clear-completed">Supprimer les faites</div>';
			objData.todoCount = "";
			objData.filters = "";
		}

		return objData;
	};

	/**
	 * Affiche le nombre de todos actives
	 *
	 * @param {number | array} activeTodos Le nombre de todos actives ou le tableau des todos.
	 * @returns {string} String HTML qui contient le nombre
	 */
	Template.prototype.itemCounter = function (activeTodos) {
		if (Array.isArray(activeTodos)) {
			let todoActive = 0;
			for (let i = 0; i < activeTodos.length; i++) {
				const todo = activeTodos[i];
				if (!todo.completed) todoActive++;
			}
			activeTodos = todoActive;
		}
		var plural = activeTodos === 1 ? "" : "s";

		return "<strong>" + activeTodos + "</strong> todo" + plural + " active" + plural;
	};

	/**
	 *
	 * Met à jour le texte "Supprimer les faites" ou ""
	 *
	 * @param  {number | array} completedTodos Le nombre de todos completed ou le tableau des todos.
	 * @returns {string} le texte à afficher : "Suplimer les faites" | ""
	 */
	Template.prototype.clearCompletedButton = function (completedTodos) {
		if (Array.isArray(completedTodos)) {
			let todocompleted = 0;
			for (let i = 0; i < completedTodos.length; i++) {
				const todo = completedTodos[i];
				if (todo.completed) todocompleted++;
			}
			completedTodos = todocompleted;
		}
		if (completedTodos > 0) {
			return "Supprimer les faites";
		} else {
			return "";
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
