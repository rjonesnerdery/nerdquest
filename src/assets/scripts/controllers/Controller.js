import $ from 'jquery';
import _ from 'lodash';
import ItemsModel from '../models/ItemsModel';
import ActionView from '../views/ActionView';
import { CONFIG } from '../config';

/**
 * @fileOverview View handles updating the visual elements on the page
 */
export default class Controller {
    /**
     * Construct the view and run initialization
     *
     */
    constructor($element) {
        // If view element isn't on the page
        if (!$element.length) {
            return;
        }

        this.$element = $element;
        this.isEnabled = false;
        this.disabled = '';
        this.defaultPostURL = `${CONFIG.URL_BASE}${CONFIG.URL_POINTS}`;
        this.postURL = this.defaultPostURL;
        this.itemId = '';
        this.userName = '';
        this.baseTarget = '';

        this.auto = {
            post: true,
            buff: false,
            protect: false,
            attack: false,
        };

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

        if (this.$element.data('loop') === false) {
            console.log('loop disabled');
            this.auto.post = false;
        }

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

        if (this.isAuto()) { this.postLoop(); }

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

    createView() {
        this.view = new ActionView(this);
        return this;
    }

    post() {
        const request = this.model.postData(this.postURL, this.itemId);

        request.then(() => {
            this.postLoop();
        });
    }

    postLoop() {
        setTimeout(() =>{
            if (this.isEnabled && this.isAuto()) {
                if (this.disabled !== 'disabled') {
                    this.model.pickItem();
                }
                this.post();
            } else {
                this.postLoop();
            }
        }, CONFIG.REFRESH_SPEED);
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
        this.postURL = url;
        this.itemId = id;
        if (!this.isAuto()) { this.post(); }
        return this;
    }

    clickTimeout() {
        setTimeout(() => {
            this.disabled = '';
            this.updateView();
            return this;
        }, 60 * 1000); //wait 60 seconds
    }

    updateTitle(points) {
        document.title = `${CONFIG.PAGE_TITLE} | ${this.userName} ${points}`;
        return this;
    }

    isAuto() {
        return _.includes(this.auto, true);
    }

    logMessage(message) {
        console.log(message);
        message = message.replace(/</g, '');
        message = message.replace(/>/g, '');
        if (!message.includes('Total points')) {
            this.view.logToConsole(message);
        }

        return this;
    }
}
