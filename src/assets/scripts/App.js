import $ from 'jquery';
import Controller from './controllers/Controller';
import Reindex from './views/Reindex';

/**
 * Application setup
 *
 * @class App
 */
export default class App {
    /**
     * Initialize App on startup
     * @class App
     * @constructor
     */
    constructor() {
        this.init();
    }

    /**
     * Initialize model, view, controller, components, services
     *
     * @method init
     */
    init() {
        this._controller = new Controller($('.js-app'));
        this._reindex = new Reindex($('.js-reindex'));
    }

}
