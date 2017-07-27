import $ from 'jquery';
import ItemsModel from '../models/ItemsModel'
import ActionView from '../views/ActionView'
import { CONFIG } from '../config';
import { delay, postData } from '../util/util';

/**
 * @fileOverview View handles updating the visual elements on the page
 */
export default class Controller {
    /**
     * Construct the view and run initialization
     *
     */
    constructor() {
        this.isEnabled = false;

        this.init();
    }

    /**
     * Initialize the view
     *
     * @method init
     */
    init() {
        return this.createChildren()
                   .enable();
    }


    /**
     * Create any child objects and references to DOM elements
     * Should only be run once on init of the view
     *
     * @method createChildren
     * @returns {ActionView}
     */
    createChildren() {
        this.model = new ItemsModel(this);
        this.view = new ActionView(this);

        return this;
    }

    /**
     * Enables the view
     * Performs binding to handlers
     * Exits early if already enabled
     *
     * @method enable
     * @returns {Controller}
     */
    enable() {
        if (this.isEnabled) {
            return this;
        }

        this.isEnabled = true;

        //this.postLoop();

        return this;
    }

    /**
     * Disables the view
     * Tears down any event binding to handlers
     * Exits early if it is already disabled
     *
     * @method disable
     * @returns {Controller}
     */
    disable() {
        if (!this.isEnabled) {
            return this;
        }

        this.isEnabled = false;

        return this;
    }

    /**
     * Destroys the view
     * Tears down any events, handlers, elements
     * Should be called when the object should be left unused
     *
     * @method destroy
     * @returns {Controller}
     */
    destroy() {
        this.disable();

        return this;
    }

    async postLoop() {
        if (this.isEnabled) {
            this.model.postData(`${CONFIG.URL_BASE}${CONFIG.URL_POINTS}`);

            await delay(CONFIG.REFRESH_SPEED);

            this.postLoop();
        }
    }

    updateView() {
        const count = this.model.count();
        this.view.update(this.model.effects, this.model.items, this.model.badges, count);
        return this;
    }

    updatePoints(points) {
        this.view.updatePoints(points);
        return this;
    }

    useItem(id, target) {
        let url = `${CONFIG.URL_BASE}${CONFIG.URL_ITEM}/${id}`;
        url = target ? `${url}?target=${target}` : url;
        console.log(url);
        this.model.postData(url);
        this.model.removeItem(id);
        return this;
    }
}
