import $ from 'jquery';

/**
 * @fileOverview View handles updating the visual elements on the page
 */
export default class DefaultView {
    /**
     * Construct the view and run initialization
     *
     * @param element
     */
    constructor(element) {
        /**
         * Check to see if elements are passed in as jQuery objects or strings
         */
        this.$element = (element instanceof $) ? element : $(element);

        this.init();
    }

    /**
     * Initialize the view
     *
     * @method init
     */
    init() {
        this.isEnabled = false;

        return this.setupHandlers()
            .createChildren()
            .layout()
            .enable();
    }

    /**
     * Binds the scope of handler functions
     * Should be run once on view initialization
     *
     * @method setupHandlers
     * @returns {DefaultView}
     */
    setupHandlers() {
        this.handleClick = this.onClick.bind(this);

        return this;
    }

    /**
     * Create any child objects and references to DOM elements
     * Should only be run once on init of the view
     *
     * @method createChildren
     * @returns {DefaultView}
     */
    createChildren() {
        this.trigger = document.getElementsByClassName('js-default');

        return this;
    }

    /**
     * Update the DOM to reflect the current state of the model
     *
     * @method layout
     * @returns {DefaultView}
     */
    layout() {
        $('.js-welcome').text('Welcome to the client-side boilerplate!');
        return this;
    }

    /**
     * Disable, update the DOM, and then re-enable to create handlers for new DOM
     *
     * @method render
     */
    render() {
        this.disable();
        this.layout();
        this.enable();
    }

    /**
     * Enables the view
     * Performs binding to handlers
     * Exits early if already enabled
     *
     * @method enable
     * @returns {DefaultView}
     */
    enable() {
        if (this.isEnabled) {
            return this;
        }

        this.isEnabled = true;

        for (let i = 0; i < this.trigger.length; i++) {
            this.trigger[i].addEventListener('click', this.handleClick);
        }

        return this;
    }

    /**
     * Disables the view
     * Tears down any event binding to handlers
     * Exits early if it is already disabled
     *
     * @method disable
     * @returns {DefaultView}
     */
    disable() {
        if (!this.isEnabled) {
            return this;
        }

        for (let i = 0; i < this.trigger.length; i++) {
            this.trigger[i].removeEventListener('click', this.handleClick);
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
     * @returns {DefaultView}
     */
    destroy() {
        this.disable();

        return this;
    }

    /**
     * Handles click event
     * 
     * @param event
     * @returns {DefaultView}
     */
    onClick(event) {
        const target = event.currentTarget;

        this.render();

        return this;
    }
}
