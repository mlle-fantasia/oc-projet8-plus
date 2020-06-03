/*global NodeList */
/**
 *
 * Le helper crée des variables globales utiles qui pouront être utilisée dans toute l'application
 *
 * @module Helpers
 * @memberOf module:Helpers
 *
 *
 */
(function (window) {
	("use strict");

	// Get element(s) by CSS selector:
	/**
	 * Crée un racourci querySelector
	 *
	 * @param {object} selector  Le sélecteur
	 * @param {object} scope  Le container où querysélectionner l'élément
	 * @returns l'élément du DOM demandé
	 * @memberOf module:Helpers
	 *
	 *
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	/**
	 * Crée un racourci querySelectorAll
	 *
	 * @param {object} selector  Le sélecteur
	 * @param {object} scope  Le container où querysélectionner les éléments
	 * @returns les éléments du DOM demandés
	 *
	 *
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	// addEventListener wrapper:
	/**
	 * Ajoute un eventListener
	 *
	 * @param {string} target  Le sélecteur
	 * @param {string} type  Le type d'évènement ex : 'click', 'keyup' ...
	 * @param {function} callback  Le callback
	 * @param {boolean} useCapture
	 *
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;
			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === "blur" || type === "focus";

		window.$on(target, type, dispatchEvent, useCapture);
	};

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	/**
	 * trouve le parent de l'élement passé en paramettre et le renvoie ex : $parent(qs('a'), 'div');
	 *
	 * @param {string} element  Le sélecteur
	 * @param {string} tagName
	 *
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
