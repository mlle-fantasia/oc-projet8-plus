/**
 *
 *
 * Ici l'objet store sert à modifier le localStorage. Dans ce projet, le localstorage représente la base de donnée.
 * l'objet store effectue les actions CRUD Create, Read, Update et Delete
 * @module Store
 *
 *
 *
 */
(function (window) {
	("use strict");

	/**
	 *
	 * Crée un store dans le localstorage du client avec une collection de todo vide s'il n'est existe pas déjà.
	 * Store utilise des callbacks car il n'y a pas de base de donée mais si non il faudrait utiliser des appel ajax
	 *
	 * @param {string} name Nom de la base de donnée
	 * @param {function} callback Le callback
	 * @memberOf module:Store
	 *
	 */
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: [],
				lists: [],
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Trouve les todos qui matchent avec la query passée en paramettre
	 *
	 * @param {object} query La query
	 * @param {function} callback Le callback
	 * @param {string} type "lists", "todos" ou l'id d'une list
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // retourne tous les todo qui ont comme propriété 'foo' === 'bar' && 'hello' === 'world'
	 * });
	 */
	Store.prototype.find = function (query, callback, type) {
		if (!callback) return;
		var dataBase = JSON.parse(localStorage[this._dbName]);

		if (Number.isInteger(parseInt(type))) {
			var listToUpdate = {};
			for (var i = 0; i < dataBase.lists.length; i++) {
				const list = dataBase.lists[i];
				if (list.id === parseInt(type)) {
					listToUpdate = list;
				}
			}
			var items = listToUpdate.todos;
		} else {
			var items = dataBase[type];
		}
		callback.call(
			this,
			items.filter(function (item) {
				for (var q in query) {
					if (query[q] !== item[q]) {
						return false;
					}
				}
				return true;
			})
		);
	};

	/**
	 * Retourne toutes les todos
	 *
	 * @param {function} callback The callback
	 * @param {string} type "lists" ou "todos"
	 */
	Store.prototype.findAll = function (callback, type) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName])[type]);
	};

	/**
	 * Enregistre une todo dans le localstorage, celle passée en paramettre. Si un id est donnée, la fonction trouve et met à jour la todo,
	 * si non, elle ajoute la todo
	 *
	 * @param {object} updateData la todo à enregistrer
	 * @param {string} type le type de l'item : list | todo | id d'une liste
	 * @param {function} callback Le callback
	 * @param {number} id L'id de la todo à mettre à jour
	 */
	Store.prototype.save = function (updateData, type, callback, id) {
		callback = callback || function () {};
		var data = JSON.parse(localStorage[this._dbName]);
		if (Number.isInteger(parseInt(type))) {
			var listToUpdate = {};
			for (var i = 0; i < data.lists.length; i++) {
				const list = data.lists[i];
				if (list.id === parseInt(type)) {
					listToUpdate = list;
				}
			}
			if (id) {
				for (var j = 0; j < listToUpdate.todos.length; j++) {
					const todo = listToUpdate.todos[j];
					if (todo.id === id) {
						for (var key in updateData) {
							todo[key] = updateData[key];
						}
						break;
					}
				}
			} else {
				var newId = Date.now();
				updateData.id = parseInt(newId);
				listToUpdate.todos.push(updateData);
			}
		} else {
			var items = type === "lists" ? data.lists : data.todos;
			// S'il y a un id dans updateData, c'est qu'il faut mettre à jour une data existante sinon c'est qu'il faut en créer une
			if (id) {
				for (var i = 0; i < items.length; i++) {
					if (items[i].id === id) {
						for (var key in updateData) {
							items[i][key] = updateData[key];
						}
						break;
					}
				}
			} else {
				// Generate an ID
				var newId = Date.now();
				// Assign an ID
				updateData.id = parseInt(newId);
				items.push(updateData);
			}
		}
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, [updateData]);
	};

	/**
	 * Supprime une todo du store
	 *
	 * @param {number} id L'ID de la todo à supprimer
	 * @param {function} callback Le callback
	 * @param {string} type "lists" | "todos" | id d'une liste
	 */
	Store.prototype.remove = function (id, callback, type) {
		var dataBase = JSON.parse(localStorage[this._dbName]);

		if (Number.isInteger(parseInt(type))) {
			var listToUpdate = {};
			for (var i = 0; i < dataBase.lists.length; i++) {
				const list = dataBase.lists[i];
				if (list.id === parseInt(type)) {
					listToUpdate = list;
					break;
				}
			}
			var items = listToUpdate.todos;
		} else {
			var items = dataBase[type];
		}

		var itemPosition;

		for (var i = 0; i < items.length; i++) {
			if (items[i].id == id) {
				itemPosition = i;
			}
		}
		items.splice(itemPosition, 1);

		localStorage[this._dbName] = JSON.stringify(dataBase);
		callback.call(this, items);
	};

	/**
	 * Supprime tout le localstorage
	 *
	 * @param {function} callback Le callback
	 */
	Store.prototype.drop = function (callback) {
		var data = { todos: [] };
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);
