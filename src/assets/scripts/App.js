import $ from 'jquery';
import DefaultView from './views/DefaultView';

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
        this._defaultView = new DefaultView('.js-default');
    }

}
