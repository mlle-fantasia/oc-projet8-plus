/**
 *
 * Dans un système de programmation MVC, le model gère les données de votre site. Son rôle est d'aller récupérer les informations « brutes » dans la base de données (ici le localstorage),
 * de les organiser et de les assembler pour qu'elles puissent ensuite être traitées par le contrôleur. On y trouve donc entre autres les requêtes SQL.
 *
 *
 * @module Model
 *
 */
(function (window) {
	("use strict");

	/**
	 * Creates a new Model instance and hooks up the storage.
	 *
	 * @constructor
	 * @param {object} storage une instance du localstoge du client
	 * @memberOf module:Model
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * Crée une nouvelle todo et la transmet au store pour l'enregistrer, une fois fait, le callback est exécuté
	 *
	 * @param {string} title Le titre de la todo
	 * @param {function} callback Le callback
	 */
	Model.prototype.create = function (data, callback) {
		if (!data) return;
		callback = callback || function () {};
		if (data.type === "lists") {
			var newItem = {
				title: data.title.trim(),
				date: data.date,
				todos: [],
				listCopiee: "false",
			};
		} else {
			var newItem = {
				title: data.title.trim(),
				completed: false,
			};
		}
		this.storage.save(newItem, data.type, callback);
	};

	/**
	 *
	 * Cherche et retourne une todo (ou plusieurs) trouvée(s) dans le store.
	 * Si vous ne passez pas de query passé en paramettre, la fonction retourne toutes les todo.
	 * Si vous passez une string un nombre ou un objet, la fonction retournera la todo qui matche avec votre query
	 *
	 * @param {string|number|object} query A query to match models against
	 * @param {function} callback Le callback
	 *
	 * @example
	 * model.read(1, func); // retournera la todo avec l'id 1
	 * model.read('1'); // idem
	 * model.read({ foo: 'bar', hello: 'world' }); // retournera la todo avec 'foo' === 'bar' && 'hello' === 'world'
	 */
	Model.prototype.read = function (query, callback, type) {
		var queryType = typeof query;
		callback = callback || function () {};

		if (queryType === "function") {
			callback = query;
			return this.storage.findAll(callback, type);
		} else if (queryType === "string" || queryType === "number") {
			query = parseInt(query, 10);
			this.storage.find({ id: query }, callback, type);
		} else {
			this.storage.find(query, callback, type);
		}
	};

	/**
	 * Met à jour la todo avec l'id passé en paramettre avec les data à mettre à jour, puis appelle le callback
	 *
	 * @param {number} id L'id de la todo
	 * @param {object} data Les propriétés à mettre à jour et leur nouvelle valeur
	 * @param {function} callback Le callback
	 */
	Model.prototype.update = function (id, type, data, callback) {
		this.storage.save(data, type, callback, id);
	};

	/**
	 * Supprime une todo du store
	 *
	 * @param {number} id L'id de la todo
	 * @param {function} callback Le callback
	 */
	Model.prototype.remove = function (id, callback, type) {
		this.storage.remove(id, callback, type);
	};

	/**
	 * Suprime toutes les todo du store
	 *
	 * @param {function} callback Le callback
	 */
	Model.prototype.removeAll = function (callback) {
		this.storage.drop(callback);
	};

	/**
	 * Compte les todos qui se trouvent dans le store, les active les completed et toutes
	 *
	 * @param {function} callback Le callback
	 * @returns {object} un objet avec les trois comptes dedans
	 *
	 * @exemple
	 * var todos = {
	 *   active: 2,
	 *   completed: 3,
	 *   total: 5,
	 * };
	 */
	Model.prototype.getCount = function (callback) {
		var todos = {
			active: 0,
			completed: 0,
			total: 0,
		};

		this.storage.findAll(function (data) {
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		}, "todos");
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
